<script lang="ts" setup>
import {
    reactive, computed,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import {
    PButton, PTextInput, PFieldGroup, PTextButton,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useDisplayStore } from '@/store/display/display-store';
import { useUserStore } from '@/store/user/user-store';

import config from '@/lib/config';
import { isMobile } from '@/lib/helper/cross-browsing-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';

const router = useRouter();

const userStore = useUserStore();
const displayStore = useDisplayStore();

const state = reactive({
    userId: '' as string | undefined,
    password: '',
    loading: computed(() => userStore.state.isSignInLoading),
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
});

const validationState = reactive({
    isIdValid: undefined as undefined | boolean,
    idInvalidText: '' as TranslateResult,
    isPasswordValid: undefined as undefined | boolean,
    passwordInvalidText: '' as TranslateResult,
    isPasswordCheckValid: undefined as undefined | boolean,
    passwordCheckInvalidText: '' as TranslateResult,
});

const emit = defineEmits<{(e: 'sign-in', userId?: string): void;}>();

const checkUserId = () => {
    if (!state.userId) {
        validationState.isIdValid = false;
        validationState.idInvalidText = i18n.t('COMMON.SIGN_IN.USER_ID_REQUIRED');
    } else {
        validationState.isIdValid = true;
        validationState.idInvalidText = '';
    }
};

const checkPassword = async () => {
    if (state.password.length === 1) {
        displayStore.setIsSignInFailed(false);
    }
    if ((state.password.replace(/ /g, '').length !== state.password.length)
        || !state.password) {
        validationState.isPasswordValid = false;
        validationState.passwordInvalidText = i18n.t('COMMON.SIGN_IN.PASSWORD_REQUIRED');
    } else {
        validationState.isPasswordValid = true;
        validationState.passwordInvalidText = '';
    }
};

const signIn = async () => {
    checkUserId();
    await checkPassword();
    if (!validationState.isIdValid || !validationState.isPasswordValid) {
        return;
    }
    const credentials = {
        password: state.password.trim(),
        user_id: state.userId?.trim(),
    };
    try {
        await loadAuth().signIn(credentials, 'LOCAL');
        displayStore.setIsSignInFailed(false);
        if (userStore.state.requiredActions?.includes('UPDATE_PASSWORD')) {
            await router.push({ name: AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME });
        } else {
            emit('sign-in', state.userId);
        }
    } catch (e: any) {
        if (e.message.includes('MFA')) {
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
            const mfaTypeRegex = /mfa_type\s*=\s*(\w+)/;
            await router.push({
                name: AUTH_ROUTE.SIGN_IN.MULTI_FACTOR_AUTH._NAME,
                params: {
                    password: credentials.password,
                    mfaEmail: e.message.match(emailRegex)[0],
                    mfaType: e.message.match(mfaTypeRegex)[1],
                    userId: state.userId?.trim() as string,
                },
            });
        } else {
            displayStore.setSignInFailedMessage(e.message);
            ErrorHandler.handleError(e);
            displayStore.setIsSignInFailed(true);
        }
        state.password = '';
    }
};

const handleClickResetPassword = async () => {
    await router.push({ name: AUTH_ROUTE.PASSWORD.STATUS.FIND._NAME, query: { status: 'find' } });
};
</script>

<template>
    <div class="local-wrapper">
        <form class="form"
              onsubmit="return false"
        >
            <p-field-group :label="$t('COMMON.SIGN_IN.USER_ID')"
                           :invalid="validationState.isIdValid === false"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input v-model="state.userId"
                                  :placeholder="!isMobile() ? 'Email Address' : 'User ID'"
                                  :invalid="invalid"
                                  block
                                  @update:value="checkUserId"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('COMMON.SIGN_IN.PASSWORD')"
                           required
                           :invalid="validationState.isPasswordValid === false"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="state.password"
                                  type="password"
                                  placeholder="Password"
                                  appearance-type="masking"
                                  :invalid="invalid"
                                  block
                                  skip-mask-toggle-tab-index
                                  @update:value="checkPassword"
                                  @keydown.prevent.enter="signIn"
                    />
                </template>
            </p-field-group>
        </form>
        <div class="util-wrapper">
            <p-text-button v-if="state.smtpEnabled"
                           style-type="highlight"
                           class="reset-pw-button"
                           @click="handleClickResetPassword"
            >
                {{ $t('AUTH.PASSWORD.FIND.FORGOT_PASSWORD') }}
            </p-text-button>
            <p-button style-type="primary"
                      type="submit"
                      size="md"
                      class="sign-in-btn"
                      :loading="state.loading"
                      @click="signIn"
            >
                {{ $t('COMMON.SIGN_IN.SIGN_IN') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-text-input */
:deep(.p-text-input) {
    input:-webkit-autofill {
        transition: background-color 5000s;
        -webkit-box-shadow: 0 0 0 30px white inset !important;
    }
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
        transition: background-color 5000s;
        -webkit-box-shadow: 0 0 0 30px theme('colors.blue.100') inset !important;
    }
    .p-button {
        @apply font-normal text-gray-700;
    }
}
.local-wrapper {
    margin: auto;
    width: 100%;
    .form {
        @apply flex flex-col;
        gap: 1.25rem;
        .p-field-group {
            margin-bottom: 0;
        }
    }
    .input-label {
        @apply text-label-md font-bold text-gray-900 mt-2;
        margin-bottom: 0.375rem;
    }
    .util-wrapper {
        @apply flex flex-col;
        gap: 1.5rem;
        width: 100%;
        margin-top: 1.125rem;
        .reset-pw-button {
            @apply text-label-md text-blue-700;
        }
    }

    @screen tablet {
        .form {
            gap: 1.5rem;
        }
        .util-wrapper {
            gap: 2.5rem;
            margin-top: 1.5rem;
        }
    }

    @screen mobile {
        .p-field-group:deep(label) {
            display: none;
        }
    }
}
</style>
