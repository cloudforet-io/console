<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import {
    PButton, PIconButton, PFieldGroup, PI, PTextInput, PTextButton,
} from '@cloudforet/mirinae';

import { MULTI_FACTOR_AUTH_TYPE } from '@/schema/identity/user-profile/constant';
import { i18n as _i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';
import CollapsibleContentsEmail from '@/services/auth/components/CollapsibleContentsEmail.vue';
import CollapsibleContentsOTP from '@/services/auth/components/CollapsibleContentsOTP.vue';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';


type TitleType = {
    icon: string;
    title: string;
    desc: TranslateResult;
};

interface Props {
    password: string;
    userId: string;
    mfaEmail?: string;
    mfaType?: string;
    accessToken?: string;
    confirmEvent?: (verificationCode: string) => void;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'confirmed'): void }>();

const router = useRouter();

const state = reactive({
    loading: false,
    isLocalLogin: computed<boolean>(() => (props.userId && !props.accessToken) || false),
    confirmLoading: false,
    isCollapsed: true,
    credentials: computed<Record<string, any>>(() => {
        if (!props.accessToken) {
            return {
                user_id: props.userId,
                password: props.password,
            };
        }
        return {
            access_token: props.accessToken,
        };
    }),
    titleInfo: computed<TitleType>(() => {
        if (props.mfaType === MULTI_FACTOR_AUTH_TYPE.EMAIL) {
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
        await props.confirmEvent?.(validationState.verificationCode);
        emit('confirmed');
        validationState.isVerificationCodeValid = false;
        validationState.verificationCode = '';
    } catch (e: any) {
        validationState.isVerificationCodeValid = true;
        validationState.verificationCodeInvalidText = _i18n.t('COMMON.MFA_MODAL.INVALID_CODE_EMAIL');
    } finally {
        state.confirmLoading = false;
    }
};

onMounted(() => {
    if (state.isLocalLogin) {
        if (!props.userId) {
            router.push({ name: AUTH_ROUTE.SIGN_IN._NAME });
        }
    } else if (!props.accessToken) {
        router.push({ name: AUTH_ROUTE.SIGN_IN._NAME });
    }
});
</script>

<template>
    <div class="mfa-authentication-form">
        <div class="headline-wrapper">
            <p-i :name="state.titleInfo.icon"
                 height="2rem"
                 width="2rem"
            />
            <span>{{ state.titleInfo.title }}</span>
        </div>
        <div class="email-info-wrapper">
            <span class="email-info-desc">{{ state.titleInfo.desc }}</span>
            <span v-if="props.mfaType === MULTI_FACTOR_AUTH_TYPE.EMAIL"
                  class="email-text"
            >
                {{ props.mfaEmail }}
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
            <slot name="toolbox-left" />
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
            <collapsible-contents-email v-if="props.mfaType === MULTI_FACTOR_AUTH_TYPE.EMAIL"
                                        @click-resend="handleClickResend"
            />
            <collapsible-contents-o-t-p v-else />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.mfa-authentication-form {
    @apply relative flex flex-col bg-white;
    width: 100%;
    max-width: 28.5rem;
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
</style>
