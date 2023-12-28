<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PButton, PCollapsibleToggle, PFieldGroup, PI, PTextInput, PTextButton,
} from '@spaceone/design-system';

import { store } from '@/store';
// CAUTION: To prevent the issue of i18n imported in the template not being applied in the 'script setup' structure.
import { i18n as _i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { loadAuth } from '@/services/auth/authenticator/loader';
import CollapsibleContents from '@/services/auth/components/CollapsibleContents.vue';
import { getDefaultRouteAfterSignIn } from '@/services/auth/helpers/default-route-helper';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';

const route = useRoute();
const router = useRouter();
const userWorkspaceStore = useUserWorkspaceStore();


const {
    password, userId, mfaEmail, authType,
} = route.params;

const credentials = {
    user_id: userId,
    password,
};

const state = reactive({
    loading: false,
    confirmLoading: false,
    domainId: computed(() => store.state.domain.domainId),
    isCollapsed: true,
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

/* API */
const handleClickResend = async () => {
    state.loading = true;
    try {
        await loadAuth().signIn(credentials, authType);
        validationState.verificationCode = '';
    } catch (e: any) {
        if (e.message.includes('MFA')) {
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
        await loadAuth().signIn(credentials, authType, validationState.verificationCode);
        if (store.state.user.requiredActions?.includes('UPDATE_PASSWORD')) {
            await router.push({ name: AUTH_ROUTE.PASSWORD._NAME });
        } else {
            const hasBoundWorkspace = userWorkspaceStore.getters.workspaceList.length > 0;
            const defaultRoute = getDefaultRouteAfterSignIn(store.getters['user/hasSystemRole'], store.getters['user/hasPermission'] || hasBoundWorkspace);
            await router.push(defaultRoute);
        }
        validationState.verificationCode = '';
    } catch (e: any) {
        validationState.isVerificationCodeValid = true;
        validationState.verificationCodeInvalidText = _i18n.t('COMMON.MFA_MODAL.INVALID_CODE');
    } finally {
        state.confirmLoading = false;
    }
};


/* Init */
(() => {
    if (!userId) {
        router.push({ name: AUTH_ROUTE.SIGN_IN._NAME });
    }
})();
</script>

<template>
    <div class="multi-factor-authentication-page">
        <div class="form-wrapper">
            <div class="headline-wrapper">
                <p class="title">
                    {{ $t('AUTH.MFA.TITLE') }}
                </p>
                <p class="subtitle">
                    {{ $t('AUTH.MFA.SUB_TITLE') }}
                </p>
            </div>
            <div class="email-info-wrapper">
                <span class="email-info-desc">
                    <i18n path="AUTH.MFA.EMAIL_INFO">
                        <template #code>
                            <strong>{{ $t('AUTH.MFA.AUTHENTICATION_CODE_LOWER') }}</strong>
                        </template>
                    </i18n>
                </span>
                <div class="email-wrapper">
                    <p-i name="ic_envelope-filled"
                         height="1.125rem"
                         width="1.125rem"
                         color="inherit"
                         class="icon-envelope"
                    />
                    <strong class="email-text">
                        {{ mfaEmail }}
                    </strong>
                </div>
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
            <div>
                <p-collapsible-toggle v-if="state.isCollapsed"
                                      v-model="state.isCollapsed"
                >
                    {{ $t('AUTH.COLLAPSED.EXTENSION_TITLE_1') }}
                </p-collapsible-toggle>
                <collapsible-contents v-else
                                      @click-resend="handleClickResend"
                />
            </div>
            <p-button size="lg"
                      :loading="state.confirmLoading"
                      class="confirm-button"
                      :disabled="validationState.verificationCode === ''"
                      @click="handleClickConfirmButton"
            >
                {{ $t('AUTH.MFA.CONFIRM') }}
            </p-button>
            <p-text-button class="go-back-button mr-2"
                           icon-left="ic_arrow-left"
                           style-type="highlight"
                           size="md"
                           @click="handleClickGoBackButton"
            >
                {{ $t('AUTH.MFA.GO_BACK') }}
            </p-text-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.multi-factor-authentication-page {
    @apply flex flex-col bg-white;
    flex-grow: 1;
    overflow-y: auto;
    padding: 2.5rem;
    .form-wrapper {
        @apply relative flex flex-col;
        width: 100%;
        margin: auto 2.5rem;
        align-self: center;
        gap: 1rem;

        @screen xs {
            width: 25rem;
            margin: auto;
        }
        .headline-wrapper {
            @apply flex flex-col;
            gap: 1rem;
            .title {
                @apply text-display-lg text-primary1;
            }
            .subtitle {
                @apply text-paragraph-md text-gray-700;
            }
        }
        .email-info-wrapper {
            .email-info-desc {
                @apply block text-label-lg text-gray-900;
                margin-bottom: 0.5rem;
            }
            .email-wrapper {
                @apply inline-flex items-center bg-gray-100 rounded;
                width: auto;
                padding: 0.5rem 1rem;
                gap: 0.25rem;
                .icon-envelope {
                    @apply text-gray-700;
                }
                .email-text {
                    @apply text-paragraph-lg;
                }
            }
        }
        .input-form {
            margin-top: 0.5rem;
            .text-input {
                width: 100%;
            }
        }
        .confirm-button {
            margin-top: 1.5rem;
        }
        .go-back-button {
            @apply flex items-center justify-center;
            margin-top: 1.5rem;
            gap: 0.25rem;
        }
    }
}
</style>
