<template>
    <div>
        <div class="flex items-center text-center h-screen w-full wrapper default-theme">
            <div id="login-container" class="max-w-md mx-auto justify-center bg-white lg sm:max-w-xl md:max-w-sm md:mx-auto">
                <img id="logo" src="@/assets/images/brand/brand_logo.png">
                <div class="header">
                    <p id="title">
                        Sign in to SPACEONE
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
        console.debug('login!!');
        const vm = (getCurrentInstance() as any);
        vm.$ls.domain.getDomain(vm);

        const state = reactive<any>({
            userType: computed(() => (props.admin ? 'DOMAIN_OWNER' : 'USER')),
            component: computed(() => {
                let authType;
                if (props.admin) {
                    authType = 'admin';
                } else {
                    authType = vm.$ls.domain.state.authType;
                }
                let component;
                try {
                    component = () => import(`./templates/${authType}/index.vue`);
                } catch (e) {
                    component = () => import('./templates/local/index.vue');
                }
                return component;
            }),
        });
        const login = async (userId:string, credentials:Credentials) => {
            vm.$ls.user.setToken(credentials.refresh_token, credentials.access_token);
            await vm.$ls.user.setUser(state.userType, userId, vm);
            vm.$router.push(props.nextPath);
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
        height: auto;
        top: 0;
        bottom: 0;
        overflow: no-display;
        -webkit-overflow-scrolling: touch;
        @include background-theme('default-theme', $white);
        @include background-theme('color-theme', $gray);
        @include background-theme('image-theme', url('~@/assets/images/landing/cloudone_console_sign-in_bg.jpg'));
        @include background-theme('video-theme', url('https://thumbs.gfycat.com/SpotlessUnfitCoral-size_restricted.gif'));
    }

    #login-container {
        background-color: white;
        padding: 24px 16px 10px;
    }

    #logo {
        display:inline-block;
        text-align: center;
        vertical-align: middle;
        margin: 0 auto;
        width: 100px;
        height: 100px;
    }

    .header{
        padding-top: 1.5rem;
        text-align: center;
        #title {
            font-weight: bold;
            font-size: 1.5rem;
            padding-bottom: 8px;
        }
    }

    .input-title {
        font-size: 0.875rem;
        font-weight: bold;
        /*padding-top: 16px;*/
        /*padding-bottom: 4px;*/
    }
</style>
