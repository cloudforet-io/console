<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import dayjs from 'dayjs';
import { map } from 'lodash';

import {
    PFieldGroup,
    PCheckbox,
    PToggleButton,
    PButton,
    PTextInput,
    PSelectDropdown,
    PHeading,
    PPaneLayout,
    PScopedNotification,
    PFieldTitle,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { languages } from '@/store/user/constant';
import type { LanguageCode } from '@/store/user/type';

import { useCostReportConfigQuery } from '@/services/cost-explorer/composables/queries/use-cost-report-config-query';

const { costReportConfig } = useCostReportConfigQuery();

const state = reactive({
    issueDate: 10 as number | undefined,
    lastDayOfMonth: false,
    manualAdjustablePeriod: 0,
    enableAdjustments: false,
    autoApplyAdjustments: true,
    setAdjustments: true,
    selectedLanguage: undefined as LanguageCode | undefined,
});

const languageMenuList = computed<SelectDropdownMenuItem[]>(() => map(languages, (d, k) => ({
    type: 'item', label: k === 'en' ? `${d} (default)` : d, name: k,
})));
const upcomingReportDate = computed(() => '2025-05-07');
const isSaveDisabled = computed(() => false);
const getLastDay = (): number => {
    const today = dayjs.utc();
    if (today.isSame(today.endOf('month'), 'day')) {
        return today.add(1, 'month').endOf('month').date();
    }
    return today.endOf('month').date();
};

const handleSave = () => {
    // 저장 로직
};

const handleUpdateToggle = (val: boolean) => {
    console.log('val', val);
};

/* Watcher */
watch(() => costReportConfig.value, (val) => {
    if (val) {
        console.log('val', val);
        state.selectedLanguage = val.language;
        state.issueDate = val.issue_day;
        if (!val.is_last_day) {
            state.issueDate = val.issue_day;
        } else {
            state.issueDate = getLastDay();
        }
        // state.manualAdjustablePeriod = val.value?.adjustment_options?.period;
        // state.autoApplyAdjustments = val.value?.adjustment_options?.enabled;
        // state.setAdjustments = val.value?.adjustment_options?.set_adjustments;
    }
}, { immediate: true });
</script>

<template>
    <p-pane-layout class="advanced-settings-cost-report-configuration">
        <div class="content-wrapper">
            <p-heading
                :title="$t('COST_EXPLORER.ADVANCED_SETTINGS.COST_REPORT_CONFIGURATION')"
                heading-type="sub"
            />

            <div class="config-section-wrapper">
                <p-field-group :label="$t('COST_EXPLORER.ADVANCED_SETTINGS.LANGUAGE')"
                               required
                >
                    <p-select-dropdown
                        :menu="languageMenuList"
                        :selected.sync="state.selectedLanguage"
                        class="w-48"
                    />
                </p-field-group>

                <p-field-group :label="$t('COST_EXPLORER.ADVANCED_SETTINGS.ISSUE_DATE')"
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
                            {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.LAST_DAY_OF_MONTH') }}
                        </p-checkbox>
                    </div>
                </p-field-group>

                <p-scoped-notification type="discovery"
                                       icon="ic_rocket-filled"
                                       layout="in-section"
                                       :title="$t('COST_EXPLORER.ADVANCED_SETTINGS.UPCOMING_REPORT_DATE')"
                                       class="date-notification"
                >
                    <span>{{ upcomingReportDate }}</span>
                </p-scoped-notification>
            </div>

            <div class="config-section-wrapper">
                <div class="sub-title-wrapper">
                    <p-toggle-button :value="state.enableAdjustments"
                                     @update:value="handleUpdateToggle"
                    />
                    <p-field-title>{{ $t('COST_EXPLORER.ADVANCED_SETTINGS.AUTO_APPLY_ADJUSTMENTS') }}</p-field-title>
                </div>
                <p-field-group :label="$t('COST_EXPLORER.ADVANCED_SETTINGS.MANUAL_ADJUSTABLE_PERIOD')"
                               required
                               :help-text="$t('COST_EXPLORER.ADVANCED_SETTINGS.MANUAL_ADJUSTABLE_PERIOD_HELP_TEXT')"
                >
                    <div class="flex items-center gap-2">
                        <p-text-input
                            v-model="state.manualAdjustablePeriod"
                            type="number"
                            min="0"
                            class="w-24"
                        />
                        <span class="text-label-sm">{{ $t('COST_EXPLORER.ADVANCED_SETTINGS.DAYS_AFTER_REPORT') }}</span>
                    </div>
                </p-field-group>
                <p-scoped-notification type="discovery"
                                       icon="ic_rocket-filled"
                                       layout="in-section"
                                       :title="$t('COST_EXPLORER.ADVANCED_SETTINGS.REPORT_CONFIGURATION_DATE')"
                                       class="date-notification"
                >
                    <span>{{ upcomingReportDate }}</span>
                </p-scoped-notification>
                <p-button style-type="tertiary"
                          icon-left="ic_settings"
                          class="mt-4"
                >
                    {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.SET_ADJUSTMENTS') }}
                </p-button>
            </div>
            <div class="mt-8">
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
        @apply flex flex-col gap-4;
        padding: 1.5rem 1rem;

        .config-section-wrapper {
            @apply border border-gray-200 rounded-md;
            padding: 1.5rem;

            .sub-title-wrapper {
                @apply flex items-center gap-2;
                margin-bottom: 1rem;
            }
        }

        .date-notification {
            max-width: 20rem;
        }
    }
}
</style>

