<template>
    <div class="wrapper">
        <div class="left-container">
            <div class="logo">
                <img class="logo-character" src="@/assets/images/brand/brand_logo.png">
                <img class="logo-text" src="@/assets/images/brand/spaceone-logotype-with-Service-Type.svg">
            </div>
            <div class="lottie-wrapper">
                <p-lottie name="lottie_planet_signin"
                          auto
                          width="100%"
                          height="80%"
                />
            </div>
            <div class="version">
                <p-badge style-type="primary" outline shape="square">
                    {{ $t('COMMON.SIGN_IN.VERSION') }}  {{ version }}
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
            <div class="admin-wrapper">
                <p class="sign-in-title">
                    {{ $t('COMMON.SIGN_IN.SIGN_IN') }}
                </p>
                <p class="sign-in-subtitle">
                    {{ $t('COMMON.SIGN_IN.SIGN_IN_FOR_ROOT_ACCOUNT') }}
                </p>
                <img class="logo-character" src="@/assets/images/brand/brand_logo.png">
                <div v-if="showErrorMessage" class="error-msg-box">
                    <span class="error-msg">{{ $t('COMMON.SIGN_IN.ALT_E_SIGN_IN') }}</span>
                    <p-i name="ic_delete" width="1.5rem" height="1.5rem"
                         class="cursor-pointer"
                         color="transparent inherit"
                         @click="hideErrorMessage"
                    />
                </div>
                <i-d-p-w-sign-in class="local-sign-in-wrapper"
                                 :is-admin="true"
                                 @on-sign-in="signIn"
                />
                <span class="user-sign-in-btn" @click="goToUserSignIn">
                    <p-i name="ic_arrow_left_sm" width="0.5rem" height="0.5rem"
                         color="inherit transparent"
                         class="mr-2"
                    />
                    {{ $t('COMMON.SIGN_IN.MEMBER_SIGN_IN') }}
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
    PLottie, PBadge, PI, PAnchor,
} from '@spaceone/design-system';

import { TranslateResult } from 'vue-i18n';
import { store } from '@/store';

import IDPWSignIn from '@/views/sign-in/templates/ID_PW.vue';


export default {
    name: 'DomainAdminSignIn',
    components: {
        PAnchor,
        IDPWSignIn,
        PI,
        PBadge,
        PLottie,
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
            version: process.env.VUE_APP_VERSION,
            showErrorMessage: false,
            userId: '' as string | undefined,
            password: '',
        });

        const validationState = reactive({
            isIdValid: undefined as undefined | boolean,
            idInvalidText: '' as TranslateResult | string,
            isPasswordValid: undefined as undefined | boolean,
            passwordInvalidText: '' as TranslateResult | string,
            isPasswordCheckValid: undefined as undefined | boolean,
            passwordCheckInvalidText: '' as TranslateResult | string,
        });
        const signIn = async () => {
            state.showErrorMessage = false;
            try {
                await vm.$router.push(props.nextPath);
            } catch (e) {
                console.error(e);
                state.showErrorMessage = true;
            }
        };
        const hideErrorMessage = () => {
            state.showErrorMessage = false;
        };
        const goToUserSignIn = () => {
            if (props.admin) vm.$router.replace({ name: 'SignIn' });
        };
        return {
            ...toRefs(state),
            ...toRefs(validationState),
            signIn,
            goToUserSignIn,
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
    @apply bg-primary3;
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

.lottie-wrapper {
    @apply flex justify-center items-center;
    width: 80%;
    max-width: 42.625rem;
    margin: auto;
}

.right-container {
    @apply bg-primary4;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
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

.admin-wrapper {
    margin: auto;
    width: 25.0625rem;
    .logo-character {
        display: none;
    }
    .sign-in-title {
        @apply text-primary-dark;
        font-size: 2rem;
        line-height: 150%;
    }
    .sign-in-subtitle {
        @apply text-gray-400;
        font-size: 0.875rem;
        line-height: 140%;
        margin-bottom: 3rem;
    }
    .local-sign-in-wrapper {
        margin-bottom: 5.5rem;
    }
    .user-sign-in-btn {
        @apply text-blue-600 cursor-pointer;
        font-size: 0.875rem;
        line-height: 140%;
        &:hover {
            text-decoration: underline;
        }
    }

    @media screen and (width < 478px) {
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
</style>
