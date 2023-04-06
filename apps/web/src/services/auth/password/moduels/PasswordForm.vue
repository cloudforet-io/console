<template>
    <div class="password-form">
        <form
            class="form"
            onsubmit="return false"
        >
            <div v-if="passwordPageState.status !== AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME">
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
                                      @keyup.enter="handleClickEnter('userId')"
                        />
                    </template>
                </p-field-group>
            </div>
            <div v-else>
                <p-field-group :label="$t('COMMON.SIGN_IN.PASSWORD')"
                               :invalid="validationState.isPasswordValid === false"
                               :help-text="$t('AUTH.PASSWORD.RESET.DESC')"
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
                                      @keyup.enter="handleClickEnter('password')"
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
                                      @update:value="handleChangeInput('password')"
                                      @keyup.enter="handleClickEnter('password')"
                        />
                    </template>
                </p-field-group>
            </div>
        </form>
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
import { blankValidator } from '@/lib/helper/user-validation-helper';

import { AUTH_ROUTE } from '@/services/auth/route-config';
import { usePasswordPageStore } from '@/services/auth/store/password-page-store';
import type { PasswordFormExpose } from '@/services/auth/type';

const vm = getCurrentInstance()?.proxy as Vue;

const passwordPageStore = usePasswordPageStore();
const passwordPageState = passwordPageStore.$state;

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
    isConfirmPasswordValid: undefined as undefined | boolean,
    confirmPasswordInvalidText: '' as TranslateResult | string,
});

/* Components */
const handleChangeInput = (type: string) => {
    emit('change-input', formState);
    if (type === 'userId') {
        validationState.isIdValid = !(!formState.userId);
    } else if (type === 'password') {
        validationState.isPasswordValid = blankValidator(formState.password);
        if (formState.password !== formState.confirmPassword) {
            validationState.isConfirmPasswordValid = false;
            validationState.confirmPasswordInvalidText = vm.$t('AUTH.PASSWORD.RESET.NOT_MATCHING');
        } else {
            validationState.isConfirmPasswordValid = true;
            validationState.confirmPasswordInvalidText = '';
        }
    }
};
const handleClickEnter = () => {
    emit('click-input', formState);
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
                position: absolute;
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
