<script setup lang="ts">
import { reactive, computed } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PFieldGroup, PTextInput, PButtonModal, PScopedNotification,
} from '@cloudforet/mirinae';

import type { TokenIssueParameters } from '@/schema/identity/token/api-verbs/issue';
import type { TokenIssueModel } from '@/schema/identity/token/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useDomainStore } from '@/store/domain/domain-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import {
    oneLowerCaseValidator,
    oneNumberValidator,
    oneUpperCaseValidator,
    samePasswordValidator,
} from '@/lib/helper/user-validation-helper';

import MFAAuthenticationForm from '@/common/components/mfa/components/MFAAuthenticationForm.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { loadAuth } from '@/services/auth/authenticator/loader';
import UserAccountModuleContainer
    from '@/services/my-page/components/UserAccountModuleContainer.vue';


const domainStore = useDomainStore();

/* State */
const state = reactive({
    loading: false,
    disableChangePassword: computed<boolean>(() => {
        if (!!store.state.user.mfa?.options?.enforce && store.state.user.mfa?.state !== 'ENABLED') {
            return true;
        }
        return false;
    }),
    isMfaModalVisible: false,
    isSaveButtonDisabled: computed<boolean>(() => {
        if (validationState.isCurrentPasswordInValid) return true;
        return password.value === '' || passwordCheck.value === '';
    }),
});
const {
    forms: {
        currentPassword,
        password,
        passwordCheck,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    currentPassword: '',
    password: '',
    passwordCheck: '',
}, {
    password(value: string) {
        if (value === '') return '';
        if (!oneLowerCaseValidator(value)) return i18n.t('IDENTITY.USER.FORM.ONE_LOWER_CASE_INVALID');
        if (!oneUpperCaseValidator(value)) return i18n.t('IDENTITY.USER.FORM.ONE_UPPER_CASE_INVALID');
        if (!oneNumberValidator(value)) return i18n.t('IDENTITY.USER.FORM.ONE_NUMBER_INVALID');
        return '';
    },
    passwordCheck(value: string) {
        if (value === '') return '';
        if (!samePasswordValidator(password.value, value)) return i18n.t('AUTH.PASSWORD.RESET.NOT_MATCHING');
        return '';
    },
});
const validationState = reactive({
    isVerified: false,
    isCurrentPasswordInValid: undefined as undefined | boolean,
    currentPasswordInvalidText: '' as TranslateResult,
});

/*  Components */
const resetPasswordForm = () => {
    setForm({
        currentPassword: '',
        password: '',
        passwordCheck: '',
    });
    validationState.isVerified = false;
};
const handleClickVerifyButton = () => {
    // 1. MFA is enforced but not enabled
    if (!!store.state.user.mfa?.options?.enforce && store.state.user.mfa?.state !== 'ENABLED') return;

    // 2. MFA is not enabled
    if (store.state.user.mfa?.state !== 'ENABLED') {
        checkCurrentPassword();
        return;
    }

    // 3. MFA is enabled
    loadAuth().signIn({
        user_id: store.state.user.userId,
        password: currentPassword.value,
    }, 'LOCAL');
    state.isMfaModalVisible = true;
};
const handleClickPasswordConfirm = async () => {
    await updateUser();
};
const handleConfirmMfa = () => {
    state.isMfaModalVisible = false;
};

/* API */
const checkCurrentPassword = async (verificationCode?: string) => {
    try {
        const response = await SpaceConnector.clientV2.identity.token.issue<TokenIssueParameters, TokenIssueModel>({
            domain_id: domainStore.state.domainId,
            auth_type: verificationCode ? 'MFA' : 'LOCAL',
            credentials: {
                user_id: store.state.user.userId,
                password: currentPassword.value,
            },
            verify_code: verificationCode,
        }, { skipAuthRefresh: true });
        if (response.access_token !== '' && response.refresh_token !== '') {
            validationState.isCurrentPasswordInValid = false;
            validationState.currentPasswordInvalidText = '';
            validationState.isVerified = true;
        }
        showSuccessMessage(i18n.t('COMMON.PROFILE.PASSWORD_VERIFIED'), '');
    } catch (e: any) {
        validationState.isCurrentPasswordInValid = true;
        validationState.isVerified = false;
        ErrorHandler.handleRequestError(e, e.message);
    }
};
const updateUser = async () => {
    state.loading = true;
    try {
        if (validationState.isCurrentPasswordInValid) return;
        await store.dispatch('user/setUser', {
            password: password.value,
        });
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_UPDATE_USER'), '');
        resetPasswordForm();
        state.isMfaModalVisible = false;
    } catch (e: any) {
        if (e.code === 'ERROR_PASSWORD_NOT_CHANGED') {
            showErrorMessage(e.message, '');
        } else {
            showErrorMessage(i18n.t('IDENTITY.USER.MAIN.ALT_E_UPDATE_USER'), e);
        }
    } finally {
        state.loading = false;
    }
};
</script>

<template>
    <user-account-module-container
        :title="$t('COMMON.PROFILE.PASSWORD')"
        class="change-password-wrapper"
    >
        <p-scoped-notification v-if="state.disableChangePassword"
                               type="warning"
                               icon="ic_warning-filled"
                               layout="in-section"
                               class="mb-8"
                               :title="$t('COMMON.PROFILE.MFA_NOT_ENABLED_TITLE')"
        />
        <div :class="{ 'disabled': state.disableChangePassword }">
            <p-field-group
                :label="$t('COMMON.PROFILE.CURRENT_PASSWORD')"
                required
                :invalid="validationState.isCurrentPasswordInValid"
                :invalid-text="validationState.currentPasswordInvalidText"
                class="input-form"
            >
                <template #default="{invalid}">
                    <div class="current-password-wrapper">
                        <p-text-input :value="currentPassword"
                                      type="password"
                                      class="text-input"
                                      :invalid="invalid"
                                      :disabled="validationState.isVerified"
                                      @update:value="setForm('currentPassword', $event)"
                        />
                        <p-button style-type="primary"
                                  size="sm"
                                  :disabled="validationState.isVerified || !currentPassword"
                                  @click="handleClickVerifyButton"
                        >
                            {{ $t('COMMON.PROFILE.VERIFY') }}
                        </p-button>
                    </div>
                </template>
            </p-field-group>
            <p-field-group
                :label="$t('COMMON.PROFILE.NEW_PASSWORD')"
                required
                :invalid="invalidState.password"
                :invalid-text="invalidTexts.password"
                class="input-form"
            >
                <template #default="{invalid}">
                    <p-text-input :value="password"
                                  type="password"
                                  class="text-input"
                                  :invalid="invalid"
                                  :disabled="!validationState.isVerified"
                                  @update:value="setForm('password', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group
                :label="$t('COMMON.PROFILE.PASSWORD_CHECK')"
                required
                :invalid="invalidState.passwordCheck"
                :invalid-text="invalidTexts.passwordCheck"
                class="input-form"
            >
                <template #default="{invalid}">
                    <p-text-input :value="passwordCheck"
                                  type="password"
                                  class="text-input"
                                  :invalid="invalid"
                                  :disabled="!validationState.isVerified"
                                  @update:value="setForm('passwordCheck', $event)"
                    />
                </template>
            </p-field-group>
        </div>
        <div class="save-button">
            <p-button style-type="primary"
                      :disabled="state.isSaveButtonDisabled"
                      :loading="state.loading"
                      @click="handleClickPasswordConfirm"
            >
                {{ $t('MY_PAGE.ACCOUNT.SAVE_CHANGES') }}
            </p-button>
        </div>
        <p-button-modal :visible.sync="state.isMfaModalVisible"
                        class="mfa-modal-wrapper"
                        size="sm"
                        hide-footer
        >
            <template #body>
                <m-f-a-authentication-form
                    check-current-password
                    :password="currentPassword"
                    :user-id="store.state.user.userId"
                    :mfa-email="store.state.user.mfa?.mfa_email"
                    :access-token="store.state.user.access_token"
                    :mfa-type="store.state.user.mfa?.mfa_type"
                    :confirm-event="checkCurrentPassword"
                    @confirmed="handleConfirmMfa"
                />
            </template>
        </p-button-modal>
    </user-account-module-container>
</template>

<style lang="postcss" scoped>
.change-password-wrapper {
    margin-top: 1rem;

    .disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .current-password-wrapper {
        display: flex;
        flex: 1;
        align-items: center;
        gap: 0.5rem;
    }

    /* custom design-system component - p-field-group */
    :deep(.input-form.p-field-group) {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        max-width: 33.5rem;
        .form-label {
            margin-right: 0.625rem;
        }
        .invalid-feedback {
            margin-left: 8.5rem;
        }
    }
    .p-text-input {
        width: 100%;
        max-width: 25rem;
        flex-shrink: 0;
        flex-grow: 1;
    }
    .save-button {
        display: flex;
        margin-top: 2rem;
    }
}
</style>
