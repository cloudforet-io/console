<script lang="ts" setup>
import { reactive } from 'vue';

import {
    PHeading, PPaneLayout, PFieldTitle, PButton, PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import { map } from 'lodash';

import { languages, timezoneList } from '@/store/modules/user/config';
import type { LanguageCode } from '@/store/modules/user/type';


const state = reactive({
    isChanged: false,
    timezone: [] as SelectDropdownMenuItem[],
    language: '' as LanguageCode | undefined,
    languages: map(languages, (d, k) => ({
        type: 'item', label: k === 'en' ? `${d} (default)` : d, name: k,
    })) as MenuItem[],
    timezones: map(timezoneList, (d) => ({
        type: 'item', label: d === 'UTC' ? `${d} (default)` : d, name: d,
    })) as SelectDropdownMenuItem[],
});
/* Event */
const handleSaveChanges = () => {
    // TODO: save changes
};
</script>

<template>
    <p-pane-layout>
        <p-heading heading-type="sub"
                   :title="$t('IAM.DOMAIN_SETTINGS.TIMEZONE_AND_LANGUAGE')"
        />
        <div class="content-wrapper">
            <div class="field-wrapper">
                <p-field-title :label="$t('IAM.DOMAIN_SETTINGS.TIMEZONE')" />
                <p-select-dropdown :menu="state.timezones"
                                   :selected.sync="state.timezone"
                                   :page-size="10"
                                   is-filterable
                />
            </div>
            <div class="field-wrapper">
                <p-field-title :label="$t('IAM.DOMAIN_SETTINGS.LANGUAGE')" />
                <p-select-dropdown :menu="state.languages"
                                   :selected.sync="state.language"
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
