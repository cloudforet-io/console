<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PFieldGroup, PTextInput, PFieldTitle,
} from '@cloudforet/mirinae';

import type { TokenIssueParameters } from '@/schema/identity/token/api-verbs/issue';
import type { TokenIssueModel } from '@/schema/identity/token/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useDomainStore } from '@/store/domain/domain-store';
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
    from '@/services/my-page/components/UserAccountModuleContainer.vue';


const domainStore = useDomainStore();
const state = reactive({
    userId: computed(() => store.state.user.userId),
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
        const response = await SpaceConnector.clientV2.identity.token.issue<TokenIssueParameters, TokenIssueModel>({
            domain_id: domainStore.state.domainId,
            auth_type: 'LOCAL',
            credentials: {
                user_id: state.userId,
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
    } catch (e: any) {
        if (e.code === 'ERROR_PASSWORD_NOT_CHANGED') {
            showErrorMessage(e.message, '');
        } else {
            showErrorMessage(i18n.t('IDENTITY.USER.MAIN.ALT_E_UPDATE_USER'), e);
        }
    }
};
</script>

<template>
    <user-account-module-container
        :title="$t('COMMON.PROFILE.PASSWORD')"
    >
        <div class="change-password-wrapper">
            <form class="form">
                <div class="input-form-wrapper">
                    <p-field-title class="field-title"
                                   :label="$t('COMMON.PROFILE.CURRENT_PASSWORD')"
                                   required
                    />
                    <p-field-group :invalid="validationState.isCurrentPasswordValid"
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
                </div>
                <div class="input-form-wrapper">
                    <p-field-title class="field-title"
                                   :label="$t('COMMON.PROFILE.NEW_PASSWORD')"
                                   required
                    />
                    <p-field-group :invalid="invalidState.password"
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
                </div>
                <div class="input-form-wrapper">
                    <p-field-title class="field-title"
                                   :label="$t('COMMON.PROFILE.CONFIRM_PASSWORD')"
                                   required
                    />
                    <p-field-group :invalid="invalidState.passwordCheck"
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
                </div>
            </form>
            <div class="save-button">
                <p-button style-type="primary"
                          :disabled="currentPassword === '' || password === '' || passwordCheck === ''"
                          @click="handleClickPasswordConfirm"
                >
                    {{ $t('MY_PAGE.ACCOUNT.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
    </user-account-module-container>
</template>

<style lang="postcss" scoped>
.change-password-wrapper {
    max-width: 33.5rem;
    .input-form-wrapper {
        @apply flex flex-wrap justify-between;
        .field-title {
            min-width: 7.75rem;
            flex-shrink: 1;
        }
    }
    .p-text-input {
        width: 25rem;
    }

    @screen mobile {
        .input-form-wrapper {
            @apply flex-col;
        }
        .p-text-input {
            width: 100%;
        }
    }
}

.save-button {
    display: flex;
    margin-top: 0.5rem;
}
</style>
