<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PButton, PIconButton, PFieldGroup, PI, PTextInput, PTextButton,
} from '@cloudforet/mirinae';

import { MULTI_FACTOR_AUTH_TYPE } from '@/api-clients/identity/user-profile/schema/constant';
import { i18n as _i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';
import CollapsibleContentsEmail from '@/services/auth/components/CollapsibleContentsEmail.vue';
import CollapsibleContentsOTP from '@/services/auth/components/CollapsibleContentsOTP.vue';
import { getDefaultRouteAfterSignIn } from '@/services/auth/helpers/default-route-helper';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';

type TitleType = {
    icon: string;
    title: string;
    desc: TranslateResult;
};

const route = useRoute();
const router = useRouter();
const userWorkspaceStore = useUserWorkspaceStore();
const userStore = useUserStore();

const {
    password, userId, mfaEmail, accessToken, mfaType,
} = route.params;

const state = reactive({
    loading: false,
    isLocalLogin: computed<boolean>(() => (userId && !accessToken) || false),
    confirmLoading: false,
    isCollapsed: true,
    credentials: computed<Record<string, any>>(() => {
        if (!accessToken) {
            return {
                user_id: userId,
                password,
            };
        }
        return {
            access_token: accessToken,
        };
    }),
    titleInfo: computed<TitleType>(() => {
        if (mfaType === MULTI_FACTOR_AUTH_TYPE.EMAIL) {
            return {
                icon: 'ic_notification-protocol_envelope',
                title: 'Email',
                desc: _i18n.t('AUTH.MFA.EMAIL_INFO'),
            };
        }
        return {
            icon: 'ic_microsoft_auth',
            title: 'Microsoft Authenticator App',
            desc: _i18n.t('AUTH.MFA.OTP_INFO'),
        };
    }),
});

const validationState = reactive({
    verificationCode: '',
    isVerificationCodeValid: undefined as undefined | boolean,
    verificationCodeInvalidText: '' as TranslateResult | string,
});

/* Components */
const handleChangeInput = (value: string) => {
    if (validationState.isVerificationCodeValid) {
        validationState.isVerificationCodeValid = false;
        validationState.verificationCodeInvalidText = '';
    }
    validationState.verificationCode = value;
};
const handleClickGoBackButton = () => {
    router.replace({ name: AUTH_ROUTE.SIGN_IN._NAME });
};
const handleClickCollapsedButton = (value: boolean) => {
    state.isCollapsed = value;
};

/* API */
const handleClickResend = async () => {
    state.loading = true;
    try {
        await loadAuth().signIn(state.credentials, 'MFA');
        validationState.verificationCode = '';
    } catch (e: any) {
        if (e.message.includes('MFA') || e.message.includes('Authenticate')) {
            showSuccessMessage(_i18n.t('COMMON.MFA_MODAL.SUCCESS'), '');
        } else {
            showErrorMessage(e.message, e);
            ErrorHandler.handleError(e);
        }
    } finally {
        state.loading = false;
    }
};
const handleClickConfirmButton = async () => {
    state.confirmLoading = true;
    try {
        await loadAuth().signIn(state.credentials, 'MFA', validationState.verificationCode);
        validationState.isVerificationCodeValid = false;
        validationState.verificationCode = '';
        if (userStore.state.requiredActions?.includes('UPDATE_PASSWORD')) {
            await router.push({ name: AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME });
        } else {
            const hasBoundWorkspace = userWorkspaceStore.getters.workspaceList.length > 0;
            const defaultRoute = getDefaultRouteAfterSignIn(hasBoundWorkspace);
            await router.push(defaultRoute).catch(() => {});
        }
    } catch (e: any) {
        validationState.isVerificationCodeValid = true;
        validationState.verificationCodeInvalidText = _i18n.t('COMMON.MFA_MODAL.INVALID_CODE_EMAIL');
    } finally {
        state.confirmLoading = false;
    }
};

onMounted(() => {
    if (state.isLocalLogin) {
        if (!userId) {
            router.push({ name: AUTH_ROUTE.SIGN_IN._NAME });
        }
    } else if (!accessToken) {
        router.push({ name: AUTH_ROUTE.SIGN_IN._NAME });
    }
});
</script>

<template>
    <div class="multi-factor-authentication-page">
        <div class="form-wrapper">
            <div class="headline-wrapper">
                <p-i :name="state.titleInfo.icon"
                     height="2rem"
                     width="2rem"
                />
                <span>{{ state.titleInfo.title }}</span>
            </div>
            <div class="email-info-wrapper">
                <span class="email-info-desc">{{ state.titleInfo.desc }}</span>
                <span v-if="mfaType === MULTI_FACTOR_AUTH_TYPE.EMAIL"
                      class="email-text"
                >
                    {{ mfaEmail }}
                </span>
            </div>
            <p-field-group :label="$t('AUTH.MFA.AUTHENTICATION_CODE')"
                           :invalid="validationState.isVerificationCodeValid"
                           :invalid-text="validationState.verificationCodeInvalidText"
                           required
                           class="input-form"
            >
                <p-text-input :value="validationState.verificationCode"
                              :invalid="validationState.isVerificationCodeValid"
                              :placeholder="$t('AUTH.MFA.ENTER_CODE')"
                              class="text-input"
                              @update:value="handleChangeInput"
                              @keyup.enter="handleClickConfirmButton"
                />
            </p-field-group>
            <p-button size="lg"
                      :loading="state.confirmLoading"
                      class="confirm-button"
                      :disabled="validationState.verificationCode === ''"
                      @click="handleClickConfirmButton"
            >
                {{ $t('AUTH.MFA.CONFIRM') }}
            </p-button>
            <div class="toolbox-wrapper">
                <p-text-button class="go-back-button mr-2"
                               icon-left="ic_arrow-left"
                               style-type="highlight"
                               size="md"
                               @click="handleClickGoBackButton"
                >
                    {{ $t('AUTH.MFA.GO_BACK') }}
                </p-text-button>
                <p-text-button class="go-back-button mr-2"
                               :style-type="state.isCollapsed ? 'highlight' : ''"
                               size="md"
                               :disabled="!state.isCollapsed"
                               @click="handleClickCollapsedButton(false)"
                >
                    {{ $t('AUTH.MFA.PROBLEM_TITLE') }}
                </p-text-button>
            </div>
            <div v-if="!state.isCollapsed"
                 class="collapsible-container"
            >
                <p-icon-button name="ic_close"
                               size="md"
                               class="close-button"
                               @click="handleClickCollapsedButton(true)"
                />
                <collapsible-contents-email v-if="mfaType === MULTI_FACTOR_AUTH_TYPE.EMAIL"
                                            @click-resend="handleClickResend"
                />
                <collapsible-contents-o-t-p v-else />
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.multi-factor-authentication-page {
    @apply flex flex-col;
    width: 100%;
    margin-top: 6rem;
    .form-wrapper {
        @apply relative flex flex-col border border-gray-200 bg-white;
        width: 100%;
        max-width: 28.5rem;
        padding: 2rem;
        align-self: center;
        gap: 0.5rem;
        border-radius: 0.375rem;
        .headline-wrapper {
            @apply flex items-center text-display-md font-bold;
            gap: 0.75rem;
        }
        .email-info-wrapper {
            .email-info-desc {
                @apply block text-label-md;
            }
            .email-text {
                @apply block text-violet-600 font-medium;
                padding-top: 0.25rem;
            }
        }
        .input-form {
            margin-top: 1rem;
            .text-input {
                width: 100%;
            }
        }
        .toolbox-wrapper {
            @apply flex items-center justify-between;
            margin-top: 2rem;
            .go-back-button {
                @apply inline-flex items-center justify-center;
                gap: 0.25rem;
            }
        }
        .collapsible-container {
            @apply relative bg-gray-100 border border-gray-200;
            width: 100%;
            max-width: initial;
            margin-top: 1rem;
            padding: 2rem 1rem 1rem;
            border-radius: 0.375rem;
            .close-button {
                @apply absolute;
                top: 0.5rem;
                right: 1rem;
            }
        }
    }
}
</style>
