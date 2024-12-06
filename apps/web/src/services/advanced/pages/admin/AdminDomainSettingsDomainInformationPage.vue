<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone, map } from 'lodash';

import {
    PPaneLayout, PFieldTitle, PButton, PSelectDropdown, PCopyButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { useDomainStore } from '@/store/domain/domain-store';
import { usePreferencesStore } from '@/store/preferences/preferences-store';
import { languages, timezoneList } from '@/store/user/constant';
import type { LanguageCode } from '@/store/user/type';
import { useUserStore } from '@/store/user/user-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';


const domainConfigStore = usePreferencesStore();
const domainConfigGetters = domainConfigStore.getters;
const domainStore = useDomainStore();
const userStore = useUserStore();

const route = useRoute();

const storeState = reactive({
    domainId: computed<string>(() => domainStore.state.domainId),
    domainName: computed<string>(() => domainStore.state.name),
    domainConfig: computed(() => domainStore.state.config),
    pageAccessPermissionMap: computed<PageAccessMap>(() => userStore.getters.pageAccessPermissionMap),
});
const state = reactive({
    isChanged: computed(() => {
        if ([state.selectedTimezone, state.selectedLanguage,
            domainConfigGetters.timezone, domainConfigGetters.language]
            .every((d) => !d)) return false;
        return (state.selectedTimezone !== domainConfigGetters.timezone)
            || (state.selectedLanguage !== domainConfigGetters.language);
    }),
    selectedTimezone: undefined as string | undefined,
    selectedLanguage: undefined as LanguageCode | undefined,
    languageMenuList: computed<SelectDropdownMenuItem[]>(() => map(languages, (d, k) => ({
        type: 'item', label: k === 'en' ? `${d} (default)` : d, name: k,
    }))),
    timezoneMenuList: computed<SelectDropdownMenuItem[]>(() => map(timezoneList, (d) => ({
        type: 'item', label: d === 'UTC' ? `${d} (default)` : d, name: d,
    }))),
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
            return '';
        }
        return targetMenuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[state.selectedMenuId]?.write),
});

/* Event */
const handleSaveChanges = async () => {
    try {
        await domainConfigStore.updatePreferences({
            timezone: state.selectedTimezone,
            language: state.selectedLanguage,
        });
        showSuccessMessage(i18n.t('IAM.DOMAIN_SETTINGS.ALT_S_UPDATE_TIMEZONE_AND_LANGUAGE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.DOMAIN_SETTINGS.ALT_E_UPDATE_TIMEZONE_AND_LANGUAGE'));
    }
};

/* Watcher */
watch(() => domainConfigGetters.timezone, (val) => {
    if (val) state.selectedTimezone = val;
}, { immediate: true });
watch(() => domainConfigGetters.language, (val) => {
    state.selectedLanguage = val;
}, { immediate: true });
</script>

<template>
    <p-pane-layout class="admin-domain-settings-domain-information-page">
        <div class="content-wrapper">
            <div class="field-wrapper">
                <p-field-title :label="$t('IAM.DOMAIN_SETTINGS.DOMAIN_ID')" />
                <p class="input-wrapper">
                    {{ storeState.domainId }}
                    <p-copy-button :value="storeState.domainId" />
                </p>
            </div>
            <div class="field-wrapper">
                <p-field-title :label="$t('IAM.DOMAIN_SETTINGS.DOMAIN_NAME')" />
                <p class="input-wrapper">
                    {{ storeState.domainName }}
                    <p-copy-button :value="storeState.domainName" />
                </p>
            </div>
            <div class="field-wrapper dropdown">
                <p-field-title :label="$t('IAM.DOMAIN_SETTINGS.TIMEZONE')" />
                <p-select-dropdown :menu="state.timezoneMenuList"
                                   :selected.sync="state.selectedTimezone"
                                   :page-size="10"
                                   :disabled="!state.hasReadWriteAccess"
                                   is-fixed-width
                                   is-filterable
                />
            </div>
            <div class="field-wrapper dropdown">
                <p-field-title :label="$t('IAM.DOMAIN_SETTINGS.LANGUAGE')" />
                <p-select-dropdown :menu="state.languageMenuList"
                                   :selected.sync="state.selectedLanguage"
                                   :page-size="10"
                                   :disabled="!state.hasReadWriteAccess"
                                   is-filterable
                />
            </div>
        </div>
        <p-button :disabled="!state.hasReadWriteAccess || !state.isChanged"
                  class="save-button"
                  @click="handleSaveChanges"
        >
            {{ $t('IAM.DOMAIN_SETTINGS.SAVE_CHANGES') }}
        </p-button>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.admin-domain-settings-domain-information-page {
    .content-wrapper {
        @apply flex flex-col;
        gap: 1.5rem;
        padding: 1rem;
        .field-wrapper {
            .input-wrapper {
                @apply flex items-center;
                gap: 0.25rem;
                padding-top: 0.25rem;
            }
            .p-field-title {
                padding-bottom: 0.25rem;
            }
        }
        .dropdown {
            width: 15rem;
        }
    }
    .save-button {
        margin: 0.5rem 1rem 3rem;
    }
}
</style>
