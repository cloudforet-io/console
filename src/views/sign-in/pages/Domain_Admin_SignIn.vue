<template>
    <div class="wrapper">
        <div class="left-container">
            <div class="logo">
                <img class="logo-character" src="@/assets/images/brand/brand_logo.png">
                <img class="logo-text" src="@/assets/images/brand/spaceone-logotype-with-Service-Type.svg">
            </div>
            <p-lottie name="lottie_planet_signin"
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
            <div class="admin-wrapper">
                <p class="sign-in-title">Sign In</p>
                <p class="sign-in-subtitle">for Domain Admin</p>
                <form class="form">
                    <p class="input-label">
                        {{ $t('COMMON.SIGN_IN.ADMIN_ID') }}
                    </p>
                    <p-field-group :invalid-text="idInvalidText"
                                   :invalid="!isIdValid"
                    >
                        <template #default="{invalid}">
                            <p-text-input
                                v-model="userId"
                                placeholder="Admin ID"
                                autocomplete="username"
                                :class="{
                                    'is-invalid':invalid
                                }"
                                class="input-box"
                                @input="checkUserId"
                            />
                        </template>
                    </p-field-group>
                    <p class="input-label">
                        {{ $t('COMMON.SIGN_IN.PASSWORD') }}
                    </p>
                    <p-field-group :invalid-text="passwordInvalidText"
                                   :invalid="!isPasswordValid"
                    >
                        <template v-slot:default="{invalid}">
                            <p-text-input
                                v-model="password"
                                type="password"
                                placeholder="Password"
                                autocomplete="current-password"
                                :class="{
                                    'is-invalid':invalid
                                }"
                                class="input-box"
                                @input="checkPassword"
                                @keyup.enter="signIn"
                            />
                        </template>
                    </p-field-group>
                </form>
                <p-button style-type="primary-dark" type="submit" size="lg"
                          class="sign-in-btn"
                          @click="signIn"
                >
                    <span id="button-msg">{{ $t('COMMON.SIGN_IN.ADMIN_SIGN_IN') }}</span>
                </p-button>
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
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import { setGtagUserID } from '@/lib/gtag';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import { TranslateResult } from 'vue-i18n';
import PI from '@/components/atoms/icons/PI.vue';

export default {
    name: 'DomainAdminSignIn',
    components: {
        PI,
        PBadge,
        PLottie,
        PButton,
        PTextInput,
        PFieldGroup,
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
            version: process.env.VUE_APP_VERSION,
            isSignInFailed: false,
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
        const checkUserId = async () => {
            if (!state.userId) {
                validationState.isIdValid = false;
                validationState.idInvalidText = vm.$t('COMMON.SIGN_IN.USER_ID_REQUIRED');
            } else {
                validationState.isIdValid = true;
                validationState.idInvalidText = '';
            }
        };
        const checkPassword = async () => {
            if ((state.password.replace(/ /g, '').length !== state.password.length)
            || !state.password) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('COMMON.SIGN_IN.PASSWORD_REQUIRED');
            } else {
                validationState.isPasswordValid = true;
                validationState.passwordInvalidText = '';
            }
        };
        const signIn = async () => {
            state.isSignInFailed = false;

            await checkUserId();
            await checkPassword();
            if (!validationState.isIdValid || !validationState.isPasswordValid) {
                return;
            }
            const credentials = {
                user_type: 'DOMAIN_OWNER',
                user_id: state.userId,
                password: state.password,
            };
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
        const goToUserSignIn = () => {
            if (props.admin) vm.$router.replace({ name: 'SignIn' });
        };
        return {
            ...toRefs(state),
            ...toRefs(validationState),
            signIn,
            goToUserSignIn,
            checkUserId,
            checkPassword,
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
}

.version {
    bottom: 0;
}

.right-container {
    @apply bg-primary4;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.admin-wrapper {
    margin: auto;
    width: 25.0625rem;
    .sign-in-title {
        @apply text-primary-dark;
        font-size: 2rem;
        line-height: 150%;
    }
    .sign-in-subtitle {
        @apply text-gray-400;
        font-size: 0.875rem;
        line-height: 140%;
        margin-bottom: 3.125rem;
    }
    .input-label {
        @apply font-bold text-gray-900;
        font-size: 0.875rem;
        line-height: 140%;
        margin-bottom: 0.375rem;
    }
    .input-box {
        width: 100%;
        margin-bottom: 0.625rem;
    }
    .sign-in-btn {
        width: 100%;
        margin-top: 2.5rem;
        margin-bottom: 5.5rem;
    }
    .user-sign-in-btn {
        @apply text-blue-600 cursor-pointer;
        font-size: 0.875rem;
        line-height: 140%;
    }
}
</style>
