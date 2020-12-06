<template>
    <div class="wrapper">
        <div class="left-container">
            <div class="logo">
                <img class="logo-character" src="@/assets/images/brand/brand_logo.png">
                <img class="logo-text" src="@/assets/images/brand/spaceone-logotype-with-Service-Type.svg">
            </div>
            <p-lottie name="lottie_floating-astronaut_signin"
                      auto
                      :width="'80%'"
                      :height="'80%'"
                      :margin="'auto'"
            />
            <div class="version">
                <p-badge style-type="primary" outline shape="square">
                    Version {{ version }}
                </p-badge>
                <span class="help-msg">Need help?<span class="text-blue-600 ml-2">Contact us</span></span>
            </div>
        </div>
        <div class="right-container">
            <div class="template-wrapper">
                <p class="sign-in-title">
                    Sign In
                </p>
                <p class="sign-in-subtitle">
                    for member account credentials
                </p>
                <img class="logo-character" src="@/assets/images/brand/brand_logo.png">
                <div v-if="showErrorMessage" class="error-msg-box">
                    <span class="error-msg">Please Confirm your Id or Password.</span>
                    <p-i name="ic_delete" width="1.5rem" height="1.5rem"
                         class="cursor-pointer"
                         color="transparent inherit"
                         @click="hideErrorMessage"
                    />
                </div>
                <local-sign-in />
                <div class="btn-divider">
                    <span>OR</span>
                </div>
                <component :is="component" class="sign-in-template"
                           @on-sign-in="signIn"
                />
                <span class="admin-sign-in-btn" @click="goToAdminSignIn">
                    <p-i name="admin" width="1.5rem" height="1.5rem"
                         class="admin-icon"
                    />
                    Sign in for Domain Admin
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    toRefs, reactive, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import { setGtagUserID } from '@/lib/gtag';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import LocalSignIn from '@/views/sign-in/templates/local.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { getAuth2, googleOauthSignOut } from '@/views/common/pages/SignOut.vue';

export default {
    name: 'SignIn',
    components: {
        PI,
        LocalSignIn,
        PBadge,
        PLottie,
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

        const state = reactive({
            userType: computed(() => (props.admin ? 'DOMAIN_OWNER' : 'USER')),
            authSystem: computed(() => vm.$store.getters['domain/getAuthSystem']),
            component: computed(() => {
                let component;
                const auth = state.authSystem;
                try {
                    component = () => import(`../templates/${auth}.vue`);
                } catch (e) {
                    console.error(e);
                }
                return component;
            }),
            version: process.env.VUE_APP_VERSION,
            showErrorMessage: false,
        });
        const signIn = async (credentials) => {
            state.showErrorMessage = false;
            try {
                await vm.$store.dispatch('user/signIn', {
                    domain_id: vm.$store.state.domain.domainId,
                    credentials,
                });
                await vm.$router.push(props.nextPath);
            } catch (e) {
                const auth2 = await getAuth2(vm.$store.state.domain.authOptions.client_id);
                await googleOauthSignOut(auth2);
                console.error(e);
                state.showErrorMessage = true;
            }
            setGtagUserID(vm);
        };
        const hideErrorMessage = () => {
            state.showErrorMessage = false;
        };
        const goToAdminSignIn = () => {
            vm.$router.replace({ name: 'AdminSignIn' });
        };

        return {
            ...toRefs(state),
            signIn,
            goToAdminSignIn,
            hideErrorMessage,
        };
    },
};
</script>

<style lang="postcss" scoped>
.wrapper {
    display: flex;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    bottom: 0;
}

.left-container {
    @apply bg-primary4;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 33%;
    height: 100%;
    .logo {
        display: flex;
        flex-flow: row;
        .logo-character {
            width: 56px;
            height: 56px;
            margin-top: 2rem;
            margin-left: 2rem;
        }
        .logo-text {
            width: 146px;
            height: 40px;
            margin-top: 2.5rem;
        }
    }
    .version {
        margin-left: 2.5rem;
        margin-bottom: 2.5rem;
        .help-msg {
            @apply text-gray-500;
            font-size: 0.875rem;
            line-height: 140%;
            margin-left: 1rem;
        }
    }

    @media screen and (width < 478px) {
        display: none;
    }

    @media screen and (478px <= width < 768px) {
        display: none;
    }

    @media screen and (768px <= width) {
        display: flex;
    }
}

.right-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    .sign-in-title {
        @apply text-primary1;
        font-size: 2rem;
        line-height: 150%;
    }
    .sign-in-subtitle {
        @apply text-gray-400;
        font-size: 0.875rem;
        line-height: 140%;
        margin-bottom: 3.125rem;
    }
    .logo-character {
        display: none;
    }
    .template-wrapper {
        margin: auto;
        width: 25rem;
        .sign-in-template {
            margin-bottom: 5.5rem;
        }
        .admin-sign-in-btn {
            @apply text-blue-600 cursor-pointer;
            font-size: 0.875rem;
            line-height: 140%;
            .admin-icon {
                margin-right: 0.5rem;
                border-radius: 0.75rem;
            }
        }
    }

    @media screen and (width < 478px) {
        .template-wrapper {
            width: 15rem;
            margin: auto 2.5rem;
            align-self: center;

            .logo-character {
                @apply mx-auto;
                display: block;
                width: 33%;
                margin-bottom: calc((15rem / 3) / 2 - 0.5rem);
            }

            .sign-in-title {
                display: none;
            }

            .sign-in-subtitle {
                display: none;
            }
        }
    }
}
.error-msg-box {
    @apply bg-red-100 text-red-500;
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 2.25rem;
    border-radius: 0.125rem;
    padding: 0.5rem;
    margin-top: -2.75rem;
    .error-msg {
        font-size: 0.875rem;
        line-height: 140%;
    }

    @media screen and (width < 478px) {
        height: 3.5rem;
        width: 15rem;
        position: absolute;
        z-index: 1;
        margin-top: -4rem;
    }
}

.btn-divider {
    @apply text-gray-200;
    display: flex;
    flex-basis: 100%;
    align-items: center;
    font-size: 0.75rem;
    line-height: 120%;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
}
.btn-divider > span {
    @apply text-gray-900;
    margin: 0.5rem;
}
.btn-divider::before,
.btn-divider::after {
    @apply bg-gray-200;
    content: "";
    flex-grow: 1;
    height: 1px;
}
</style>
