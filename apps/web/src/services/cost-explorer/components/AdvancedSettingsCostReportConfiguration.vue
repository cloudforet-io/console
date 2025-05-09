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

import { useCostReportUpdateMutation } from '@/api-clients/cost-analysis/cost-report-config/composables/mutations/use-cost-report-update-mutation';
import { i18n } from '@/translations';

import { languages } from '@/store/user/constant';
import type { LanguageCode } from '@/store/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useCostReportConfigQuery } from '@/services/cost-explorer/composables/queries/use-cost-report-config-query';

const { costReportConfig } = useCostReportConfigQuery();

const state = reactive({
    // Base Settings
    selectedLanguage: undefined as LanguageCode | undefined,
    lastDayOfMonth: false,
    // Auto Apply Adjustments
    enableAdjustments: false as boolean,
});

/* Computed */
const languageMenuList = computed<SelectDropdownMenuItem[]>(() => map(languages, (d, k) => ({
    type: 'item', label: k === 'en' ? `${d} (default)` : d, name: k,
})));
const upcomingReportDate = computed<string>(() => getUpcomingIssueDate(state.lastDayOfMonth, issueDate.value));
const confirmationDate = computed<string>(() => {
    if (!state.enableAdjustments || !issueDate.value) return '-';
    const reportDate = dayjs.utc(upcomingReportDate.value);
    const confirmDate = reportDate.add(manualAdjustablePeriod.value ?? 0, 'day');
    return confirmDate.format('YYYY-MM-DD');
});
const isSaveDisabled = computed<boolean>(() => {
    if (!costReportConfig.value?.cost_report_config_id) return true;
    return !isAllValid.value;
});

const {
    forms: {
        issueDate,
        manualAdjustablePeriod,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    issueDate: undefined as number | undefined,
    manualAdjustablePeriod: undefined as number | undefined,
}, {
    issueDate(val: number | undefined) {
        if (state.lastDayOfMonth) return true;
        if (!val) return i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.REQUIRED_FIELD');
        if (val < 1) return i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.GREATER_THAN_OR_EQUAL_TO_1');
        if (val > 31) return i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.LESS_THAN_OR_EQUAL_TO_31');
        return true;
    },
    manualAdjustablePeriod(val: number | undefined) {
        if (!state.enableAdjustments) return true;
        if (!val) return i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.REQUIRED_FIELD');
        if (val < 0) return i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.GREATER_THAN_OR_EQUAL_TO_0');
        const confirmDate = dayjs.utc(confirmationDate.value);
        const reportDate = dayjs.utc(upcomingReportDate.value);
        const endOfMonth = reportDate.endOf('month');
        if (confirmDate.isAfter(endOfMonth, 'day')) return i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.CONFIRM_DATE_EXCEEDS_MONTH_END');
        return true;
    },
});


/* Util */
const getLastDay = (): number => {
    const today = dayjs.utc();
    if (today.isSame(today.endOf('month'), 'day')) {
        return today.add(1, 'month').endOf('month').date();
    }
    return today.endOf('month').date();
};
const getUpcomingIssueDate = (enableLastDay: boolean, _issueDay?: number): string => {
    const today = dayjs.utc();
    const __issueDay: number = enableLastDay ? today.endOf('month').date() : _issueDay ?? 10;

    // 1. case for today(2024-01-15) is before issue day(31) -> 2024-01-31
    if (Number(today.format('D')) < __issueDay) {
        return today.date(__issueDay).format('YYYY-MM-DD');
    }

    // 2. case for next month(2024-02) has less days than issue day(31) -> 2024-02-29
    const nextMonth = today.add(1, 'month');
    if (nextMonth.endOf('month').date() < __issueDay) {
        return nextMonth.endOf('month').format('YYYY-MM-DD');
    }

    // 3. case for next month(2024-02) has equal or more days than issue day(10) -> 2024-02-10
    return nextMonth.date(__issueDay).format('YYYY-MM-DD');
};

/* Api */
const { mutate: updateCostReportConfig } = useCostReportUpdateMutation({
    onSuccess: () => {
        showSuccessMessage(i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.ALT_S_UPDATE_COST_REPORT_CONFIGURATION'), '');
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.ALT_E_UPDATE_COST_REPORT_CONFIGURATION'));
    },
});

const handleSave = () => {
    if (!costReportConfig.value?.cost_report_config_id) return;

    console.log({
        cost_report_config_id: costReportConfig.value?.cost_report_config_id,
        language: state.selectedLanguage,
        issue_day: issueDate.value,
        is_last_day: state.lastDayOfMonth,
        adjustment_options: {
            enabled: state.enableAdjustments,
            period: manualAdjustablePeriod.value,
        },
    });
    updateCostReportConfig({
        cost_report_config_id: costReportConfig.value?.cost_report_config_id,
        language: state.selectedLanguage,
        issue_day: issueDate.value,
        is_last_day: state.lastDayOfMonth,
        adjustment_options: {
            enabled: state.enableAdjustments,
            period: manualAdjustablePeriod.value,
        },
    });
};

const handleUpdateToggle = (val: boolean) => {
    state.enableAdjustments = val;
};
const handleUpdateManualAdjustablePeriod = (val: number) => {
    setForm('manualAdjustablePeriod', val);
};

/* Watcher */
watch(() => costReportConfig.value, (val) => {
    if (val) {
        state.selectedLanguage = val.language;
        setForm('issueDate', val.issue_day);
        if (!val.is_last_day) {
            setForm('issueDate', val.issue_day);
        } else {
            setForm('issueDate', getLastDay());
        }
        state.enableAdjustments = val.adjustment_options?.enabled ?? false;
        setForm('manualAdjustablePeriod', val.adjustment_options?.period);
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

            <!-- Base Settings -->
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
                               :invalid="invalidState.issueDate"
                               :invalid-text="invalidTexts.issueDate"
                >
                    <template #default="{invalid}">
                        <div class="flex items-center gap-2">
                            <p-text-input
                                :value="issueDate"
                                type="number"
                                min="1"
                                max="31"
                                class="w-24"
                                :disabled="state.lastDayOfMonth"
                                :invalid="invalid"
                                @update:value="setForm('issueDate', $event)"
                            />
                            <p-checkbox
                                :selected="state.lastDayOfMonth"
                                @change="state.lastDayOfMonth = $event"
                            >
                                {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.LAST_DAY_OF_MONTH') }}
                            </p-checkbox>
                        </div>
                    </template>
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

            <!-- Auto Apply Adjustments -->
            <div class="config-section-wrapper">
                <div class="sub-title-wrapper">
                    <p-toggle-button :value="state.enableAdjustments"
                                     @update:value="handleUpdateToggle"
                    />
                    <p-field-title>{{ $t('COST_EXPLORER.ADVANCED_SETTINGS.AUTO_APPLY_ADJUSTMENTS') }}</p-field-title>
                </div>
                <p-field-group :label="$t('COST_EXPLORER.ADVANCED_SETTINGS.MANUAL_ADJUSTABLE_PERIOD')"
                               required
                               :invalid="invalidState.manualAdjustablePeriod"
                               :invalid-text="invalidTexts.manualAdjustablePeriod"
                               :help-text="$t('COST_EXPLORER.ADVANCED_SETTINGS.MANUAL_ADJUSTABLE_PERIOD_HELP_TEXT')"
                >
                    <template #default="{invalid}">
                        <div class="flex items-center gap-2">
                            <p-text-input
                                :value="manualAdjustablePeriod"
                                type="number"
                                min="0"
                                :disabled="!state.enableAdjustments"
                                :invalid="invalid"
                                @update:value="handleUpdateManualAdjustablePeriod"
                            />
                            <span class="text-label-sm">{{ $t('COST_EXPLORER.ADVANCED_SETTINGS.DAYS_AFTER_REPORT') }}</span>
                        </div>
                    </template>
                </p-field-group>
                <p-scoped-notification type="discovery"
                                       icon="ic_rocket-filled"
                                       layout="in-section"
                                       :title="$t('COST_EXPLORER.ADVANCED_SETTINGS.REPORT_CONFIGURATION_DATE')"
                                       class="date-notification"
                >
                    <span>{{ confirmationDate }}</span>
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

