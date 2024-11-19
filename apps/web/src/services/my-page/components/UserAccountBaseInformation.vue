<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { map } from 'lodash';

import {
    PButton, PFieldGroup, PSelectDropdown, PTextInput, PFieldTitle,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';
import { store } from '@/store';
import { i18n } from '@/translations';

import { languages, timezoneList } from '@/store/modules/user/config';
import type { LanguageCode, UpdateUserRequest } from '@/store/modules/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserAccountModuleContainer
    from '@/services/my-page/components/UserAccountModuleContainer.vue';

const state = reactive({
    userId: computed(() => store.state.user.userId),
    userRole: computed<RoleType>(() => store.state.user.roleType),
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
        formState.userName = store.state.user.name;
        formState.language = store.state.user.language;
        formState.timezone = state.timezones.filter((d) => d.name === store.state.user.timezone);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const handleClickProfileConfirm = async () => {
    if (!validationState.showValidation) validationState.showValidation = true;

    const userParam: UpdateUserRequest = {
        name: formState.userName,
        language: formState.language,
        timezone: formState.timezone[0].name,
    };
    await updateUser(userParam);
};

/* API */
const updateUser = async (userParam: UpdateUserRequest) => {
    try {
        await store.dispatch('user/setUser', userParam);
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_UPDATE_USER'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.MAIN.ALT_E_UPDATE_USER'));
    }
};

watch(() => store.state.user.language, (language) => {
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
        <form class="base-information-wrapper">
            <div class="input-form-wrapper">
                <p-field-title class="field-title"
                               :label="$t('COMMON.PROFILE.ID')"
                               required
                />
                <p-field-group class="input-form">
                    <p-text-input v-model="state.userId"
                                  disabled
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
                                  disabled
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
                      @click="handleClickProfileConfirm"
            >
                {{ $t('MY_PAGE.ACCOUNT.SAVE_CHANGES') }}
            </p-button>
        </div>
    </user-account-module-container>
</template>

<style lang="postcss" scoped>
.base-information-wrapper {
    max-width: 33.5rem;
    .input-form-wrapper {
        @apply flex flex-wrap;
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
            @apply flex-col;
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
</style>
