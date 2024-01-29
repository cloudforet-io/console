<script lang="ts" setup>
import {
    computed, reactive, ref, watch,
} from 'vue';

import {
    PSelectButton, PDatePagination, PLink, PDataTable, PSkeleton, PDataLoader,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import type { Dayjs } from 'dayjs';
import { cloneDeep, isEqual, sum } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { CostReportDataAnalyzeParameters } from '@/schema/cost-analysis/cost-report-data/api-verbs/analyze';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { white } from '@/styles/colors';
import { DEFAULT_CHART_COLORS } from '@/styles/colorsets';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import { GRANULARITY, GROUP_BY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';
import type { Field } from '@/services/dashboards/widgets/_types/widget-data-table-type';


interface ChartData {
    category: string;
    value: number;
    pieSettings: {
        fill: string;
    };
}
type CostReportDataAnalyzeResult = {
    [groupBy: string]: string | any;
    date: string;
    value_sum: number;
};

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const costReportPageStore = useCostReportPageStore();
const costReportPageGetters = costReportPageStore.getters;
const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});
const state = reactive({
    loading: true,
    data: undefined as AnalyzeResponse<CostReportDataAnalyzeResult>|undefined,
    targetSelectItems: [
        GROUP_BY_ITEM_MAP.workspace_id,
        GROUP_BY_ITEM_MAP.provider,
    ],
    selectedTarget: storeState.isAdminMode ? GROUP_BY.WORKSPACE : GROUP_BY.PROVIDER,
    totalAmount: computed(() => sum(state.data?.results.map((d) => d.value_sum))),
    currentDate: undefined as Dayjs | undefined,
    //
    chartData: computed<ChartData[]>(() => state.data?.results?.map((d, idx) => {
        const _category = d[state.selectedTarget];
        const _categoryLabel = state.selectedTarget === GROUP_BY.WORKSPACE
            ? storeState.workspaces[_category]?.label ?? d.workspace_id
            : storeState.providers[_category]?.name ?? d.provider;
        return {
            category: _categoryLabel,
            value: d.value_sum,
            pieSettings: {
                fill: DEFAULT_CHART_COLORS[idx],
            },
        };
    })),
    tableFields: computed<Field[]>(() => ([
        { name: state.selectedTarget, label: GROUP_BY_ITEM_MAP[state.selectedTarget].label },
        { name: 'value_sum', label: 'Amount', textAlign: 'right' },
    ])),
});

/* Api */
const analyzeCostReportData = async () => {
    state.loading = true;
    try {
        const _period = {
            start: state.currentDate?.format('YYYY-MM'),
            end: state.currentDate?.format('YYYY-MM'),
        };
        state.data = await SpaceConnector.clientV2.costAnalysis.costReportData.analyze<CostReportDataAnalyzeParameters>({
            is_confirmed: true,
            query: {
                granularity: GRANULARITY.MONTHLY,
                group_by: [state.selectedTarget],
                start: _period.start,
                end: _period.end,
                fields: {
                    value_sum: {
                        key: `cost.${costReportPageGetters.currency}`,
                        operator: 'sum',
                    },
                },
                sort: [{
                    key: 'value_sum',
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

/* Util */
const drawChart = () => {
    chartHelper.refreshRoot();
    const chart = chartHelper.createDonutChart({
        paddingLeft: 20,
        paddingRight: 20,
    });
    const seriesSettings = {
        categoryField: 'category',
        valueField: 'value',
    };
    const series = chartHelper.createPieSeries(seriesSettings);
    chart.series.push(series);
    series.slices.template.setAll({
        stroke: chartHelper.color(white),
        templateField: 'pieSettings',
    });
    const tooltip = chartHelper.createTooltip();
    chartHelper.setPieTooltipText(series, tooltip, costReportPageGetters.currency);
    series.slices.template.set('tooltip', tooltip);
    series.data.setAll(cloneDeep(state.chartData));
};

/* Event */
const handleChangeTarget = (target: string) => {
    state.selectedTarget = target;
};

/* Init */
(async () => {
    await store.dispatch('reference/provider/load');
})();

/* Watcher */
watch([() => state.loading, () => chartContext.value], async ([loading, _chartContext]) => {
    if (!loading && _chartContext) drawChart();
}, { immediate: true });
watch(() => costReportPageGetters.recentReportDate, (recentReportDate) => {
    state.currentDate = recentReportDate;
}, { immediate: true });
watch([() => state.currentDate, () => state.selectedTarget, () => costReportPageGetters.currency], (after, before) => {
    if (isEqual(after, before) || !state.currentDate || !costReportPageGetters.currency) return;
    analyzeCostReportData();
}, { immediate: true });
</script>

<template>
    <cost-report-overview-card-template>
        <template #title>
            <span class="title">
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.MONTHLY_TOTAL_AMOUNT_SUMMARY') }}
            </span>
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
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 lg:col-span-6">
                    <p-date-pagination :date.sync="state.currentDate"
                                       :disable-next-button="state.currentDate.isSame(costReportPageGetters.recentReportDate, 'month')"
                    />
                    <div class="summary-wrapper">
                        <div class="summary-label">
                            {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.TOTAL_AMOUNT') }}
                        </div>
                        <p-skeleton v-if="state.loading"
                                    width="8rem"
                                    height="2rem"
                        />
                        <div v-else
                             class="summary-value"
                        >
                            <span class="currency-symbol">{{ CURRENCY_SYMBOL?.[costReportPageGetters.currency] }}</span>
                            <span class="value">{{ currencyMoneyFormatter(state.totalAmount, { currency: costReportPageGetters.currency, style: 'decimal' }) }}</span>
                        </div>
                    </div>
                    <p-link v-if="!storeState.isAdminMode"
                            :action-icon="ACTION_ICON.INTERNAL_LINK"
                            to="/"
                            new-tab
                            highlight
                            size="md"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.SEE_DETAILS') }}
                    </p-link>
                    <p-data-loader class="chart-wrapper"
                                   :loading="state.loading"
                                   :data="state.chartData"
                    >
                        <template #loader>
                            <p-skeleton height="15rem"
                                        width="100%"
                            />
                        </template>
                        <div ref="chartContext"
                             class="chart"
                        />
                    </p-data-loader>
                </div>
                <div class="col-span-12 lg:col-span-6">
                    <p-data-table :fields="state.tableFields"
                                  :items="state.data?.results ?? []"
                                  :loading="state.loading"
                                  table-style-type="simple"
                                  class="summary-data-table"
                    >
                        <template #col-format="{field, value, rowIndex}">
                            <span v-if="field.name === GROUP_BY.WORKSPACE">
                                <span class="toggle-button"
                                      :style="{ 'background-color': DEFAULT_CHART_COLORS[rowIndex] }"
                                />
                                {{ storeState.workspaces[value] ? storeState.workspaces[value].label : value }}
                            </span>
                            <span v-else-if="field.name === GROUP_BY.PROVIDER">
                                <span class="toggle-button"
                                      :style="{ 'background-color': DEFAULT_CHART_COLORS[rowIndex] }"
                                />
                                {{ storeState.providers[value] ? storeState.providers[value].name : value }}
                            </span>
                        </template>
                        <template #col-value_sum-format="{ value }">
                            <span v-if="costReportPageGetters.currency"
                                  class="amount-col"
                            >
                                {{ currencyMoneyFormatter(value, { currency: costReportPageGetters.currency }) }}
                            </span>
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
.amount-col {
    @apply text-label-md;
    font-weight: 500;
}
.toggle-button {
    @apply rounded-full;
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    margin-right: 0.5rem;
}
.chart-wrapper {
    height: 12rem;
    padding-top: 0.5rem;
}
.chart {
    width: 100%;
    height: 12rem;
}
.summary-data-table {
    max-height: 19rem;
}

/* custom design-system component - p-date-pagination */
:deep(.p-date-pagination) {
    .date-text {
        @apply text-display-md;
    }
}
</style>
