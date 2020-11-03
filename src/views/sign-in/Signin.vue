<template>
    <div>
        <div class="p-4 flex flex-col items-center text-center h-screen w-full wrapper default-theme">
            <div class="m-auto justify-center">
                <div id="login-container" class="bg-primary4 lg rounded-lg p-8 md:p-16 ">
                    <img id="logo" src="@/assets/images/brand/brand_logo.png">
                    <div class="header">
                        <img id="logo-text" src="@/assets/images/brand/SpaceONE_logoTypeA.png">
                    </div>
                    <div class="user-info">
                        <component :is="component" @onLogin="login" />
                    </div>
                </div>
                <p class="version hidden sm:hidden md:block lg:block xl:block">
                    Version {{ version }}
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    toRefs, reactive, computed, defineComponent, getCurrentInstance,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import { setGtagUserID } from '@/lib/gtag';
import { useStore } from '@/store/toolset';
import { api } from '@/lib/api/axios';


interface State {
    component: any;
    loader: () => Promise<any>;
}

interface Credentials {
    // eslint-disable-next-line camelcase
    access_token: string;
    // eslint-disable-next-line camelcase
    refresh_token: string;
}
export default {
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
    setup(props: any, context: any) {
        const vm = (getCurrentInstance() as any);
        const store = useStore();
        store.domain.getDomain(api);

        const state = reactive<any>({
            userType: computed(() => (props.admin ? 'DOMAIN_OWNER' : 'USER')),
            component: computed(() => {
                let authSystem = vm.$store.getters['domain/getAuthSystem'];
                if (props.admin) {
                    authSystem = 'admin';
                }

                let component;
                try {
                    component = () => import(`./templates/${authSystem}/index.vue`);
                } catch (e) {
                    component = () => import('./templates/local/index.vue');
                }
                return component;
            }),
            version: process.env.VUE_APP_VERSION,
        });
        const login = async (userId: string, credentials: Credentials) => {
            store.user.setToken(credentials.refresh_token, credentials.access_token);
            await store.user.setUser(state.userType, userId, vm);
            setGtagUserID(vm, vm.$store);
            await vm.$router.push(props.nextPath);
        };
        return {
            ...toRefs(state),
            login,
        };
    },
};

</script>

<style lang="postcss" scoped>
    @define-mixin background-theme $theme, $background {
        &.$(theme) {
            background: $background;
            background-size: cover;

            /* background-position: center center; */
        }
    }

    .wrapper {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        bottom: 0;
        overflow: hidden;
        background: url('~@/assets/images/landing/cloudone_console_sign-in_bg.jpg') no-repeat center center fixed;
        background-size: cover;

        /* background-color: theme('colors.white'); */
        @mixin background-theme 'default-theme', theme('colors.white');
        @mixin background-theme 'color-theme', theme('colors.gray.default');
        @mixin background-theme 'image-theme', url('~@/assets/images/landing/cloudone_console_sign-in_bg.jpg');
        @mixin background-theme 'video-theme', url('https://thumbs.gfycat.com/SpotlessUnfitCoral-size_restricted.gif'));
    }

    #login-container {
        max-width: 26.5rem;
        bottom: 0;
    }

    #logo {
        display: inline-block;
        text-align: center;
        vertical-align: middle;
        margin: 0 auto;
        width: 100px;
        height: 100px;
    }

    #logo-text {
        text-align: center;
        margin: 0 auto;
        width: 217px;
        height: auto;
    }

    .header {
        padding-top: 1.5rem;
        text-align: center;
        #title {
            font-weight: bold;
            font-size: 1.5rem;
            padding-bottom: 8px;
        }
    }

    .version {
        @apply text-primary3;
        margin-top: 1rem;
        font-size: 0.875rem;
        opacity: 0.75;
    }
</style>
