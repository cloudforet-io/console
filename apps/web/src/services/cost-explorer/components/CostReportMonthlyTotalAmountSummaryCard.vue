<script lang="ts" setup>
import {
    computed, reactive, ref, watch,
} from 'vue';

import {
    PSelectButton, PDatePagination, PLink, PDataTable,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import { cloneDeep } from 'lodash';

import { numberFormatter } from '@cloudforet/utils';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import { white } from '@/styles/colors';
import { DEFAULT_CHART_COLORS } from '@/styles/colorsets';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';
import type { Field } from '@/services/dashboards/widgets/_types/widget-data-table-type';


interface ChartData {
    category: string;
    value: number;
    pieSettings: {
        fill: string;
    };
}

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const costReportPageStore = useCostReportPageStore();
const costReportPageGetters = costReportPageStore.getters;
const state = reactive({
    loading: false,
    targetSelectItems: [
        { name: 'workspace', label: 'Workspace' },
        { name: 'provider', label: 'Provider' },
    ],
    selectedTarget: 'workspace',
    totalAmount: 957957,
    currentDate: undefined,
    //
    chartData: computed<ChartData[]>(() => state.tableItems.map((d, idx) => ({
        category: d.workspace_name,
        value: d.amount,
        pieSettings: {
            fill: DEFAULT_CHART_COLORS[idx],
        },
    }))),
    tableFields: [
        { name: 'workspace_name', label: 'Workspace' },
        { name: 'amount', label: 'Amount' },
    ] as Field[],
    tableItems: [
        { workspace_name: 'Walmart Inc.', amount: 1000000 },
        { workspace_name: 'Amazon.com Inc.', amount: 9900000 },
        { workspace_name: 'PetroChina Co. Ltd.', amount: 8800000 },
        { workspace_name: 'Apple Inc.', amount: 6400000 },
    ],
});

/* Util */
const drawChart = () => {
    chartHelper.refreshRoot();
    const chart = chartHelper.createDonutChart();
    const seriesSettings = {
        categoryField: 'category', // TODO: change
        valueField: 'value', // TODO: change
        radius: 20,
    };
    const series = chartHelper.createPieSeries(seriesSettings);
    chart.series.push(series);
    series.slices.template.setAll({
        stroke: chartHelper.color(white),
        templateField: 'pieSettings',
    });
    const tooltip = chartHelper.createTooltip();
    chartHelper.setPieTooltipText(series, tooltip);
    series.slices.template.set('tooltip', tooltip);
    series.data.setAll(cloneDeep(state.chartData));
};

/* Event */
const handleChangeTarget = (target: string) => {
    state.selectedTarget = target;
};

/* Watcher */
watch([() => state.loading, () => chartContext.value], async ([loading, _chartContext]) => {
    if (!loading && _chartContext) drawChart();
}, { immediate: true });
watch(() => costReportPageGetters.recentReportDate, (recentReportDate) => {
    state.currentDate = recentReportDate;
}, { immediate: true });
</script>

<template>
    <cost-report-overview-card-template>
        <template #title>
            <span class="title">
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.MONTHLY_TOTAL_AMOUNT_SUMMARY') }}
            </span>
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
            <div class="grid grid-cols-12">
                <div class="col-span-12 lg:col-span-6">
                    <p-date-pagination :date.sync="state.currentDate"
                                       :disable-next-button="state.currentDate.isSame(costReportPageGetters.recentReportDate, 'month')"
                    />
                    <div class="summary-wrapper">
                        <div class="summary-label">
                            {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.TOTAL_AMOUNT') }}
                        </div>
                        <div class="summary-value">
                            <span class="currency-symbol">₩</span>
                            <span class="value">{{ numberFormatter(state.totalAmount) }}</span>
                        </div>
                    </div>
                    <p-link :action-icon="ACTION_ICON.EXTERNAL_LINK"
                            to="/"
                            new-tab
                            highlight
                            size="sm"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.SEE_DETAILS') }}
                    </p-link>
                    <div ref="chartContext"
                         class="chart"
                    />
                </div>
                <div class="col-span-12 lg:col-span-6">
                    <p-data-table :fields="state.tableFields"
                                  :items="state.tableItems"
                                  :loading="state.loading"
                                  table-style-type="simple"
                    >
                        <template #col-workspace_name-format="{ value, rowIndex }">
                            <span class="toggle-button"
                                  :style="{ 'background-color': DEFAULT_CHART_COLORS[rowIndex] }"
                            />
                            <span class="workspace-name-col">{{ value }}</span>
                        </template>
                        <template #col-amount-format="{ value }">
                            <span class="amount-col">{{ currencyMoneyFormatter(value) }}</span>
                        </template>
                    </p-data-table>
                </div>
            </div>
        </template>
    </cost-report-overview-card-template>
</template>

<style lang="postcss" scoped>
.select-button-wrapper {
    display: flex;
    gap: 0.25rem;
}
.summary-wrapper {
    padding-top: 1rem;
    padding-bottom: 0.5rem;
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
.workspace-name-col {
    @apply text-label-md;
    font-weight: 400;
}
.amount-col {
    @apply text-label-md;
    font-weight: 500;
}
.toggle-button {
    @apply rounded-full;
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    cursor: pointer;
    margin-right: 0.5rem;
}
.chart {
    width: 100%;
    height: 12rem;
    z-index: 1000;
}

/* custom design-system component - p-date-pagination */
:deep(.p-date-pagination) {
    .date-text {
        @apply text-display-md;
    }
}
</style>
