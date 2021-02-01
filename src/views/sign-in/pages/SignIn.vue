<template>
    <div class="wrapper">
        <div class="left-container">
            <div class="logo">
                <img class="logo-character" src="@/assets/images/brand/brand_logo.png">
                <img class="logo-text" src="@/assets/images/brand/spaceone-logotype-with-Service-Type.svg">
            </div>
            <div class="lottie-wrapper">
                <p-lottie name="lottie_floating-astronaut_signin"
                          auto
                          width="100%"
                          height="80%"
                />
            </div>
            <div class="version">
                <p-badge style-type="primary" outline shape="square">
                    {{ $t('COMMON.SIGN_IN.VERSION') }} {{ version }}
                </p-badge>
                <span class="help-msg">{{ $t('COMMON.SIGN_IN.NEED_HELP') }}
                    <p-anchor href="mailto:support@spaceone.dev" target="_blank"
                              :show-icon="false" highlight
                    >
                        <span class="text-blue-600 ml-2">{{ $t('COMMON.SIGN_IN.CONTACT') }}</span>
                    </p-anchor>
                </span>
            </div>
        </div>
        <div class="right-container">
            <div class="logo">
                <img class="logo-character" src="@/assets/images/brand/brand_logo.png">
                <img class="logo-text" src="@/assets/images/brand/spaceone-logotype-with-Service-Type.svg">
            </div>
            <div class="template-wrapper">
                <p class="sign-in-title">
                    {{ $t('COMMON.SIGN_IN.SIGN_IN') }}
                </p>
                <p class="sign-in-subtitle">
                    {{ $t('COMMON.SIGN_IN.FOR_MEMBER_ACCOUNT') }}
                </p>
                <img class="right-logo-character" src="@/assets/images/brand/brand_logo.png">
                <div v-if="showErrorMessage" class="error-msg-box">
                    <span class="error-msg">{{ $t('COMMON.SIGN_IN.ALT_E_SIGN_IN') }}</span>
                    <p-i name="ic_delete" width="1.5rem" height="1.5rem"
                         class="cursor-pointer"
                         color="transparent inherit"
                         @click="hideErrorMessage"
                    />
                </div>
                <i-d-p-w-sign-in class="id-pw-wrapper" @on-sign-in="signIn" />
                <div v-if="component" class="btn-divider">
                    <span>{{ $t('COMMON.SIGN_IN.OR') }}</span>
                </div>
                <component :is="component" class="sign-in-template"
                           @on-sign-in="signIn"
                />
                <span @click="goToAdminSignIn">
                    <p-i name="admin" width="1.5rem" height="1.5rem"
                         class="admin-icon"
                    />
                    <span class="admin-sign-in-text">{{ $t('COMMON.SIGN_IN.SIGN_IN_FOR_ADMIN') }}</span>
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    toRefs, reactive, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import {
    PButton, PTextInput, PLottie, PBadge, PI, PAnchor,
} from '@spaceone/design-system';

import { store } from '@/store';
import IDPWSignIn from '@/views/sign-in/templates/ID_PW.vue';

import { setGtagUserID } from '@/lib/gtag';
import { getAuth2, googleOauthSignOut } from '@/views/common/pages/SignOut.vue';


export default {
    name: 'SignIn',
    components: {
        PAnchor,
        IDPWSignIn,
        PI,
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
            authType: computed(() => store.state.domain.extendedAuthType),
            component: computed(() => {
                let component;
                const auth = state.authType;
                if (auth) {
                    try {
                        component = () => import(`../templates/${auth}.vue`);
                    } catch (e) {
                        console.error(e);
                    }
                }
                return component;
            }),
            version: process.env.VUE_APP_VERSION,
            showErrorMessage: false,
        });
        const signIn = async (userId, credentials) => {
            state.showErrorMessage = false;
            try {
                await store.dispatch('user/signIn', {
                    domainId: store.state.domain.domainId,
                    userId,
                    userType: 'USER',
                    credentials,
                });
                const hasPermission = vm.$store.getters['user/hasPermission'];
                if (!hasPermission && vm.$route.name !== 'userAccount') {
                    await vm.$router.replace({ name: 'userAccount' });
                } else await vm.$router.push(props.nextPath);
            } catch (e) {
                console.error(e);
                state.showErrorMessage = true;
                const auth2 = await getAuth2(store.state.domain.authOptions.client_id);
                await googleOauthSignOut(auth2);
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

.lottie-wrapper {
    @apply flex justify-center items-center;
    width: 80%;
    max-width: 42.625rem;
    margin: auto;
}

.right-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    .logo {
        display: none;
    }
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
    .right-logo-character {
        display: none;
    }
    .template-wrapper {
        margin: auto;
        width: 25rem;
        .sign-in-template {
            margin-bottom: 5.5rem;
        }
        .admin-sign-in-text {
            @apply text-blue-600 cursor-pointer;
            font-size: 0.875rem;
            line-height: 24px;
            &:hover {
                @apply underline;
            }
        }
        .admin-icon {
            margin-right: 0.5rem;
            border-radius: 0.75rem;
        }
    }

    @media screen and (478px <= width < 768px) {
        .logo {
            display: flex;
        }
    }

    @media screen and (width < 478px) {
        .template-wrapper {
            width: 15rem;
            margin: auto 2.5rem;
            align-self: center;
            .right-logo-character {
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

.id-pw-wrapper {
    margin-bottom: 1.5rem;
}

.btn-divider {
    @apply text-gray-200;
    display: flex;
    flex-basis: 100%;
    align-items: center;
    font-size: 0.75rem;
    line-height: 120%;
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
