<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import { isEqual, map } from 'lodash';

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

import { useCostReportConfigApi } from '@/api-clients/cost-analysis/cost-report-config/composables/use-cost-report-config-api';
import type { CostReportConfigUpdateParameters } from '@/api-clients/cost-analysis/cost-report-config/schema/api-verbs/update';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';
import { languages } from '@/store/user/constant';
import type { LanguageCode } from '@/store/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import AdvancedSettingsSetAdjustmentsOverlay from '@/services/cost-explorer/components/AdvancedSettingsSetAdjustmentsOverlay.vue';
import { useCostReportConfigQuery } from '@/services/cost-explorer/composables/use-cost-report-config-query';
import { getUpcomingIssueDate, getUpcomingConfirmationDate } from '@/services/cost-explorer/helpers/cost-report-issue-date-helper';
import { useAdvancedSettingsPageStore } from '@/services/cost-explorer/stores/advanced-settings-page-store';


const advancedSettingsPageStore = useAdvancedSettingsPageStore();
const { costReportConfig } = useCostReportConfigQuery();
const { costReportConfigAPI } = useCostReportConfigApi();
const queryClient = useQueryClient();
const state = reactive({
    // Base Settings
    selectedLanguage: undefined as LanguageCode | undefined,
    selectedCurrency: undefined as Currency | undefined,
    lastDayOfMonth: false,
    // Auto Apply Adjustments
    enableAdjustments: false as boolean,
});

/* Computed */
const languageMenuList = computed<SelectDropdownMenuItem[]>(() => map(languages, (d, k) => ({
    type: 'item', label: k === 'en' ? `${d} (default)` : d, name: k,
})));
const upcomingReportDate = computed<string>(() => getUpcomingIssueDate(state.lastDayOfMonth, issueDate.value));
const confirmationDate = computed<string>(() => getUpcomingConfirmationDate(state.enableAdjustments, upcomingReportDate.value, manualAdjustablePeriod.value ?? 0));
const isSaveDisabled = computed<boolean>(() => {
    if (!costReportConfig.value?.cost_report_config_id) return true;
    return !isAllValid.value;
});
const currencyMenuList = Object.values(CURRENCY).map((currency) => ({ label: `${CURRENCY_SYMBOL[currency]} ${currency}`, name: currency }));
const isFormChanged = computed<boolean>(() => !isEqual(state.selectedLanguage, costReportConfig.value?.language)
        || !isEqual(state.selectedCurrency, costReportConfig.value?.currency)
        || !isEqual(Number(issueDate.value), Number(costReportConfig.value?.issue_day))
        || !isEqual(state.lastDayOfMonth, !!costReportConfig.value?.is_last_day)
        || !isEqual(state.enableAdjustments, !!costReportConfig.value?.adjustment_options?.enabled)
        || !isEqual(Number(manualAdjustablePeriod.value), Number(costReportConfig.value?.adjustment_options?.period)));

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
        if (val < 1) return i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.GREATER_THAN_OR_EQUAL_TO_1');
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

/* Api */
const { key: costReportConfigListQueryKey } = useServiceQueryKey('cost-analysis', 'cost-report-config', 'list');
const { mutateAsync: updateCostReportConfig } = useMutation(
    {
        mutationFn: (params: CostReportConfigUpdateParameters) => costReportConfigAPI.update(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: costReportConfigListQueryKey.value });
            showSuccessMessage(i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.ALT_S_UPDATE_COST_REPORT_CONFIGURATION'), '');
        },
        onError: (error) => {
            ErrorHandler.handleRequestError(error, i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.ALT_E_UPDATE_COST_REPORT_CONFIGURATION'));
        },
    },
);

const handleSave = () => {
    if (!costReportConfig.value?.cost_report_config_id) return;

    updateCostReportConfig({
        cost_report_config_id: costReportConfig.value?.cost_report_config_id,
        language: state.selectedLanguage,
        issue_day: issueDate.value,
        is_last_day: state.lastDayOfMonth,
        adjustment_options: {
            enabled: state.enableAdjustments,
            period: manualAdjustablePeriod.value,
        },
        currency: state.selectedCurrency,
    });
};

const handleUpdateToggle = (val: boolean) => {
    state.enableAdjustments = val;
};
const handleUpdateManualAdjustablePeriod = (val: number) => {
    setForm('manualAdjustablePeriod', val);
};
const handleOpenAdjustmentsOverlay = () => {
    advancedSettingsPageStore.setShowAdjustmentsOverlay(true);
};

/* Watcher */
watch(() => costReportConfig.value, (val) => {
    if (val) {
        state.selectedLanguage = val.language;
        state.selectedCurrency = val.currency;
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

                <p-field-group :label="$t('COST_EXPLORER.ADVANCED_SETTINGS.COST_REPORT_CURRENCY')"
                               required
                >
                    <p-select-dropdown
                        :menu="currencyMenuList"
                        :selected.sync="state.selectedCurrency"
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
                                min="1"
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
                          :disabled="!state.enableAdjustments"
                          @click="handleOpenAdjustmentsOverlay"
                >
                    {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.SET_ADJUSTMENTS') }}
                </p-button>
            </div>
            <div class="mt-8">
                <p-button
                    style-type="primary"
                    :disabled="isSaveDisabled || !isFormChanged"
                    @click="handleSave"
                >
                    {{ $t('LADING.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
        <advanced-settings-set-adjustments-overlay />
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

