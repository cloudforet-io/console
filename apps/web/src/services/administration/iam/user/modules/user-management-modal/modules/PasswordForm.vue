<template>
    <div>
        <p-field-group :label="userPageState.visibleUpdateModal ? $t('COMMON.PROFILE.PASSWORD') : ''"
                       required
                       class="password-form-wrapper"
        >
            <div class="password-form-view">
                <p-radio-group :direction="userPageState.visibleUpdateModal ? 'vertical' : 'horizontal'">
                    <p-radio v-for="(type, idx) in state.passwordTypeArr"
                             :key="type.name"
                             v-model="state.passwordStatus"
                             :value="idx"
                             :disabled="type.disabled"
                             @change="handleClickRadio(idx)"
                    >
                        {{ type.label }}
                    </p-radio>
                </p-radio-group>
                <p-divider />
                <form class="form">
                    <p-field-group
                        :label="$t('COMMON.PROFILE.PASSWORD')"
                        :required="true"
                        :invalid="validationState.isPasswordValid === false"
                        :invalid-text="validationState.passwordInvalidText"
                        class="input-form"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="formState.password"
                                          type="password"
                                          autocomplete="current-password"
                                          appearance-type="masking"
                                          class="text-input"
                                          :disabled="state.passwordType !== PasswordType.MANUALLY"
                                          :invalid="invalid"
                                          @update:value="handleChangeInput('password')"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group
                        :label="$t('COMMON.PROFILE.PASSWORD_CHECK')"
                        :required="true"
                        :invalid="validationState.isPasswordCheckValid === false"
                        :invalid-text="validationState.passwordCheckInvalidText"
                        class="input-form"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="formState.passwordCheck"
                                          type="password"
                                          class="text-input"
                                          autocomplete="new-password"
                                          appearance-type="masking"
                                          :disabled="state.passwordType !== PasswordType.MANUALLY"
                                          :invalid="invalid"
                                          @update:value="handleChangeInput('passwordCheck')"
                            />
                        </template>
                    </p-field-group>
                </form>
            </div>
        </p-field-group>
        <div v-if="userPageState.visibleUpdateModal && !props.item.email_verified"
             class="help-text-wrapper"
        >
            <p-i name="ic_info-circle"
                 height="0.875rem"
                 width="0.875rem"
                 class="info-icon"
                 color="inherit"
            />
            <span class="help-text">{{ $t('COMMON.PROFILE.PASSWORD_HELP_TEXT') }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Vue } from 'vue/types/vue';

import {
    PTextInput, PFieldGroup, PRadio, PDivider, PRadioGroup, PI,
} from '@spaceone/design-system';

import {
    oneLowerCaseValidator,
    oneNumberValidator,
    oneUpperCaseValidator,
    samePasswordValidator,
} from '@/lib/helper/user-validation-helper';

import type { User } from '@/services/administration/iam/user/type';
import { PasswordType } from '@/services/administration/iam/user/type';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface Props {
    item?: User;
    isValidEmail?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    item: undefined,
    isValidEmail: false,
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const vm = getCurrentInstance()?.proxy as Vue;

const emit = defineEmits<{(e: 'change-input', formState): void}>();

const state = reactive({
    passwordStatus: 0,
    passwordTypeArr: computed(() => {
        if (userPageState.visibleUpdateModal) {
            return [
                {
                    name: PasswordType.KEEP,
                    label: vm.$t('COMMON.PROFILE.KEEP_PASSWORD'),
                },
                {
                    name: PasswordType.RESET,
                    label: vm.$t('COMMON.PROFILE.SEND_LINK'),
                    disabled: !props.isValidEmail,
                },
                {
                    name: PasswordType.MANUALLY,
                    label: vm.$t('COMMON.PROFILE.SET_MANUALLY'),
                },
            ];
        }
        return [
            {
                name: PasswordType.RESET,
                label: vm.$t('COMMON.PROFILE.SEND_LINK'),
            },
            {
                name: PasswordType.MANUALLY,
                label: vm.$t('COMMON.PROFILE.SET_MANUALLY'),
            },
        ];
    }),
    passwordType: '',
});
const formState = reactive({
    password: '',
    passwordCheck: '',
});
const validationState = reactive({
    isPasswordValid: undefined as undefined | boolean,
    passwordInvalidText: '' as TranslateResult | string,
    isPasswordCheckValid: undefined as undefined | boolean,
    passwordCheckInvalidText: '' as TranslateResult | string,
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
    } else if (formState.passwordCheck !== '' && !samePasswordValidator(password, formState.passwordCheck)) {
        validationState.isPasswordCheckValid = false;
        validationState.passwordCheckInvalidText = vm.$t('AUTH.PASSWORD.RESET.NOT_MATCHING');
    } else {
        validationState.isPasswordValid = true;
        validationState.passwordInvalidText = '';
        validationState.isPasswordCheckValid = true;
        validationState.passwordCheckInvalidText = '';
    }
};
const checkPasswordCheck = (passwordCheck) => {
    if (!samePasswordValidator(formState.password, passwordCheck)) {
        validationState.isPasswordCheckValid = false;
        validationState.passwordCheckInvalidText = vm.$t('AUTH.PASSWORD.RESET.NOT_MATCHING');
    } else {
        validationState.isPasswordCheckValid = true;
        validationState.passwordCheckInvalidText = '';
    }
};
const handleChangeInput = (type) => {
    if (state.passwordType !== PasswordType.MANUALLY) return;
    if (type === 'password') {
        checkPassword(formState.password);
    } else if (type === 'passwordCheck') {
        checkPasswordCheck(formState.passwordCheck);
    }
    if (validationState.isPasswordValid === false || validationState.isPasswordCheckValid === false) return;
    emit('change-input', {
        ...formState,
        password: formState.password,
        passwordType: state.passwordType,
    });
};
const handleClickRadio = (idx: number) => {
    state.passwordType = state.passwordTypeArr[idx].name;
    emit('change-input', { ...formState, password: '', passwordType: state.passwordType });
    resetForm();
};
const resetForm = () => {
    formState.password = '';
    formState.passwordCheck = '';
    validationState.isPasswordValid = true;
    validationState.passwordInvalidText = '';
    validationState.isPasswordCheckValid = true;
    validationState.passwordCheckInvalidText = '';
};

</script>

<style lang="postcss" scoped>
.password-form-wrapper {
    @apply bg-white rounded-lg;
    margin-bottom: 0;
    padding: 0.75rem;
    .password-form-view {
        @apply flex flex-col;
        gap: 1rem;
        .form {
            @apply flex flex-col;
            gap: 1rem;
            .p-field-group {
                margin-bottom: 0;

                /* custom design-system component - p-text-input */
                :deep(.p-text-input) {
                    width: 100%;
                    .p-button {
                        @apply font-normal;
                    }
                    .input-container {
                        &.disabled {
                            .p-button {
                                @apply bg-transparent;
                            }
                        }
                    }
                }
            }
        }
    }
}
.help-text-wrapper {
    margin-top: 0.25rem;
    .info-icon {
        @apply text-gray-500;
        margin-right: 0.25rem;
    }
    .help-text {
        @apply text-paragraph-sm text-gray-500;
    }
}

</style>
