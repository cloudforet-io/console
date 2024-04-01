<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import type { XYChart } from '@amcharts/amcharts5/xy';
import { PSelectButton } from '@spaceone/design-system';
import { debounce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { MetricDataAnalyzeParameters } from '@/schema/inventory/metric-data/api-verbs/analyze';
import type { MetricDataModel } from '@/schema/inventory/metric-data/model';

import { hideAllSeries, showAllSeries, toggleSeries } from '@/common/composables/amcharts5/concepts-helper';

import MetricExplorerChartLegends from '@/services/asset-inventory/components/MetricExplorerChartLegends.vue';
import MetricExplorerLineChart from '@/services/asset-inventory/components/MetricExplorerLineChart.vue';
import { CHART_TYPE } from '@/services/asset-inventory/constants/metric-explorer-constant';
import { getLegends, getXYChartData } from '@/services/asset-inventory/helpers/metric-explorer-chart-data-helper';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { ChartType, Legend, Period } from '@/services/asset-inventory/types/metric-explorer-type';


const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;
const state = reactive({
    loading: false,
    data: undefined as any|undefined,
    chartTypeItems: computed(() => [
        { chartType: CHART_TYPE.LINE, icon: 'ic_chart-line' },
        { chartType: CHART_TYPE.COLUMN, icon: 'ic_chart-bar' },
        { chartType: CHART_TYPE.TREEMAP, icon: 'ic_chart-treemap' },
        { chartType: CHART_TYPE.DONUT, icon: 'ic_chart-donut' },
    ]),
    selectedChartType: CHART_TYPE.LINE as ChartType,
    chartData: [] as any[],
    legends: [] as Legend[],
    chart: null as XYChart | null,
});

/* Api */
const analyzeApiQueryHelper = new ApiQueryHelper().setPage(1, 15);
const fetcher = getCancellableFetcher<MetricDataAnalyzeParameters, AnalyzeResponse<MetricDataModel>>(SpaceConnector.clientV2.inventory.metricData.analyze);
const analyzeMetricData = async (): Promise<AnalyzeResponse<MetricDataModel>> => {
    try {
        analyzeApiQueryHelper.setFilters(metricExplorerPageGetters.consoleFilters);
        const { status, response } = await fetcher({
            metric_id: metricExplorerPageState.metricId as string,
            query: {
                granularity: metricExplorerPageState.granularity,
                group_by: metricExplorerPageState.selectedChartGroupBy ? [metricExplorerPageState.selectedChartGroupBy] : [],
                start: metricExplorerPageState.period?.start,
                end: metricExplorerPageState.period?.end,
                fields: {
                    [`value_${metricExplorerPageState.selectedOperator}`]: {
                        key: 'cost', // TODO: change key after api change
                        operator: metricExplorerPageState.selectedOperator,
                    },
                },
                sort: [{ key: `_total_value_${metricExplorerPageState.selectedOperator}`, desc: true }],
                field_group: ['date'],
                ...analyzeApiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response;
        return { more: false, results: [] };
    } catch (e) {
        state.loading = false;
        return { more: false, results: [] };
    }
};
const setChartData = debounce(async () => {
    state.loading = true;

    const rawData = await analyzeMetricData();
    state.legends = getLegends(rawData, metricExplorerPageState.selectedOperator, metricExplorerPageState.selectedChartGroupBy);

    const _granularity = metricExplorerPageState.granularity;
    const _period = metricExplorerPageState.period as Period;
    const _operator = metricExplorerPageState.selectedOperator;
    const _groupBy = metricExplorerPageState.selectedChartGroupBy;
    if (state.selectedChartType === CHART_TYPE.LINE) {
        state.chartData = getXYChartData(rawData, _granularity, _period, _operator, _groupBy);
    } else if (state.selectedChartType === CHART_TYPE.COLUMN) {
        // TODO: implement column chart
    } else if (state.selectedChartType === CHART_TYPE.DONUT) {
        // TODO: implement donut chart
    } else if (state.selectedChartType === CHART_TYPE.TREEMAP) {
        // TODO: implement treemap chart
    }
    state.loading = false;
}, 300);

/* Event */
const handleSelectChartType = (chartType: ChartType) => {
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
    () => state.selectedChartType,
], async ([metricId]) => {
    if (!metricId) return;
    await setChartData();
}, { immediate: true });
setChartData();
</script>

<template>
    <div class="metric-explorer-chart">
        <div class="left-part">
            <div class="chart-type-button-wrapper">
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
                <metric-explorer-line-chart :loading="state.loading"
                                            :chart.sync="state.chart"
                                            :chart-data="state.chartData"
                                            :legends="state.legends"
                />
                <!--<metric-explorer-horizontal-column-chart-->
                <!--<metric-explorer-tree-map-chart-->
                <!--<metric-explorer-donut-chart-->
            </div>
        </div>
        <div class="right-part">
            <metric-explorer-chart-legends :legends="state.legends"
                                           :loading="state.loading"
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
