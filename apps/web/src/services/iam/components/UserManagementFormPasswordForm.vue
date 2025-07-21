<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import {
    PTextInput, PFieldGroup, PRadio, PDivider, PRadioGroup, PI,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import config from '@/lib/config';
import {
    oneLowerCaseValidator,
    oneNumberValidator,
    oneUpperCaseValidator,
    samePasswordValidator,
} from '@/lib/helper/user-validation-helper';

import { useFormValidator } from '@/common/composables/form-validator';

import { useUserListQuery } from '@/services/iam/composables/use-user-list-query';
import { PASSWORD_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { UserListItemType } from '@/services/iam/types/user-type';


const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;

const selectedUserIds = computed<string[]>(() => userPageState.selectedUserIds);
const { userListData: selectedUsers } = useUserListQuery(selectedUserIds);

const emit = defineEmits<{(e: 'change-input', formState): void}>();

const state = reactive({
    data: computed<UserListItemType>(() => selectedUsers.value?.[0] ?? {}),
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
    passwordStatus: 0,
    passwordTypeArr: computed(() => {
        const additionalItems: any = [];
        if (state.smtpEnabled) {
            additionalItems.push({
                name: PASSWORD_TYPE.RESET,
                label: i18n.t('COMMON.PROFILE.SEND_LINK'),
                disabled: !state.data.email_verified,
            });
        }
        return [
            {
                name: PASSWORD_TYPE.KEEP,
                label: i18n.t('COMMON.PROFILE.KEEP_PASSWORD'),
            },
            ...additionalItems,
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
onMounted(() => {
    state.passwordType = state.passwordTypeArr[0].name;
    emit('change-input', { password: '', passwordType: state.passwordType });
});
</script>

<template>
    <p-field-group :label="$t('COMMON.PROFILE.PASSWORD')"
                   required
                   class="password-form-wrapper"
    >
        <div class="password-form-view">
            <p-radio-group :direction="'vertical'">
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
                    :invalid="invalidState.password"
                    :invalid-text="invalidTexts.password"
                    class="input-form"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="password"
                                      type="password"
                                      autocomplete="current-password"
                                      appearance-type="masking"
                                      block
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
                                      block
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
        <div v-if="!state.data.email_verified"
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
    </p-field-group>
</template>

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
            }
        }
    }
}
.help-text-wrapper {
    margin-top: 1rem;
    .info-icon {
        @apply text-gray-500;
        margin-right: 0.25rem;
    }
    .help-text {
        @apply text-paragraph-sm text-gray-500;
    }
}

</style>
