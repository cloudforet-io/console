<script lang="ts" setup>
import {
    computed,
    reactive,
} from 'vue';

import type { XYChart } from '@amcharts/amcharts5/xy';
import { PSelectButton } from '@spaceone/design-system';
import { debounce } from 'lodash';

import { hideAllSeries, showAllSeries, toggleSeries } from '@/common/composables/amcharts5/concepts-helper';

import MetricExplorerChartLegends from '@/services/asset-inventory/components/MetricExplorerChartLegends.vue';
import { CHART_TYPE } from '@/services/asset-inventory/constants/metric-explorer-constant';
import type { ChartType, Legend } from '@/services/asset-inventory/types/metric-explorer-type';


const state = reactive({
    loading: false,
    chartTypeItems: computed(() => [
        { chartType: CHART_TYPE.LINE, icon: 'ic_chart-line' },
        { chartType: CHART_TYPE.COLUMN, icon: 'ic_chart-bar' },
        { chartType: CHART_TYPE.TREEMAP, icon: 'ic_chart-treemap' },
        { chartType: CHART_TYPE.DONUT, icon: 'ic_chart-donut' },
    ]),
    selectedChartType: CHART_TYPE.LINE as ChartType,
    legends: [] as Legend[],
    // chartData: [] as XYChartData[],
    chart: null as XYChart | null,
});

/* api */
// const analyzeMetricData = async () => {
//     try {
//         return { more: false, results: [] };
//     } catch (e) {
//         ErrorHandler.handleError(e);
//         return { more: false, results: [] };
//     }
// };
const setChartData = debounce(async () => {
    state.loading = true;

    // TODO: get chart data
    // const rawData = await analyzeMetricData();
    // TODO: set legends and chartData
    state.loading = false;
}, 300);

/* Event */
const handleSelectChartType = (chartType) => {
    state.selectedChartType = chartType;
};
const handleToggleSeries = (index) => {
    toggleSeries(state.chart as XYChart, index);
};
const handleAllSeries = (type) => {
    if (type === 'show') {
        showAllSeries(state.chart as XYChart);
    } else {
        hideAllSeries(state.chart as XYChart);
    }
};

// TODO: watch period and get chart data
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
            <!--<metric-explorer-line-chart-->
            <!--<metric-explorer-horizontal-chart-->
            <!--<metric-explorer-tree-map-chart-->
            <!--<metric-explorer-donut-chart-->
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
    }
    .right-part {
        @apply col-span-3;
    }
}
</style>
