<script lang="ts" setup>
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';

import type { TreemapSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import {
    isEmpty, orderBy, throttle,
} from 'lodash';

import { numberFormatter } from '@cloudforet/utils';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';

import { getReferenceLabel } from '@/common/modules/widgets/_helpers/widget-date-helper';

import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type {
    MetricDataAnalyzeResult,
} from '@/services/asset-inventory/types/asset-analysis-type';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';


interface Props {
    loading: boolean;
    data?: AnalyzeResponse<MetricDataAnalyzeResult>;
}
const props = withDefaults(defineProps<Props>(), {
    loading: true,
    data: () => ({}),
});

const LIMIT = 15;
const chartContext = ref<HTMLElement | null>(null);
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const storeState = reactive({
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
});
const state = reactive({
    parsedGroupBy: computed<string>(() => metricExplorerPageState.selectedChartGroupBy?.replace('labels.', '') || ''),
    chart: null as EChartsType | null,
    chartData: [],
    chartOptions: computed<TreemapSeriesOption>(() => ({
        tooltip: {
            trigger: 'item',
            position: 'inside',
            valueFormatter: (val) => numberFormatter(val) || '',
        },
        legend: {
            show: false,
        },
        series: [
            {
                type: 'treemap',
                roam: 'move',
                nodeClick: false,
                breadcrumb: {
                    show: false,
                },
                label: {
                    fontSize: 12,
                },
                data: state.chartData,
            },
        ],
    })),
});

/* Util */
const getGroupByData = (rawData: AnalyzeResponse<MetricDataAnalyzeResult>) => {
    const _sortedData = orderBy(rawData.results, '_total_count', 'desc');
    const _slicedData = _sortedData.slice(0, LIMIT);
    const _etcValue = _sortedData.slice(LIMIT).reduce((acc, v) => acc + v.count, 0);
    const _etcData = _etcValue ? {
        [state.parsedGroupBy]: 'etc',
        count: _etcValue,
    } : {};
    const _refinedData = isEmpty(_etcData) ? _slicedData : [..._slicedData, _etcData];

    // get chart data
    return _refinedData?.map((v) => ({
        name: getReferenceLabel(storeState.allReferenceTypeInfo, state.parsedGroupBy, v[state.parsedGroupBy]),
        value: v.count,
    })) || [];
};
const getTotalData = (rawData: AnalyzeResponse<MetricDataAnalyzeResult>) => [{
    name: 'Total',
    value: rawData.results?.[0]?.count || 0,
}];
const drawChart = (rawData?: AnalyzeResponse<MetricDataAnalyzeResult>) => {
    if (isEmpty(rawData)) return;

    if (metricExplorerPageState.selectedChartGroupBy) {
        state.chartData = getGroupByData(rawData);
    } else {
        state.chartData = getTotalData(rawData);
    }

    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
};

watch([() => chartContext.value, () => props.loading, () => props.data], async ([_chartContext, loading, data]) => {
    if (_chartContext && !loading) {
        drawChart(data);
    }
}, { immediate: false });
useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
</script>

<template>
    <div class="h-full">
        <div v-show="!props.loading"
             ref="chartContext"
             class="chart"
        />
    </div>
</template>

<style lang="postcss" scoped>
.chart {
    height: 100%;
}
</style>
