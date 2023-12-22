<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PHeading, PPaneLayout, PFieldTitle, PButton, PSelectDropdown,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import { map } from 'lodash';

import { i18n } from '@/translations';

import { useDomainSettingsStore } from '@/store/domain-settings/domain-settings-store';
import { languages, timezoneList } from '@/store/modules/user/config';
import type { LanguageCode } from '@/store/modules/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';


const domainConfigStore = useDomainSettingsStore();
const domainConfigGetters = domainConfigStore.getters;
const state = reactive({
    isChanged: computed(() => {
        if ([state.selectedTimezone[0]?.name, state.selectedLanguage,
            domainConfigGetters.timezone, domainConfigGetters.language]
            .every((d) => !d)) return false;
        return (state.selectedTimezone[0]?.name !== domainConfigGetters.timezone)
            || (state.selectedLanguage !== domainConfigGetters.language);
    }),
    selectedTimezone: [] as SelectDropdownMenuItem[],
    selectedLanguage: undefined as LanguageCode | undefined,
    languageMenuList: map(languages, (d, k) => ({
        type: 'item', label: k === 'en' ? `${d} (default)` : d, name: k,
    })) as SelectDropdownMenuItem[],
    timezoneMenuList: map(timezoneList, (d) => ({
        type: 'item', label: d === 'UTC' ? `${d} (default)` : d, name: d,
    })) as SelectDropdownMenuItem[],
});

/* Event */
const handleSaveChanges = async () => {
    try {
        await domainConfigStore.updateDomainSettings({
            timezone: state.selectedTimezone[0]?.name,
            language: state.selectedLanguage,
        });
        showSuccessMessage(i18n.t('IAM.DOMAIN_SETTINGS.ALT_S_UPDATE_TIMEZONE_AND_LANGUAGE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.DOMAIN_SETTINGS.ALT_E_UPDATE_TIMEZONE_AND_LANGUAGE'));
    }
};

/* Watcher */
watch(() => domainConfigGetters.timezone, (val) => {
    if (val) state.selectedTimezone = [{ name: val }];
}, { immediate: true });
watch(() => domainConfigGetters.language, (val) => {
    state.selectedLanguage = val;
}, { immediate: true });
</script>

<template>
    <p-pane-layout>
        <p-heading heading-type="sub"
                   :title="$t('IAM.DOMAIN_SETTINGS.TIMEZONE_AND_LANGUAGE')"
        />
        <div class="content-wrapper">
            <div class="field-wrapper">
                <p-field-title :label="$t('IAM.DOMAIN_SETTINGS.TIMEZONE')" />
                <p-select-dropdown :menu="state.timezoneMenuList"
                                   :selected.sync="state.selectedTimezone"
                                   :page-size="10"
                                   show-delete-all-button
                                   is-filterable
                />
            </div>
            <div class="field-wrapper">
                <p-field-title :label="$t('IAM.DOMAIN_SETTINGS.LANGUAGE')" />
                <p-select-dropdown :menu="state.languageMenuList"
                                   :selected.sync="state.selectedLanguage"
                                   :page-size="10"
                                   show-delete-all-button
                                   is-filterable
                />
            </div>
        </div>
        <p-button :disabled="!state.isChanged"
                  class="save-button"
                  @click="handleSaveChanges"
        >
            {{ $t('IAM.DOMAIN_SETTINGS.SAVE_CHANGES') }}
        </p-button>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 28.75rem;
    padding: 1rem;
    .field-wrapper {
        .p-field-title {
            padding-bottom: 0.25rem;
        }
    }
}
.save-button {
    margin: 1.25rem 1rem;
}
</style>
