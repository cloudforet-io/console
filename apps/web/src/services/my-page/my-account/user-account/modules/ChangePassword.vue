<template>
    <user-account-module-container
        :title="$t('COMMON.PROFILE.PASSWORD')"
        class="change-password-wrapper"
    >
        <form class="form">
            <p-field-group
                :label="$t('COMMON.PROFILE.CURRENT_PASSWORD')"
                required
                :invalid="validationState.isCurrentPasswordValid === false"
                :invalid-text="validationState.currentPasswordInvalidText"
                class="input-form"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="formState.currentPassword"
                                  type="password"
                                  class="text-input"
                                  :invalid="invalid"
                    />
                </template>
            </p-field-group>
            <p-field-group
                :label="$t('COMMON.PROFILE.NEW_PASSWORD')"
                required
                :invalid="validationState.isPasswordValid === false"
                :invalid-text="validationState.passwordInvalidText"
                class="input-form"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="formState.password"
                                  type="password"
                                  class="text-input"
                                  :invalid="invalid"
                    />
                </template>
            </p-field-group>
            <p-field-group
                :label="$t('COMMON.PROFILE.PASSWORD_CHECK')"
                required
                :invalid="validationState.isPasswordCheckValid === false"
                :invalid-text="validationState.passwordCheckInvalidText"
                class="input-form"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="formState.passwordCheck"
                                  type="password"
                                  class="text-input"
                                  :invalid="invalid"
                    />
                </template>
            </p-field-group>
        </form>
        <div class="save-button">
            <p-button style-type="primary"
                      :disabled="formState.currentPassword === '' || formState.password === '' || formState.passwordCheck === ''"
                      @click="handleClickPasswordConfirm"
            >
                {{ $t('IDENTITY.USER.ACCOUNT.SAVE_CHANGES') }}
            </p-button>
        </div>
    </user-account-module-container>
</template>

<script setup lang="ts">

import { reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PButton, PFieldGroup, PTextInput } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { UpdateUserRequest } from '@/store/modules/user/type';


import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';


import ErrorHandler from '@/common/composables/error/errorHandler';

import { getPasswordValidationInfo } from '@/services/auth/lib/helper';
import UserAccountModuleContainer
    from '@/services/my-page/my-account/user-account/modules/UserAccountModuleContainer.vue';

const formState = reactive({
    currentPassword: '',
    password: '',
    passwordCheck: '',
});

const validationState = reactive({
    isCurrentPasswordValid: undefined as undefined | boolean,
    currentPasswordInvalidText: '' as TranslateResult | string,
    isPasswordValid: undefined as undefined | boolean,
    passwordInvalidText: '' as TranslateResult | string,
    isPasswordCheckValid: undefined as undefined | boolean,
    passwordCheckInvalidText: '' as TranslateResult | string,
    showValidation: false,
});
const resetPasswordForm = () => {
    formState.password = '';
    formState.passwordCheck = '';
};
const updateUser = async (userParam) => {
    try {
        await store.dispatch('user/setUser', userParam);
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_UPDATE_USER'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.MAIN.ALT_E_UPDATE_USER'));
    }
};
const checkPassword = async (password) => {
    const { isValid, invalidText } = getPasswordValidationInfo(password);
    validationState.isPasswordValid = isValid;
    validationState.passwordInvalidText = invalidText;

    if (password !== formState.passwordCheck) {
        validationState.isPasswordCheckValid = false;
        validationState.passwordCheckInvalidText = i18n.t('IDENTITY.USER.FORM.PASSWORD_CHECK_INVALID');
    } else {
        validationState.isPasswordCheckValid = true;
        validationState.passwordCheckInvalidText = '';
    }
};
const handleClickPasswordConfirm = async () => {
    await checkPassword(formState.password);
    if (!(validationState.isPasswordValid && validationState.isPasswordCheckValid)) {
        resetPasswordForm();
        return;
    }
    const userParam: UpdateUserRequest = {
        password: formState.password,
    };
    await updateUser(userParam);
    resetPasswordForm();
};
</script>

<style lang="postcss" scoped>
.change-password-wrapper {
    margin-top: 1rem;

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
    .p-text-input,
    .p-select-dropdown,
    .p-filterable-dropdown {
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
