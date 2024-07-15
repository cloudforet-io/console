<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { map } from 'lodash';

import {
    PPaneLayout, PFieldTitle, PButton, PSelectDropdown, PCopyButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useDomainSettingsStore } from '@/store/domain-settings/domain-settings-store';
import { languages, timezoneList } from '@/store/modules/user/config';
import type { LanguageCode } from '@/store/modules/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

const domainConfigStore = useDomainSettingsStore();
const domainConfigGetters = domainConfigStore.getters;
const storeState = reactive({
    domainId: computed<string>(() => store.state.domain.domainId),
    domainName: computed<string>(() => store.state.domain.name),
    domainConfig: computed(() => store.state.domain.config),
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
    config: computed(() => ({
        ...storeState.domainConfig,
        settings: {
            timezone: state.selectedTimezone,
            language: state.selectedLanguage,
        },
    })),
});

/* Event */
const handleSaveChanges = async () => {
    try {
        await domainConfigStore.updateDomainSettings({
            timezone: state.selectedTimezone,
            language: state.selectedLanguage,
        });
        await store.commit('domain/setDomainConfigs', {
            config: state.config,
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
                                   is-filterable
                />
            </div>
            <div class="field-wrapper dropdown">
                <p-field-title :label="$t('IAM.DOMAIN_SETTINGS.LANGUAGE')" />
                <p-select-dropdown :menu="state.languageMenuList"
                                   :selected.sync="state.selectedLanguage"
                                   :page-size="10"
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
