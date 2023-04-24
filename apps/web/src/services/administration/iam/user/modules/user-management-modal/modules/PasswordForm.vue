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
                        :invalid="invalidState.password"
                        :invalid-text="invalidTexts.password"
                        class="input-form"
                    >
                        <template #default="{invalid}">
                            <p-text-input :value="password"
                                          type="password"
                                          autocomplete="current-password"
                                          appearance-type="masking"
                                          class="text-input password"
                                          :disabled="state.passwordType !== PASSWORD_TYPE.MANUALLY"
                                          :invalid="invalid"
                                          @update:value="handleChangeInput('password', $event)"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group
                        :label="$t('COMMON.PROFILE.PASSWORD_CHECK')"
                        :required="true"
                        :invalid="invalidState.passwordCheck"
                        :invalid-text="invalidTexts.passwordCheck"
                        class="input-form"
                    >
                        <template #default="{invalid}">
                            <p-text-input :value="passwordCheck"
                                          type="password"
                                          class="text-input password-check"
                                          autocomplete="new-password"
                                          appearance-type="masking"
                                          :disabled="state.passwordType !== PASSWORD_TYPE.MANUALLY"
                                          :invalid="invalid"
                                          @update:value="handleChangeInput('passwordCheck', $event)"
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

import {
    PTextInput, PFieldGroup, PRadio, PDivider, PRadioGroup, PI,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import {
    oneLowerCaseValidator,
    oneNumberValidator,
    oneUpperCaseValidator,
    samePasswordValidator,
} from '@/lib/helper/user-validation-helper';

import { useFormValidator } from '@/common/composables/form-validator';

import type { User } from '@/services/administration/iam/user/type';
import { PASSWORD_TYPE } from '@/services/administration/iam/user/type';
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
    passwordTypeArr: computed(() => {
        if (userPageState.visibleUpdateModal) {
            return [
                {
                    name: PASSWORD_TYPE.KEEP,
                    label: i18n.t('COMMON.PROFILE.KEEP_PASSWORD'),
                },
                {
                    name: PASSWORD_TYPE.RESET,
                    label: i18n.t('COMMON.PROFILE.SEND_LINK'),
                },
                {
                    name: PASSWORD_TYPE.MANUALLY,
                    label: i18n.t('COMMON.PROFILE.SET_MANUALLY'),
                },
            ];
        }
        return [
            {
                name: PASSWORD_TYPE.RESET,
                label: i18n.t('COMMON.PROFILE.SEND_LINK'),
            },
            {
                name: PASSWORD_TYPE.MANUALLY,
                label: i18n.t('COMMON.PROFILE.SET_MANUALLY'),
            },
        ];
    }),
    passwordType: '',
});
const {
    forms: {
        password,
        passwordCheck,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
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

/* Components */
const handleChangeInput = (type: string, e: string) => {
    if (state.passwordType !== PASSWORD_TYPE.MANUALLY) return;
    if (type === 'password') {
        setForm('password', e);
    } else if (type === 'passwordCheck') {
        setForm('passwordCheck', e);
    }
    if (invalidState.password === true || invalidState.passwordCheck === true) return;
    emit('change-input', {
        password: password.value,
        passwordType: state.passwordType,
    });
};
const handleClickRadio = (idx: number) => {
    state.passwordType = state.passwordTypeArr[idx].name;
    emit('change-input', { password: '', passwordType: state.passwordType });
    resetForm();
};
const resetForm = () => {
    setForm({
        password: '',
        passwordCheck: '',
    });
};

/* Init */
(async () => {
    state.passwordType = state.passwordTypeArr[0].name;
    emit('change-input', { password: '', passwordType: state.passwordType });
})();

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
