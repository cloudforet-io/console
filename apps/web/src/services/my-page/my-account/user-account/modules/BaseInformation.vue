<template>
    <user-account-module-container
        :title="$t('IDENTITY.USER.ACCOUNT.BASE_INFORMATION')"
        class="base-information-wrapper"
    >
        <p-field-group required
                       :label="$t('COMMON.PROFILE.ID')"
                       class="input-form"
        >
            <p-text-input v-model="state.userId"
                          disabled
                          class="text-input"
            />
        </p-field-group>
        <p-field-group required
                       :label="$t('COMMON.PROFILE.NAME')"
                       class="input-form"
        >
            <p-text-input v-model="formState.userName"
                          class="text-input"
            />
        </p-field-group>
        <p-field-group required
                       :label="$t('COMMON.PROFILE.ROLE')"
                       class="input-form"
        >
            <p-text-input v-model="state.userRole"
                          disabled
                          class="text-input"
            />
        </p-field-group>
        <p-field-group required
                       :label="$t('COMMON.PROFILE.TIMEZONE')"
                       class="input-form"
                       :invalid="validationState.showValidation && !!validationState.timezoneInvalidText"
                       :invalid-text="validationState.timezoneInvalidText"
        >
            <template #default="{invalid}">
                <p-filterable-dropdown :menu="state.timezones"
                                       :selected.sync="formState.timezone"
                                       :invalid="invalid"
                                       :placeholder="$t('COMMON.PROFILE.TIMEZONE')"
                                       :page-size="10"
                />
            </template>
        </p-field-group>
        <p-field-group required
                       :label="$t('COMMON.PROFILE.LANGUAGE')"
                       class="input-form"
        >
            <p-select-dropdown v-model="formState.language"
                               :items="state.languages"
                               is-fixed-width
            />
        </p-field-group>
        <div class="save-button">
            <p-button style-type="primary"
                      @click="handleClickProfileConfirm"
            >
                {{ $t('IDENTITY.USER.ACCOUNT.SAVE_CHANGES') }}
            </p-button>
        </div>
    </user-account-module-container>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PButton, PFieldGroup, PSelectDropdown, PTextInput, PFilterableDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { FilterableDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';
import { map } from 'lodash';

import { store } from '@/store';
import { i18n } from '@/translations';

import { languages, timezoneList } from '@/store/modules/user/config';
import type { LanguageCode, UpdateUserRequest } from '@/store/modules/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserAccountModuleContainer
    from '@/services/my-page/my-account/user-account/modules/UserAccountModuleContainer.vue';


const state = reactive({
    userId: computed(() => store.state.user.userId),
    userRole: computed(() => {
        const roleArray = store.getters['user/roleNames'];
        return roleArray.join(', ');
    }),
    languages: map(languages, (d, k) => ({
        type: 'item', label: k === 'en' ? `${d} (default)` : d, name: k,
    })) as MenuItem[],
    timezones: map(timezoneList, (d) => ({
        type: 'item', label: d === 'UTC' ? `${d} (default)` : d, name: d,
    })) as FilterableDropdownMenuItem[],
});
const formState = reactive({
    userName: '' as string | undefined,
    timezone: [] as FilterableDropdownMenuItem[],
    language: '' as LanguageCode | undefined,
});
const validationState = reactive({
    timezoneInvalidText: computed(() => {
        if (!formState.timezone.length) return i18n.t('IDENTITY.USER.FORM.TIMEZONE_INVALID');
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

<style lang="postcss" scoped>
.base-information-wrapper {
    /* custom design-system component - p-field-group */
    :deep(.input-form.p-field-group) {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        max-width: 33.5rem;
        .form-label {
            margin-right: 1rem;
        }
        .invalid-feedback {
            margin-left: 8.5rem;
        }
    }
    .p-text-input,
    .p-select-dropdown,
    .p-filterable-dropdown {
        width: 100%;
        max-width: 25rem;
        flex-shrink: 0;
        flex-grow: 1;
    }
    .save-button {
        display: flex;
        margin-top: 2rem;
    }
}

@screen mobile {
    .p-text-input,
    .p-select-dropdown,
    .p-filterable-dropdown {
        max-width: unset;
    }
}
</style>
