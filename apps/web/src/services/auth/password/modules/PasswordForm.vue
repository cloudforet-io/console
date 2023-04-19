<template>
    <div class="password-form">
        <div class="form">
            <div v-if="props.status !== PASSWORD_STATUS.RESET">
                <p-field-group :label="$t('AUTH.PASSWORD.FIND.USER_ID')"
                               :invalid="validationState.isIdValid"
                               :invalid-text="validationState.idInvalidText"
                               required
                >
                    <template #default="{invalid}">
                        <p-text-input :value="userIdInput"
                                      :placeholder="!isMobile() ? 'E-mail Address' : 'User ID'"
                                      :invalid="invalid"
                                      block
                                      @update:value="handleChangeInput('userId', $event)"
                                      @keyup.enter="handleClickUtil('userId')"
                        />
                    </template>
                </p-field-group>
            </div>
            <div v-else>
                <p-field-group :label="$t('COMMON.SIGN_IN.PASSWORD')"
                               :invalid="invalidState.passwordInput"
                               :invalid-text="invalidTexts.passwordInput"
                               :help-text="$t('IDENTITY.USER.FORM.MIN_LENGTH_INVALID', { min: 8 })"
                               required
                >
                    <template #default="{invalid}">
                        <p-text-input :value="passwordInput"
                                      type="password"
                                      placeholder="Password"
                                      :invalid="invalid"
                                      block
                                      appearance-type="masking"
                                      @update:value="handleChangeInput('password', $event)"
                                      @keyup.enter="handleClickUtil('password')"
                        />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('AUTH.PASSWORD.RESET.CONFIRM_PASSWORD')"
                               :invalid="invalidState.confirmPasswordInput"
                               :invalid-text="invalidTexts.confirmPasswordInput"
                               required
                >
                    <template #default="{invalid}">
                        <p-text-input :value="confirmPasswordInput"
                                      type="password"
                                      placeholder="Confirm Password"
                                      :invalid="invalid"
                                      block
                                      appearance-type="masking"
                                      @update:value="handleChangeInput('passwordConfirm', $event)"
                                      @keyup.enter="handleClickUtil('passwordConfirm')"
                        />
                    </template>
                </p-field-group>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';


import { isMobile } from '@/lib/helper/cross-browsing-helper';
import {
    oneLowerCaseValidator,
    oneNumberValidator,
    oneUpperCaseValidator, samePasswordValidator,
} from '@/lib/helper/user-validation-helper';

import { useFormValidator } from '@/common/composables/form-validator';

import { PASSWORD_STATUS } from '@/services/auth/type';
import type { PasswordFormExpose } from '@/services/auth/type';

interface Props {
    status: string
}

const props = withDefaults(defineProps<Props>(), {
    status: '',
});

const emit = defineEmits(['change-input', 'click-button']);

const {
    forms: {
        userIdInput,
        passwordInput,
        confirmPasswordInput,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    userIdInput: '',
    passwordInput: '',
    confirmPasswordInput: '',
}, {
    passwordInput(value: string) {
        if (value === '') return '';
        if (!oneLowerCaseValidator(value)) return i18n.t('IDENTITY.USER.FORM.ONE_LOWER_CASE_INVALID');
        if (!oneUpperCaseValidator(value)) return i18n.t('IDENTITY.USER.FORM.ONE_UPPER_CASE_INVALID');
        if (!oneNumberValidator(value)) return i18n.t('IDENTITY.USER.FORM.ONE_NUMBER_INVALID');
        return '';
    },
    confirmPasswordInput(value: string) {
        if (value === '') return '';
        if (!samePasswordValidator(passwordInput.value, value)) return i18n.t('AUTH.PASSWORD.RESET.NOT_MATCHING');
        return '';
    },
});
const validationState = reactive({
    isIdValid: undefined as undefined | boolean,
    idInvalidText: '' as TranslateResult,
});

/* Components */
const handleChangeInput = (type: string, e: string) => {
    if (type === 'userId') {
        if (e === '') {
            validationState.isIdValid = false;
            validationState.idInvalidText = '';
        }
        setForm('userIdInput', e);
    } else if (type === 'password') {
        setForm('passwordInput', e);
    } else if (type === 'passwordConfirm') {
        setForm('confirmPasswordInput', e);
    }
    emit('change-input', { userIdInput, passwordInput, confirmPasswordInput });
};
const handleClickUtil = (type: string) => {
    emit('click-button', type);
};

/* Expose */
defineExpose<PasswordFormExpose>({
    validationState,
});
</script>

<style lang="postcss" scoped>
.password-form {
    width: 100%;
    .form {
        width: 100%;

        /* custom design-system component - p-field-group */
        :deep(.p-field-group) {
            .invalid-feedback {
                @apply text-label-md;
            }
            .help-msg {
                @apply text-paragraph-md;
                margin-top: -0.25rem;
                margin-bottom: 0.25rem;
            }
        }

        /* custom design-system component - p-text-input */
        :deep(.p-text-input) {
            .p-button {
                @apply text-label-sm font-normal;
                width: auto;
            }
        }
    }
}

</style>
