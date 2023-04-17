<template>
    <div class="password-form">
        <div class="form">
            <div v-if="props.status !== PasswordStatus.RESET">
                <p-field-group :label="$t('AUTH.PASSWORD.FIND.USER_ID')"
                               :invalid="validationState.isIdValid === false"
                               :invalid-text="validationState.idInvalidText"
                               required
                >
                    <template #default="{invalid}">
                        <p-text-input v-model="formState.userId"
                                      :placeholder="!isMobile() ? 'E-mail Address' : 'User ID'"
                                      :invalid="invalid"
                                      block
                                      @update:value="handleChangeInput('userId')"
                                      @keyup.enter="handleChangeInput('userId')"
                        />
                    </template>
                </p-field-group>
            </div>
            <div v-else>
                <p-field-group :label="$t('COMMON.SIGN_IN.PASSWORD')"
                               :invalid="validationState.isPasswordValid === false"
                               :invalid-text="validationState.passwordInvalidText"
                               :help-text="$t('IDENTITY.USER.FORM.MIN_LENGTH_INVALID', { min: 8 })"
                               required
                >
                    <template #default="{invalid}">
                        <p-text-input v-model="formState.password"
                                      type="password"
                                      placeholder="Password"
                                      :invalid="invalid"
                                      block
                                      appearance-type="masking"
                                      @update:value="handleChangeInput('password')"
                                      @keyup.enter="handleChangeInput('password')"
                        />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('AUTH.PASSWORD.RESET.CONFIRM_PASSWORD')"
                               :invalid="validationState.isConfirmPasswordValid === false"
                               :invalid-text="validationState.confirmPasswordInvalidText"
                               required
                >
                    <template #default="{invalid}">
                        <p-text-input v-model="formState.confirmPassword"
                                      type="password"
                                      placeholder="Confirm Password"
                                      :invalid="invalid"
                                      block
                                      appearance-type="masking"
                                      @update:value="handleChangeInput('passwordConfirm')"
                                      @keyup.enter="handleChangeInput('passwordConfirm')"
                        />
                    </template>
                </p-field-group>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Vue } from 'vue/types/vue';

import {
    PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import { isMobile } from '@/lib/helper/cross-browsing-helper';
import {
    oneLowerCaseValidator,
    oneNumberValidator,
    oneUpperCaseValidator, samePasswordValidator,
} from '@/lib/helper/user-validation-helper';

import { PasswordStatus } from '@/services/auth/type';
import type { PasswordFormExpose } from '@/services/auth/type';

interface Props {
    status: string
}

const props = withDefaults(defineProps<Props>(), {
    status: '',
});

const vm = getCurrentInstance()?.proxy as Vue;

const emit = defineEmits(['change-input', 'click-input']);

const formState = reactive({
    userId: '',
    password: '',
    confirmPassword: '',
});
const validationState = reactive({
    isIdValid: undefined as undefined | boolean,
    idInvalidText: '' as TranslateResult | string,
    isPasswordValid: undefined as undefined | boolean,
    passwordInvalidText: vm.$t('IDENTITY.USER.FORM.MIN_LENGTH_INVALID', { min: 8 }) as TranslateResult | string,
    isConfirmPasswordValid: undefined as undefined | boolean,
    confirmPasswordInvalidText: '' as TranslateResult | string,
});

/* Components */
const checkPassword = (password) => {
    if (password === '') {
        validationState.isPasswordValid = true;
        validationState.passwordInvalidText = '';
        return;
    }
    if (!oneLowerCaseValidator(password)) {
        validationState.isPasswordValid = false;
        validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.ONE_LOWER_CASE_INVALID');
    } else if (!oneUpperCaseValidator(password)) {
        validationState.isPasswordValid = false;
        validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.ONE_UPPER_CASE_INVALID');
    } else if (!oneNumberValidator(password)) {
        validationState.isPasswordValid = false;
        validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.ONE_NUMBER_INVALID');
    } else if (formState.confirmPassword !== '' && !samePasswordValidator(password, formState.confirmPassword)) {
        validationState.isConfirmPasswordValid = false;
        validationState.confirmPasswordInvalidText = vm.$t('AUTH.PASSWORD.RESET.NOT_MATCHING');
    } else {
        validationState.isPasswordValid = true;
        validationState.passwordInvalidText = '';
        validationState.isConfirmPasswordValid = true;
        validationState.confirmPasswordInvalidText = '';
    }
};
const checkPasswordCheck = async (confirmPassword) => {
    if (!samePasswordValidator(formState.password, confirmPassword)) {
        validationState.isConfirmPasswordValid = false;
        validationState.confirmPasswordInvalidText = vm.$t('AUTH.PASSWORD.RESET.NOT_MATCHING');
    } else {
        validationState.isConfirmPasswordValid = true;
        validationState.confirmPasswordInvalidText = '';
    }
};
const handleChangeInput = (type: string) => {
    emit('change-input', formState);
    if (type === 'userId') {
        validationState.isIdValid = !(!formState.userId);
    } else if (type === 'password') {
        checkPassword(formState.password);
    } else if (type === 'passwordConfirm') {
        checkPasswordCheck(formState.confirmPassword);
    }
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
