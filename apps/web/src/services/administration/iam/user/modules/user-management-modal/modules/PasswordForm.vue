<template>
    <div>
        <p-field-group :label="userPageState.visibleUpdateModal ? $t('COMMON.PROFILE.PASSWORD') : ''"
                       required
                       class="password-form-wrapper"
        >
            <div class="password-form-view">
                <p-radio-group :direction="userPageState.visibleUpdateModal ? 'vertical' : 'horizontal'">
                    <p-radio v-for="(type, idx) in state.passwordType"
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
                                          :disabled="!state.isManually"
                                          :invalid="invalid"
                                          @update:value="handleChangeInput"
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
                                          :disabled="!state.isManually"
                                          :invalid="invalid"
                                          @update:value="handleChangeChkInput"
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
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PTextInput, PFieldGroup, PRadio, PDivider, PRadioGroup, PI,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import type {
    Validation,
} from '@/services/administration/iam/user/lib/user-form-validations';
import {
    checkEmptyValue, checkMinLength, checkOneLowerCase, checkOneNumber, checkOneUpperCase,
    checkRequiredField,
    checkSamePassword,
} from '@/services/administration/iam/user/lib/user-form-validations';
import type { User } from '@/services/administration/iam/user/type';
import { PasswordType } from '@/services/administration/iam/user/type';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface Props {
    item?: User;
}
const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const emit = defineEmits<{(e: 'change-input', formState): void}>();

const state = reactive({
    passwordStatus: 0,
    passwordType: computed(() => {
        if (userPageState.visibleUpdateModal) {
            return [
                {
                    name: PasswordType.KEEP,
                    label: i18n.t('COMMON.PROFILE.KEEP_PASSWORD'),
                },
                {
                    name: PasswordType.RESET,
                    label: i18n.t('COMMON.PROFILE.SEND_LINK'),
                    disabled: props.item.email_verified === false,
                },
                {
                    name: PasswordType.MANUALLY,
                    label: i18n.t('COMMON.PROFILE.SET_MANUALLY'),
                },
            ];
        }
        return [
            {
                name: PasswordType.RESET,
                label: i18n.t('COMMON.PROFILE.SEND_LINK'),
            },
            {
                name: PasswordType.MANUALLY,
                label: i18n.t('COMMON.PROFILE.SET_MANUALLY'),
            },
        ];
    }),
    isManually: false,
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
const checkPassword = async (password) => {
    const passwordValidation: Validation[] = await Promise.all([
        checkEmptyValue(password),
        checkMinLength(password, 8),
        checkOneLowerCase(password),
        checkOneUpperCase(password),
        checkOneNumber(password),
    ]);
    const passwordInvalidObj = passwordValidation.find((item) => item.invalidText.length > 0);
    if (!passwordInvalidObj) {
        validationState.isPasswordValid = true;
        validationState.passwordInvalidText = '';
    } else {
        validationState.isPasswordValid = passwordInvalidObj.isValid;
        validationState.passwordInvalidText = passwordInvalidObj.invalidText;
    }
};
const checkPasswordCheck = async (password) => {
    const passwordCheckValidation: Validation[] = await Promise.all([
        checkRequiredField(formState.passwordCheck),
        checkSamePassword(formState.passwordCheck, password),
    ]);
    const passwordCheckInvalidObj = passwordCheckValidation.find((item) => item.invalidText.length > 0);
    if (!passwordCheckInvalidObj) {
        validationState.isPasswordCheckValid = true;
        validationState.passwordCheckInvalidText = '';
    } else {
        validationState.isPasswordCheckValid = passwordCheckInvalidObj.isValid;
        validationState.passwordCheckInvalidText = passwordCheckInvalidObj.invalidText;
    }
};
const checkPasswordValidation = async () => {
    await checkPassword(formState.password);
};
const handleChangeInput = async () => {
    await checkPasswordValidation();
    if (validationState.isPasswordValid === false) return;
    emit('change-input', { ...formState, password: formState.password });
};
const handleChangeChkInput = async () => {
    await checkPasswordCheck(formState.password);
    if (validationState.isPasswordCheckValid === false) return;
    emit('change-input', { ...formState, passwordCheck: formState.passwordCheck });
};
const handleClickRadio = (idx: number) => {
    state.isManually = state.passwordType[idx].name === PasswordType.MANUALLY;
    emit('change-input', { ...formState, passwordManual: state.isManually });
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
