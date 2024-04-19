<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import type * as am5percent from '@amcharts/amcharts5/percent';
import type { XYChart } from '@amcharts/amcharts5/xy';
import { PSelectButton } from '@spaceone/design-system';
import { debounce, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { MetricDataAnalyzeParameters } from '@/schema/inventory/metric-data/api-verbs/analyze';

import { hideAllSeries, showAllSeries, toggleSeries } from '@/common/composables/amcharts5/concepts-helper';

import MetricExplorerChartLegends from '@/services/asset-inventory/components/MetricExplorerChartLegends.vue';
import MetricExplorerDonutChart from '@/services/asset-inventory/components/MetricExplorerDonutChart.vue';
import MetricExplorerHorizontalColumnChart
    from '@/services/asset-inventory/components/MetricExplorerHorizontalColumnChart.vue';
import MetricExplorerLineChart from '@/services/asset-inventory/components/MetricExplorerLineChart.vue';
import MetricExplorerTreeMapChart from '@/services/asset-inventory/components/MetricExplorerTreeMapChart.vue';
import { CHART_TYPE } from '@/services/asset-inventory/constants/metric-explorer-constant';
import {
    getMetricChartLegends, getRefinedMetricRealtimeChartData, getRefinedMetricXYChartData,
} from '@/services/asset-inventory/helpers/metric-explorer-chart-data-helper';
import {
    getRefinedMetricDataAnalyzeQueryGroupBy,
} from '@/services/asset-inventory/helpers/metric-explorer-data-helper';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type {
    ChartType, Legend, MetricDataAnalyzeResult, Period,
    XYChartData, RealtimeChartData,
} from '@/services/asset-inventory/types/metric-explorer-type';


const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;
const state = reactive({
    loading: false,
    data: undefined as undefined|AnalyzeResponse<MetricDataAnalyzeResult>,
    chartTypeItems: computed(() => [
        { chartType: CHART_TYPE.LINE, icon: 'ic_chart-line' },
        { chartType: CHART_TYPE.COLUMN, icon: 'ic_chart-bar' },
        { chartType: CHART_TYPE.TREEMAP, icon: 'ic_chart-treemap' },
        { chartType: CHART_TYPE.DONUT, icon: 'ic_chart-donut' },
    ]),
    selectedChartType: CHART_TYPE.LINE as ChartType,
    chartData: [] as Array<XYChartData|RealtimeChartData>,
    legends: [] as Legend[],
    chart: null as XYChart|am5percent.PieChart| null,
    isRealtimeChart: computed<boolean>(() => state.selectedChartType !== CHART_TYPE.LINE),
    periodText: computed<string>(() => {
        if (isEmpty(metricExplorerPageState.period)) return '';
        if (state.isRealtimeChart) return metricExplorerPageState.period.end || '';
        return `${metricExplorerPageState.period.start} ~ ${metricExplorerPageState.period.end}`;
    }),
});

/* Api */
const analyzeApiQueryHelper = new ApiQueryHelper().setPage(1, 15);
const fetcher = getCancellableFetcher<MetricDataAnalyzeParameters, AnalyzeResponse<MetricDataAnalyzeResult>>(SpaceConnector.clientV2.inventory.metricData.analyze);
const analyzeMetricData = async (): Promise<AnalyzeResponse<MetricDataAnalyzeResult>> => {
    try {
        analyzeApiQueryHelper.setFilters(metricExplorerPageGetters.consoleFilters);
        const _groupBy = metricExplorerPageState.selectedChartGroupBy ? [getRefinedMetricDataAnalyzeQueryGroupBy(metricExplorerPageState.selectedChartGroupBy)] : [];
        const { status, response } = await fetcher({
            metric_id: metricExplorerPageState.metricId as string,
            query: {
                granularity: metricExplorerPageState.granularity,
                group_by: _groupBy,
                start: state.isRealtimeChart ? metricExplorerPageState.period?.end : metricExplorerPageState.period?.start,
                end: metricExplorerPageState.period?.end,
                fields: {
                    count: {
                        key: 'value',
                        operator: metricExplorerPageState.selectedOperator,
                    },
                },
                sort: [{ key: '_total_count', desc: true }],
                field_group: ['date'],
                ...analyzeApiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response;
        return { more: false, results: [] };
    } catch (e) {
        return { more: false, results: [] };
    }
};
const setChartData = debounce(async () => {
    state.loading = true;

    const rawData = await analyzeMetricData();
    state.data = rawData;

    const _granularity = metricExplorerPageState.granularity;
    const _period = metricExplorerPageState.period as Period;
    const _groupBy = metricExplorerPageState.selectedChartGroupBy;

    state.legends = getMetricChartLegends(state.selectedChartType, rawData, _groupBy);
    if (state.isRealtimeChart) {
        state.chartData = getRefinedMetricRealtimeChartData(rawData, _groupBy);
    } else {
        state.chartData = getRefinedMetricXYChartData(rawData, _granularity, _period, _groupBy);
    }
    state.loading = false;
}, 300);

/* Event */
const handleSelectChartType = (chartType: ChartType) => {
    setChartData();
    state.selectedChartType = chartType;
};
const handleToggleSeries = (index: number) => {
    toggleSeries(state.chart as XYChart, index);
};
const handleAllSeries = (type: string) => {
    if (type === 'show') {
        showAllSeries(state.chart as XYChart);
    } else {
        hideAllSeries(state.chart as XYChart);
    }
};

watch([
    () => metricExplorerPageState.metricId,
    () => metricExplorerPageState.period,
    () => metricExplorerPageState.selectedOperator,
    () => metricExplorerPageState.selectedChartGroupBy,
    () => metricExplorerPageGetters.consoleFilters,
], async ([metricId]) => {
    if (!metricId) return;
    await setChartData();
}, { immediate: true });
watch(() => metricExplorerPageState.refreshMetricData, async (refresh) => {
    if (refresh) {
        await setChartData();
        metricExplorerPageStore.setRefreshMetricData(false);
    }
}, { immediate: false });
</script>

<template>
    <div class="metric-explorer-chart">
        <div class="left-part">
            <div class="chart-type-button-wrapper">
                <span class="period-text">
                    {{ state.periodText }}
                </span>
                <p-select-button v-for="item in state.chartTypeItems"
                                 :key="`chart-select-button-${item.chartType}`"
                                 :selected="state.selectedChartType"
                                 :value="item.chartType"
                                 :icon-name="item.icon"
                                 layout="icon-only"
                                 style-type="gray"
                                 size="sm"
                                 @change="handleSelectChartType"
                />
            </div>
            <div class="chart-wrapper">
                <metric-explorer-line-chart
                    v-if="state.selectedChartType === CHART_TYPE.LINE"
                    :loading="state.loading"
                    :chart.sync="state.chart"
                    :chart-data="state.chartData"
                    :legends="state.legends"
                />
                <metric-explorer-donut-chart
                    v-else-if="state.selectedChartType === CHART_TYPE.DONUT"
                    :loading="state.loading"
                    :chart.sync="state.chart"
                    :chart-data="state.chartData"
                    :legends="state.legends"
                />
                <metric-explorer-tree-map-chart
                    v-else-if="state.selectedChartType === CHART_TYPE.TREEMAP"
                    :loading="state.loading"
                    :chart-data="state.chartData"
                    :legends="state.legends"
                />
                <metric-explorer-horizontal-column-chart
                    v-else-if="state.selectedChartType === CHART_TYPE.COLUMN"
                    :loading="state.loading"
                    :chart.sync="state.chart"
                    :chart-data="state.chartData"
                />
            </div>
        </div>
        <div class="right-part">
            <metric-explorer-chart-legends :legends.sync="state.legends"
                                           :loading="state.loading"
                                           :more="state.data?.more"
                                           :chart-type="state.selectedChartType"
                                           @toggle-series="handleToggleSeries"
                                           @show-all-series="handleAllSeries('show')"
                                           @hide-all-series="handleAllSeries('hide')"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.metric-explorer-chart {
    @apply grid grid-cols-12 border border-gray-200 rounded-md;
    grid-gap: 1rem;
    height: 29.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
    .left-part {
        @apply col-span-9;
        .chart-type-button-wrapper {
            display: flex;
            justify-content: flex-end;
            gap: 0.375rem;
            align-items: center;
        }
        .period-text {
            @apply text-label-md text-gray-500;
            font-weight: 400;
            padding-right: 0.125rem;
        }
        .chart-wrapper {
            height: 25rem;
            padding-top: 0.5rem;
            padding-bottom: 1rem;
        }
    }
    .right-part {
        @apply col-span-3;
    }
}
</style>
