<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';
import { isEqual } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDataLoader, PSelectButton, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectButtonType } from '@cloudforet/mirinae/types/controls/buttons/select-button-group/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';
import type { CostReportDataAnalyzeParameters } from '@/api-clients/cost-analysis/cost-report-data/schema/api-verbs/analyze';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { CURRENCY_SYMBOL } from '@/store/display/constant';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import CostReportOverviewCostTrendChart from '@/services/cost-explorer/components/CostReportOverviewCostTrendChart.vue';
import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';



type CostReportDataAnalyzeResult = {
    [groupBy: string]: string | any;
    value_sum?: Array<{
        date: string;
        value: number
    }>;
    _total_value_sum?: number;
};
const costReportPageStore = useCostReportPageStore();
const costReportPageGetters = costReportPageStore.getters;
const costReportPageState = costReportPageStore.state;
const appContextStore = useAppContextStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    loading: true,
    data: undefined as AnalyzeResponse<CostReportDataAnalyzeResult>|undefined,
    dateSelectDropdown: computed<SelectDropdownMenuItem[]>(() => {
        const _defaultStart = dayjs.utc(costReportPageState.recentReportMonth).subtract(11, 'month').format('YYYY-MM');
        const _defaultEnd = costReportPageState.recentReportMonth;
        const _default: SelectDropdownMenuItem = {
            name: 'last12Months', label: `${i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.LAST_12_MONTHS')} (${_defaultStart} ~ ${_defaultEnd})`,
        };
        const recentYear = dayjs.utc().year();
        const last3Years = Array.from({ length: 3 }).map((_, idx) => {
            const _year = (recentYear - idx).toString();
            return {
                name: _year, label: `${_year} (${_year}-01 ~ ${_year}-12)`,
            };
        });
        return [_default, ...last3Years];
    }),
    selectedDate: 'last12Months',
    targetSelectItems: computed(() => ([
        { name: GROUP_BY.WORKSPACE, label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.WORKSPACE') },
        { name: GROUP_BY.PROVIDER, label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.PROVIDER') },
    ] as SelectButtonType[])),
    selectedTarget: storeState.isAdminMode ? GROUP_BY.WORKSPACE : GROUP_BY.PROVIDER,
    previousTotalAmount: computed<number>(() => {
        if (!costReportPageState.recentReportMonth) return 0;
        return getPreviousTotalAmount(costReportPageState.recentReportMonth, state.data?.results);
    }),
    last12MonthsAverage: computed<number>(() => getLast12MonthsAverage(state.data?.results)),
    period: computed(() => {
        if (state.selectedDate === 'last12Months') {
            const start = dayjs.utc(costReportPageState.recentReportMonth).subtract(11, 'month').format('YYYY-MM');
            const end = costReportPageState.recentReportMonth;
            return { start, end };
        }
        const start = `${state.selectedDate}-01`;
        const end = `${state.selectedDate}-12`;
        return { start, end };
    }),
    //
    selectedPeriodTranslation: computed(() => {
        if (state.selectedDate === 'last12Months') {
            return i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.THE_AVERAGE_FOR_THE_LAST_12_MONTHS');
        }
        return i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.THE_AVERAGE_FOR_SELECTED_PERIOD', { selected_period: dayjs.utc(state.selectedDate).year() });
    }),
});

/* Util */
const getPreviousTotalAmount = (recentReportMonth: string, results?: CostReportDataAnalyzeResult[]): number => {
    if (!results) return 0;
    let _totalAmount = 0;
    results.forEach((item) => {
        const _valueSum = item.value_sum?.find((valueSum) => valueSum.date === recentReportMonth);
        if (_valueSum) {
            _totalAmount += _valueSum.value;
        }
    });
    return _totalAmount;
};
const getLast12MonthsAverage = (results?: CostReportDataAnalyzeResult[]): number => {
    if (!results) return 0;
    let _totalAmount = 0;
    results.forEach((item) => {
        _totalAmount += item._total_value_sum || 0;
    });
    return _totalAmount / 12;
};

/* Api */
const analyzeTrendData = async () => {
    state.loading = true;
    try {
        state.data = await SpaceConnector.clientV2.costAnalysis.costReportData.analyze<CostReportDataAnalyzeParameters, AnalyzeResponse<CostReportDataAnalyzeResult>>({
            cost_report_config_id: costReportPageState.costReportConfig?.cost_report_config_id,
            is_confirmed: true,
            query: {
                granularity: GRANULARITY.MONTHLY,
                group_by: [state.selectedTarget, 'is_adjusted'],
                field_group: ['date'],
                start: state.period.start,
                end: state.period.end,
                fields: {
                    value_sum: {
                        key: `cost.${costReportPageGetters.currency}`,
                        operator: 'sum',
                    },
                },
                sort: [{
                    key: '_total_value_sum',
                    desc: true,
                }],
            },
        });
    } catch (e) {
        state.data = undefined;
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleSelectDate = (date: string) => {
    state.selectedDate = date;
};
const handleChangeTarget = (target: string) => {
    state.selectedTarget = target;
};

/* Watcher */
watch([
    () => state.period,
    () => state.selectedTarget,
    () => costReportPageGetters.currency,
    () => costReportPageState.costReportConfig?.cost_report_config_id,
], async (after, before) => {
    if (isEqual(after, before) || !costReportPageGetters.currency || !costReportPageState.costReportConfig?.cost_report_config_id) return;
    await analyzeTrendData();
}, { immediate: true });
</script>

<template>
    <cost-report-overview-card-template display-block-in-mobile>
        <template #title>
            <span class="mr-3">
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.COST_TREND') }}
            </span>
            <p-select-dropdown style-type="transparent"
                               :menu="state.dateSelectDropdown"
                               :selected="state.selectedDate"
                               class="cost-trend-period-select-dropdown"
                               @select="handleSelectDate"
            />
        </template>
        <template v-if="storeState.isAdminMode"
                  #right-extra
        >
            <div class="select-button-wrapper">
                <p-select-button v-for="item in state.targetSelectItems"
                                 :key="`cost-trend-select-button-${item.name}`"
                                 :value="item.name"
                                 :selected="state.selectedTarget"
                                 size="sm"
                                 style-type="secondary"
                                 @change="handleChangeTarget"
                >
                    {{ item.label }}
                </p-select-button>
            </div>
        </template>
        <template #content>
            <p-data-loader :loading="state.loading"
                           :data="state.data"
                           :min-loading-time="500"
            >
                <div class="summary-wrapper">
                    <div class="summary-item">
                        <div class="summary-label">
                            {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.TOTAL_COST_FOR_PREVIOUS_MONTH', { previous_month: state.period.end }) }}
                        </div>
                        <div class="summary-value">
                            <span class="currency-symbol">{{ CURRENCY_SYMBOL?.[costReportPageGetters.currency] }}</span>
                            <span class="value">{{ currencyMoneyFormatter(state.previousTotalAmount, {currency: costReportPageGetters.currency, style: 'decimal'}) }}</span>
                        </div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">
                            {{ state.selectedPeriodTranslation }}
                        </div>
                        <div class="summary-value">
                            <span class="currency-symbol">{{ CURRENCY_SYMBOL?.[costReportPageGetters.currency] }}</span>
                            <span class="value">{{ currencyMoneyFormatter(state.last12MonthsAverage, {currency: costReportPageGetters.currency, style: 'decimal'}) }}</span>
                        </div>
                    </div>
                </div>
                <cost-report-overview-cost-trend-chart
                    :group-by="state.selectedTarget"
                    :period="state.period"
                    :data="state.data"
                    :loading="state.loading"
                />
            </p-data-loader>
        </template>
    </cost-report-overview-card-template>
</template>

<style lang="postcss" scoped>
.select-button-wrapper {
    display: flex;
    gap: 0.25rem;
}
.summary-wrapper {
    display: flex;
    gap: 1.5rem;

    @screen mobile {
        flex-direction: column;
        gap: 0.5rem;
    }
    .summary-label {
        @apply text-label-md text-gray-600;
        padding-bottom: 0.25rem;
    }
    .currency-symbol {
        @apply text-label-xl text-gray-600;
    }
    .value {
        @apply text-display-md;
        font-weight: 700;
        padding-left: 0.125rem;
    }
}
.cost-trend-period-select-dropdown {
    @apply font-normal;
}
</style>
