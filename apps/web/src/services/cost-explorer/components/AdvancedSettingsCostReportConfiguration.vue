<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { map } from 'lodash';

import {
    PFieldGroup, PCheckbox, PToggleButton, PButton, PTextInput, PSelectDropdown, PHeading, PPaneLayout, PScopedNotification,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { languages } from '@/store/user/constant';
import type { LanguageCode } from '@/store/user/type';


const state = reactive({
    language: 'en',
    issueDate: 10,
    lastDayOfMonth: false,
    manualAdjustablePeriod: 10,
    autoApplyAdjustments: true,
    setAdjustments: true,
    selectedLanguage: undefined as LanguageCode | undefined,
});

const languageMenuList = computed<SelectDropdownMenuItem[]>(() => map(languages, (d, k) => ({
    type: 'item', label: k === 'en' ? `${d} (default)` : d, name: k,
})));
const upcomingReportDate = computed(() => '2025-05-07');
const isSaveDisabled = computed(() => false);

const handleSave = () => {
    // 저장 로직
};

/* Watcher */
// watch(() => language, (val) => {
//     state.selectedLanguage = val;
// }, { immediate: true });
</script>

<template>
    <p-pane-layout class="advanced-settings-cost-report-configuration">
        <div class="content-wrapper">
            <p-heading
                :title="$t('COST_EXPLORER.ADVANCED_SETTINGS.COST_REPORT_CONFIGURATION')"
                heading-type="sub"
                class="content-title"
            />

            <p-field-group :label="$t('COST_EXPLORER.ADVANCED_SETTINGS.LANGUAGE')"
                           required
            >
                <p-select-dropdown
                    :menu="languageMenuList"
                    :selected.sync="state.selectedLanguage"
                    class="w-48"
                />
            </p-field-group>

            <p-field-group :label="$t('COST_EXPLORER.ADVANCED_SETTINGS.COST_REPORT_CONFIGURATION.ISSUE_DATE')"
                           required
            >
                <div class="flex items-center gap-2">
                    <p-text-input
                        v-model="state.issueDate"
                        type="number"
                        min="1"
                        max="31"
                        class="w-24"
                        :disabled="state.lastDayOfMonth"
                    />
                    <p-checkbox
                        :selected="state.lastDayOfMonth"
                        @change="state.lastDayOfMonth = $event"
                    >
                        {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.COST_REPORT_CONFIGURATION.LAST_DAY_OF_MONTH') }}
                    </p-checkbox>
                </div>
            </p-field-group>

            <p-scoped-notification type="discovery"
                                   icon="ic_rocket-filled"
                                   layout="in-section"
                                   :title="$t('COST_EXPLORER.ADVANCED_SETTINGS.UPCOMING_REPORT_DATE')"
                                   class="upcoming-report-date-notification"
            >
                <span>{{ upcomingReportDate }}</span>
            </p-scoped-notification>

            <p-field-group :label="$t('COST_EXPLORER.ADVANCED_SETTINGS.COST_REPORT_CONFIGURATION.MANUAL_ADJUSTABLE_PERIOD')"
                           required
            >
                <div class="flex items-center gap-2">
                    <p-text-input
                        v-model="state.manualAdjustablePeriod"
                        type="number"
                        min="0"
                        class="w-24"
                    />
                    <span>{{ $t('COST_EXPLORER.ADVANCED_SETTINGS.COST_REPORT_CONFIGURATION.DAYS_AFTER_REPORT') }}</span>
                </div>
            </p-field-group>

            <div class="mt-6">
                <p-toggle-button
                    v-model="state.autoApplyAdjustments"
                    :label="$t('COST_EXPLORER.ADVANCED_SETTINGS.COST_REPORT_CONFIGURATION.AUTO_APPLY_ADJUSTMENTS')"
                />
                <div class="ml-8 mt-2">
                    <p-checkbox
                        v-model="state.setAdjustments"
                    >
                        {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.COST_REPORT_CONFIGURATION.SET_ADJUSTMENTS') }}
                    </p-checkbox>
                </div>
            </div>

            <div class="mt-8 flex justify-end">
                <p-button
                    style-type="primary"
                    :disabled="isSaveDisabled"
                    @click="handleSave"
                >
                    {{ $t('LADING.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.advanced-settings-cost-report-configuration {
    .content-wrapper {
        padding: 1.5rem 1rem;

        .content-title {
            margin-bottom: 1rem;
        }

        .upcoming-report-date-notification {
            max-width: 20rem;
            padding: 1rem;
            margin-bottom: 1rem;
        }
    }
}
</style>

