<template>
    <div>
        <div class="flex items-center text-center h-screen w-full wrapper color-theme">
            <div id="login-container" class="w-auto justify-center bg-white lg sm:w-auto md:max-w-sm md:mx-auto">
                <div class="logo">
                    <img src="@/assets/images/brand/brand_logo.png">
                </div>
                <div class="header">
                    <p id="title">
                        Sign in to SPACEONE
                    </p>
                    <p id="subtitle">
                        Welcome to SPACEONE Console
                    </p>
                </div>
                <div class="user-info">
                    <component :is="component" @onLogin="login" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    toRefs, reactive, ref, computed, defineComponent, onMounted, Ref, getCurrentInstance, onBeforeMount, watch,
} from '@vue/composition-api';
import { Route } from 'vue-router';
import PButton from '@/components/atoms/buttons/Button.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';


interface State {
        component: any,
        loader: () => Promise<any>
}

interface Credentials {
    // eslint-disable-next-line camelcase
        access_token:string;
    // eslint-disable-next-line camelcase
        refresh_token:string;
}
export default defineComponent({
    name: 'Login',
    components: {
        PButton,
        PTextInput,
    },
    props: {
        admin: {
            type: Boolean,
            default: false,
        },
        nextPath: {
            type: String,
            default: '/',
        },
    },
    setup(props:any, context:any) {
        const vm = (getCurrentInstance() as any);

        // todo: remove when router props function mode is work
        const routeProps = vm.$route.meta.props(vm.$route);
        const state = reactive<any>({
            // todo: remove when router props function mode is work
            tempAdmin: routeProps.admin,
            tempNextPath: routeProps.nextPath,
            authType: computed(() => {
                if (state.tempAdmin) {
                    return 'admin';
                }
                return vm.$ls.domain.state.authType;
            }),
            component: null,
            userType: computed(() => (state.tempAdmin ? 'DOMAIN_OWNER' : 'USER')),
            loader: computed<()=>Promise<any>>(() => () => import(`./templates/${state.authType}/index.vue`)),
        });

        watch(() => vm.$route, (route: Route, preRoute:Route) => {
            if (route !== preRoute) {
                const parseProps = vm.$route.meta.props(route);
                state.tempAdmin = parseProps.admin;
                state.tempNextPath = parseProps.nextPath;
            }
        });
        watch(() => state.authType, (authType: any, preAuthType:any) => {
            if (authType !== preAuthType) {
                state.loader()
                    .then(() => {
                        state.component = () => state.loader();
                    })
                    .catch(() => {
                        // eslint-disable-next-line import/no-unresolved
                        state.component = () => import('./templates/local/index.vue');
                    });
            }
        });
        onBeforeMount(async () => {
            await vm.$ls.domain.getDomain(vm);

            state.loader()
                .then(() => {
                    state.component = () => state.loader();
                })
                .catch(() => {
                    // eslint-disable-next-line import/no-unresolved
                    state.component = () => import('./templates/local/index.vue');
                });
        });
        const login = async (userId:string, credentials:Credentials) => {
            vm.$ls.user.setToken(credentials.refresh_token, credentials.access_token);
            await vm.$ls.user.setUser(state.userType, userId, vm);
            vm.$router.push(state.tempNextPath);
        };
        return {
            ...toRefs(state),
            login,
        };
    },
});

</script>

<style lang="scss" scoped>

    @mixin background-theme($theme, $background) {
        &.#{$theme} {
            background: $background;
            background-size: cover;
            /*background-position: center center;*/
        }
    }

    .wrapper {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        @include background-theme('default-theme', $white);
        @include background-theme('color-theme', $gray);
        @include background-theme('image-theme', url('~@/assets/images/landing/cloudone_console_sign-in_bg.jpg'));
        @include background-theme('video-theme', url('https://thumbs.gfycat.com/SpotlessUnfitCoral-size_restricted.gif'));
    }

    #login-container {
        background-color: white;
        padding: 24px 16px;
    }

    .logo {
        display:inline-block;
        text-align: center;
        vertical-align: middle;
        margin: 0 auto;
    }

    .header{
        padding-top: 1.5rem;
        text-align: center;
        #title {
            font-weight: bold;
            font-size: 1.5rem;
        }
        #subtitle {
            padding-top: 0.5rem;
            font-weight: normal;
            font-size: 0.875rem;
            padding-bottom: 8px;
        }
    }

    .input-title {
        font-size: 0.875rem;
        font-weight: bold;
        padding-top: 16px;
        padding-bottom: 4px;
    }

    .btn-divider {
        display: flex;
        flex-basis: 100%;
        align-items: center;
        color: $gray2;
        font-style: normal;
        font-weight: bold;
        font-size: 14px;
        margin: 8px 0px;
    }
    .btn-divider::before,
    .btn-divider::after {
        content: "";
        flex-grow: 1;
        background: $gray2;
        height: 1px;
        font-size: 0px;
        line-height: 0px;
        margin: 0px 16px;
    }
</style>
