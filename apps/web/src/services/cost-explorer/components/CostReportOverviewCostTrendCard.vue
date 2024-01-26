<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PCollapsibleToggle, PDataTable, PSelectButton, PSelectDropdown,
} from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/src/data-display/tables/data-table/type';
import type { SelectButtonType } from '@spaceone/design-system/types/inputs/buttons/select-button-group/type';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { CostReportDataAnalyzeParameters } from '@/schema/cost-analysis/cost-report-data/api-verbs/analyze';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import CostReportOverviewCostTrendChart from '@/services/cost-explorer/components/CostReportOverviewCostTrendChart.vue';
import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constant';
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
const state = reactive({
    loading: true,
    dateSelectDropdown: computed<SelectDropdownMenuItem[]>(() => {
        const _defaultStart = costReportPageGetters.recentReportDate.subtract(11, 'month').format('YYYY-MM');
        const _defaultEnd = costReportPageGetters.recentReportDate.format('YYYY-MM');
        const _default: SelectDropdownMenuItem = {
            name: 'last12Months', label: `Last 12 Months (${_defaultStart} ~ ${_defaultEnd})`,
        };
        const last3Years = Array.from({ length: 3 }).map((_, idx) => {
            const _year = costReportPageGetters.recentReportDate.subtract(idx, 'year').format('YYYY');
            return {
                name: _year, label: `${_year} (${_year}-01 ~ 12)`,
            };
        });
        return [_default, ...last3Years];
    }),
    selectedDate: 'last12Months',
    targetSelectItems: [
        { name: 'workspace_id', label: 'Workspace' },
        { name: 'provider', label: 'Provider' },
    ] as SelectButtonType[],
    selectedTarget: 'workspace_id',
    previousTotalAmount: 957957,
    last12MonthsAverage: 726568,
    //
    isDetailsCollapsed: true,
    data: {} as AnalyzeResponse<CostReportDataAnalyzeResult>,
    period: computed(() => {
        if (state.selectedDate === 'last12Months') {
            const start = costReportPageGetters.recentReportDate.subtract(11, 'month').format('YYYY-MM');
            const end = costReportPageGetters.recentReportDate.format('YYYY-MM');
            return { start, end };
        }
        const start = `${state.selectedDate}-01`;
        const end = `${state.selectedDate}-12`;
        return { start, end };
    }),
    tableFields: computed<DataTableFieldType[]>(() => {
        const targetField = state.targetSelectItems.find((item) => item.name === state.selectedTarget) ?? {};

        const today = dayjs.utc();
        const fields: DataTableFieldType[] = [];
        let idx = 0;
        Array.from({ length: 12 }).forEach(() => {
            const month = today.subtract(idx, 'month');
            fields.push({
                name: month.format('YYYY-MM'),
                label: month.format('MMM'),
                textAlign: 'right',
                sortable: false,
            });
            idx += 1;
        });
        return [targetField, ...fields];
    }),
    tableItems: [],
});

/* Api */
const analyzeTrendData = async () => {
    state.loading = true;
    try {
        state.data = await SpaceConnector.clientV2.costAnalysis.costReportData.analyze<CostReportDataAnalyzeParameters, AnalyzeResponse<CostReportDataAnalyzeResult>>({
            query: {
                granularity: GRANULARITY.MONTHLY,
                group_by: [state.selectedTarget],
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
        state.data = {};
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleChangeTarget = (target: string) => {
    state.selectedTarget = target;
};

/* Init */
(async () => {
    await analyzeTrendData();
})();
</script>

<template>
    <cost-report-overview-card-template>
        <template #title>
            <span class="mr-3">
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.COST_TREND') }}
            </span>
            <p-select-dropdown style-type="transparent"
                               :menu="state.dateSelectDropdown"
                               :selected="state.selectedDate"
            />
        </template>
        <template #right-extra>
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
            <div class="summary-wrapper">
                <div class="summary-item">
                    <div class="summary-label">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.PREVIOUS_TOTAL_AMOUNT') }}
                    </div>
                    <div class="summary-value">
                        <span class="currency-symbol">₩</span>
                        <span class="value">{{ numberFormatter(state.previousTotalAmount) }}</span>
                    </div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.LAST_12_MONTHS_AVERAGE') }}
                    </div>
                    <div class="summary-value">
                        <span class="currency-symbol">₩</span>
                        <span class="value">{{ numberFormatter(state.last12MonthsAverage) }}</span>
                    </div>
                </div>
            </div>
            <cost-report-overview-cost-trend-chart :loading="state.loading"
                                                   :data="state.data"
                                                   :group-by="state.selectedTarget"
                                                   :period="state.period"
            />
            <div v-if="!state.isDetailsCollapsed">
                <p-data-table :fields="state.tableFields"
                              :items="state.tableItems"
                />
            </div>
            <p-collapsible-toggle :is-collapsed.sync="state.isDetailsCollapsed"
                                  class="collapsible-toggle"
            >
                {{ state.isDetailsCollapsed ? $t('BILLING.COST_MANAGEMENT.COST_REPORT.SHOW_DETAILS') : $t('BILLING.COST_MANAGEMENT.COST_REPORT.HIDE') }}
            </p-collapsible-toggle>
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
.collapsible-toggle {
    width: 100%;
    justify-content: center;
}

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .p-context-menu-item {
        font-weight: normal;
    }
}
</style>
