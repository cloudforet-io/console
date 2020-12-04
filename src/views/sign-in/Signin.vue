<template>
    <div>
        <div class="p-4 flex flex-col items-center text-center h-screen w-full wrapper default-theme">
            <div class="m-auto justify-center">
                <div id="sign-in-container" class="bg-primary4 lg rounded-lg p-8 md:p-16 ">
                    <img id="logo" src="@/assets/images/brand/brand_logo.png">
                    <div class="header">
                        <img id="logo-text" src="@/assets/images/brand/SpaceONE_logoTypeA.png">
                    </div>
                    <p v-if="isSignInFailed" class="mt-2 text-red-500 sm leading-normal">
                        {{ $t('COMMON.SIGN_IN.VALIDATION') }}
                    </p>
                    <p v-else class="mt-2 text-sm leading-normal">
                        {{ $t('COMMON.SIGN_IN.TITLE' ) }}
                    </p>
                    <div class="user-info">
                        <component :is="component" @on-sign-in="signIn"
                                   @go-to-admin-sign-in="adminSignIn"
                                   @go-to-user-sign-in="userSignIn"
                        />
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
    toRefs, reactive, computed, defineComponent, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import { setGtagUserID } from '@/lib/gtag';

export default {
    name: 'SignIn',
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
    beforeRouteEnter(to, from, next) {
        if (from.meta.isSignInPage) {
            next((vm) => {
                vm.$router.replace({
                    query: { ...to.query, nextPath: from.query.nextPath },
                }).catch(() => {});
            });
        } else next();
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive<any>({
            userType: computed(() => (props.admin ? 'DOMAIN_OWNER' : 'USER')),
            authSystem: computed(() => vm.$store.getters['domain/getAuthSystem']),
            component: computed(() => {
                let component;
                const auth = state.authSystem;
                try {
                    if (props.admin) component = () => import('./templates/admin/index.vue');
                    else component = () => import(`./templates/${auth}/index.vue`);
                } catch (e) {
                    component = () => import('./templates/local/index.vue');
                }
                return component;
            }),
            version: process.env.VUE_APP_VERSION,
            isSignInFailed: false,
        });
        const signIn = async (credentials) => {
            state.isSignInFailed = false;
            try {
                await vm.$store.dispatch('user/signIn', {
                    domain_id: vm.$store.state.domain.domainId,
                    credentials,
                });
                await vm.$router.push(props.nextPath);
            } catch (e) {
                console.error(e);
                state.isSignInFailed = true;
            }
            setGtagUserID(vm);
        };

        const userSignIn = () => {
            if (props.admin) vm.$router.replace({ name: 'Login' });
        };
        const adminSignIn = () => {
            vm.$router.replace({ name: 'AdminLogin' });
        };
        return {
            ...toRefs(state),
            signIn,
            userSignIn,
            adminSignIn,
        };
    },
};

</script>

<style lang="postcss" scoped>
.wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    bottom: 0;
    overflow: hidden;
    background: url('~@/assets/images/landing/cloudone_console_sign-in_bg.jpg') no-repeat center center fixed;
    background-size: cover;
}

#sign-in-container {
    max-width: 26.5rem;
    height: 39.375rem;
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
