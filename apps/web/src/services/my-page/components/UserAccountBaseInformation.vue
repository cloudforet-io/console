<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { map } from 'lodash';

import {
    PButton, PFieldGroup, PSelectDropdown, PTextInput, PFieldTitle, PDefinitionTable,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleType } from '@/api-clients/identity/role/type';
import type { UserProfileUpdateParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/update';
import { i18n } from '@/translations';

import { languages, timezoneList } from '@/store/user/constant';
import type { LanguageCode } from '@/store/user/type';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserAccountModuleContainer
    from '@/services/my-page/components/UserAccountModuleContainer.vue';

interface Props {
    readonlyMode?: boolean;
}

const props = defineProps<Props>();

const userStore = useUserStore();
const state = reactive({
    userId: computed<string|undefined>(() => userStore.state.userId),
    userRole: computed<RoleType|undefined>(() => userStore.state.roleType),
    languages: map(languages, (d, k) => ({
        type: 'item', label: k === 'en' ? `${d} (default)` : d, name: k,
    })) as MenuItem[],
    timezones: map(timezoneList, (d) => ({
        type: 'item', label: d === 'UTC' ? `${d} (default)` : d, name: d,
    })) as SelectDropdownMenuItem[],
    roleType: computed<string>(() => {
        if (state.userRole === ROLE_TYPE.DOMAIN_ADMIN) return 'Admin';
        return 'User';
    }),
    loading: false,
    // Read Only Mode
    fields: computed(() => [
        {
            label: i18n.t('COMMON.PROFILE.ID'),
            name: 'id',
        },
        {
            label: i18n.t('COMMON.PROFILE.NAME'),
            name: 'name',
        },
        {
            label: i18n.t('MY_PAGE.ACCOUNT.ADMIN_ROLE'),
            name: 'admin_role',
        },
        {
            label: i18n.t('COMMON.PROFILE.TIMEZONE'),
            name: 'timezone',
        },
        {
            label: i18n.t('COMMON.PROFILE.LANGUAGE'),
            name: 'language',
        },
    ]),
    data: computed(() => {
        const timezone = state.timezones.find((d) => d.name === userStore.state.timezone)?.label || userStore.state.timezone;
        const language = state.languages.find((d) => d.name === userStore.state.language)?.label || userStore.state.language;
        return {
            id: state.userId,
            name: userStore.state.name,
            admin_role: state.roleType,
            timezone,
            language,
        };
    }),
});
const formState = reactive({
    userName: '' as string | undefined,
    timezone: [] as SelectDropdownMenuItem[],
    language: '' as LanguageCode | undefined,
});
const validationState = reactive({
    timezoneInvalidText: computed(() => {
        if (!formState.timezone.length) return i18n.t('MY_PAGE.ACCOUNT.TIMEZONE_INVALID');
        return '';
    }),
    showValidation: false,
});

/* Components */
const getProfile = async () => {
    try {
        formState.userName = userStore.state.name;
        formState.language = userStore.state.language;
        formState.timezone = state.timezones.filter((d) => d.name === userStore.state.timezone);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const handleClickProfileConfirm = async () => {
    if (!validationState.showValidation) validationState.showValidation = true;

    const userParam: UserProfileUpdateParameters = {
        name: formState.userName,
        language: formState.language,
        timezone: formState.timezone[0].name,
    };
    await updateUser(userParam);
};

/* API */
const updateUser = async (userParam: UserProfileUpdateParameters) => {
    state.loading = true;
    try {
        await userStore.updateUser(userParam);
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_UPDATE_USER'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.MAIN.ALT_E_UPDATE_USER'));
    } finally {
        state.loading = false;
    }
};

watch(() => userStore.state.language, (language) => {
    if (language !== formState.language) {
        formState.language = language;
    }
});

/* Init */
(async () => {
    await getProfile();
})();
</script>

<template>
    <user-account-module-container
        :title="$t('MY_PAGE.ACCOUNT.BASE_INFORMATION')"
    >
        <div v-if="props.readonlyMode">
            <p-definition-table style-type="white"
                                :fields="state.fields"
                                :data="state.data"
            />
        </div>
        <div v-else>
            <div class="edit-mode-wrapper">
                <form class="base-information-wrapper">
                    <div class="input-form-wrapper">
                        <p-field-title class="field-title"
                                       :label="$t('COMMON.PROFILE.ID')"
                                       required
                        />
                        <p-field-group class="input-form">
                            <p-text-input v-model="state.userId"
                                          readonly
                                          class="text-input"
                            />
                        </p-field-group>
                    </div>
                    <div class="input-form-wrapper">
                        <p-field-title class="field-title"
                                       :label="$t('COMMON.PROFILE.NAME')"
                                       required
                        />
                        <p-field-group class="input-form">
                            <p-text-input v-model="formState.userName"
                                          class="text-input"
                            />
                        </p-field-group>
                    </div>
                    <div v-if="state.userRole === 'DOMAIN_ADMIN'"
                         class="input-form-wrapper"
                    >
                        <p-field-title class="field-title"
                                       :label="$t('MY_PAGE.ACCOUNT.ADMIN_ROLE')"
                                       required
                        />
                        <p-field-group class="input-form">
                            <p-text-input :value="state.roleType"
                                          class="text-input"
                                          readonly
                            />
                        </p-field-group>
                    </div>
                    <div class="input-form-wrapper">
                        <p-field-title class="field-title"
                                       :label="$t('COMMON.PROFILE.TIMEZONE')"
                                       required
                        />
                        <p-field-group class="input-form"
                                       :invalid="validationState.showValidation && !!validationState.timezoneInvalidText"
                                       :invalid-text="validationState.timezoneInvalidText"
                        >
                            <template #default="{invalid}">
                                <p-select-dropdown :menu="state.timezones"
                                                   :selected.sync="formState.timezone"
                                                   :invalid="invalid"
                                                   :placeholder="$t('COMMON.PROFILE.TIMEZONE')"
                                                   :page-size="10"
                                                   is-filterable
                                                   is-fixed-width
                                                   show-delete-all-button
                                />
                            </template>
                        </p-field-group>
                    </div>
                    <div class="input-form-wrapper">
                        <p-field-title class="field-title"
                                       :label="$t('COMMON.PROFILE.LANGUAGE')"
                                       required
                        />
                        <p-field-group class="input-form">
                            <p-select-dropdown :selected.sync="formState.language"
                                               :menu="state.languages"
                                               is-fixed-width
                            />
                        </p-field-group>
                    </div>
                </form>
                <div class="save-button">
                    <p-button style-type="primary"
                              :loading="state.loading"
                              @click="handleClickProfileConfirm"
                    >
                        {{ $t('MY_PAGE.ACCOUNT.SAVE_CHANGES') }}
                    </p-button>
                </div>
            </div>
        </div>
    </user-account-module-container>
</template>

<style lang="postcss" scoped>
.edit-mode-wrapper {
    padding: 0 1rem;
    .base-information-wrapper {
        max-width: 33.5rem;
        .input-form-wrapper {
            @apply flex flex-wrap items-center;
            margin-bottom: 1rem;
            .field-title {
                min-width: 7.75rem;
                flex-shrink: 1;
            }
        }
        .p-text-input,
        .p-select-dropdown {
            width: 25rem;
        }

        @screen mobile {
            .input-form-wrapper {
                flex-direction: column;
            }
            .p-text-input,
            .p-select-dropdown {
                width: 100%;
            }
        }
    }
    .save-button {
        display: flex;
        margin-top: 0.5rem;
    }
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
