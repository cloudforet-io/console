<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PFieldGroup, PTextInput, PFieldTitle, PDefinitionTable,
} from '@cloudforet/mirinae';

import type { UserProfileUpdatePasswordParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/update-password';
import { i18n } from '@/translations';

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

interface Props {
    readonlyMode?: boolean;
    certifiedPassword: string;
}

const props = defineProps<Props>();

const state = reactive({
    loading: false,
    currentPassword: '',
    // Read Only Mode
    fields: computed(() => [
        {
            label: i18n.t('COMMON.PROFILE.PASSWORD'),
            name: 'password',
        },
    ]),
    data: computed(() => ({
        password: '****************',
    })),
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

/*  Components */
const resetPasswordForm = () => {
    setForm({
        password: '',
        passwordCheck: '',
    });
};
const handleClickPasswordConfirm = async () => {
    const userParam: UserProfileUpdatePasswordParameters = {
        new_password: password.value,
        current_password: state.currentPassword,
    };
    await updateUser(userParam);
    resetPasswordForm();
};

/* API */
const updateUser = async (userParam: UserProfileUpdatePasswordParameters) => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.identity.userProfile.updatePassword<UserProfileUpdatePasswordParameters>(userParam);
        state.currentPassword = userParam.new_password;
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_UPDATE_USER'), '');
    } catch (e: any) {
        if (e.code === 'ERROR_PASSWORD_NOT_CHANGED') {
            showErrorMessage(e.message, '');
        } else {
            showErrorMessage(i18n.t('IDENTITY.USER.MAIN.ALT_E_UPDATE_USER'), e);
        }
    } finally {
        state.loading = false;
    }
};

watch(() => props.certifiedPassword, (certifiedPassword) => {
    state.currentPassword = certifiedPassword;
});

</script>

<template>
    <user-account-module-container
        :title="$t('COMMON.PROFILE.PASSWORD')"
    >
        <div v-if="props.readonlyMode">
            <p-definition-table style-type="white"
                                disable-copy
                                :fields="state.fields"
                                :data="state.data"
            />
        </div>
        <div v-else
             class="change-password-wrapper"
        >
            <form class="form">
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
                          :disabled="password === '' || passwordCheck === ''"
                          :loading="state.loading"
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
    padding: 0 1rem;
    max-width: 35.5rem;
    .input-form-wrapper {
        @apply flex flex-wrap items-center justify-between;
        margin-bottom: 1rem;
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
            flex-direction: column;
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

/* custom design-system component - p-definition-table */
:deep(.p-definition-table) {
    min-height: unset;
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: unset;
}
</style>
