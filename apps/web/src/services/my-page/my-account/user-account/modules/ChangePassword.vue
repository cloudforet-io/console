<template>
    <user-account-module-container
        :title="$t('COMMON.PROFILE.PASSWORD')"
        class="change-password-wrapper"
    >
        <form class="form">
            <p-field-group
                :label="$t('COMMON.PROFILE.CURRENT_PASSWORD')"
                required
                :invalid="validationState.isCurrentPasswordValid"
                :invalid-text="validationState.currentPasswordInvalidText"
                class="input-form"
            >
                <template #default="{invalid}">
                    <p-text-input :value="currentPassword"
                                  type="password"
                                  class="text-input"
                                  :invalid="invalid"
                                  @update:value="setForm('currentPassword', $event)"
                    />
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
                                  @update:value="setForm('passwordCheck', $event)"
                    />
                </template>
            </p-field-group>
        </form>
        <div class="save-button">
            <p-button style-type="primary"
                      :disabled="currentPassword === '' || password === '' || passwordCheck === ''"
                      @click="handleClickPasswordConfirm"
            >
                {{ $t('IDENTITY.USER.ACCOUNT.SAVE_CHANGES') }}
            </p-button>
        </div>
    </user-account-module-container>
</template>

<script setup lang="ts">

import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PButton, PFieldGroup, PTextInput } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { UpdateUserRequest } from '@/store/modules/user/type';


import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import {
    oneLowerCaseValidator,
    oneNumberValidator,
    oneUpperCaseValidator,
    samePasswordValidator,
} from '@/lib/helper/user-validation-helper';

import { useFormValidator } from '@/common/composables/form-validator';

import UserAccountModuleContainer
    from '@/services/my-page/my-account/user-account/modules/UserAccountModuleContainer.vue';

const state = reactive({
    userId: computed(() => store.state.user.userId),
    domainId: computed(() => store.state.domain.domainId),
    isCheckedToken: false,
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
    isCurrentPasswordValid: undefined as undefined | boolean,
    currentPasswordInvalidText: '' as TranslateResult,
});

/*  Components */
const resetPasswordForm = () => {
    setForm({
        currentPassword: '',
        password: '',
        passwordCheck: '',
    });
};
const handleClickPasswordConfirm = async () => {
    const userParam: UpdateUserRequest = {
        password: password.value,
    };
    await updateUser(userParam);
    resetPasswordForm();
};

/* API */
const checkCurrentPassword = async () => {
    try {
        const response = await SpaceConnector.client.identity.token.issue({
            domain_id: state.domainId,
            user_id: state.userId,
            credentials: {
                password: currentPassword.value,
            },
        }, { skipAuthRefresh: true });
        if (response.access_token !== '' && response.refresh_token !== '') {
            state.isCheckedToken = true;
        }
        validationState.isCurrentPasswordValid = false;
        validationState.currentPasswordInvalidText = '';
    } catch (e) {
        validationState.isCurrentPasswordValid = true;
        validationState.currentPasswordInvalidText = i18n.t('AUTH.PASSWORD.RESET.NOT_MATCHING');
    }
};
const updateUser = async (userParam: UpdateUserRequest) => {
    try {
        await checkCurrentPassword();
        if (!state.isCheckedToken) return;
        await store.dispatch('user/setUser', userParam);
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_UPDATE_USER'), '');
    } catch (e) {
        showErrorMessage(i18n.t('IDENTITY.USER.MAIN.ALT_E_UPDATE_USER'), e);
    }
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
