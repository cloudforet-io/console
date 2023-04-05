<template>
    <div class="password-form">
        <form v-if="props.status !== AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME"
              class="form"
        >
            <p-field-group :label="$t('AUTH.PASSWORD.FIND.USER_ID')"
                           :invalid="validationState.isIdValid === false"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input v-model="formState.userId"
                                  :placeholder="!isMobile() ? 'E-mail Address' : 'User ID'"
                                  :invalid="invalid"
                                  block
                                  @update:value="checkUserId"
                    />
                </template>
            </p-field-group>
        </form>
        <form v-else
              class="form"
        >
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
                                  @update:value="checkPassword"
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
                                  @update:value="checkConfirmPassword"
                    />
                </template>
            </p-field-group>
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

import { AUTH_ROUTE } from '@/services/auth/route-config';

interface Props {
    status: string
}
const props = withDefaults(defineProps<Props>(), {
    status: '',
});
const emit = defineEmits<{(e: 'change-input', formState): void;}>();
const formState = reactive({
    userId: '',
    password: '',
    confirmPassword: '',
});
const validationState = reactive({
    isIdValid: undefined as undefined | boolean,
    isPasswordValid: undefined as undefined | boolean,
    isConfirmPasswordValid: undefined as undefined | boolean,
    confirmPasswordInvalidText: '' as TranslateResult | string,
});
const vm = getCurrentInstance()?.proxy as Vue;

const checkUserId = () => {
    emit('change-input', formState);
    validationState.isIdValid = !(!formState.userId);
};
const checkPassword = async () => {
    emit('change-input', formState);
    validationState.isPasswordValid = !((formState.password.replace(/ /g, '').length !== formState.password.length)
        || !formState.password);
};
const checkConfirmPassword = () => {
    emit('change-input', formState);
    if (formState.password !== formState.confirmPassword) {
        validationState.isConfirmPasswordValid = false;
        validationState.confirmPasswordInvalidText = vm.$t('AUTH.PASSWORD.RESET.NOT_MATCHING');
    } else {
        validationState.isConfirmPasswordValid = true;
        validationState.confirmPasswordInvalidText = '';
    }
};
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
