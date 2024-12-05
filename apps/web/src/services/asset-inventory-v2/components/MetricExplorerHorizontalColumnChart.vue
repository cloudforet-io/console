<script lang="ts" setup>
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';

import type { LineSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import {
    isEmpty, orderBy, sum, throttle,
} from 'lodash';

import { numberFormatter } from '@cloudforet/utils';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';

import { useProxyValue } from '@/common/composables/proxy-state';
import {
    getReferenceLabel,
} from '@/common/modules/widgets/_helpers/widget-date-helper';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';

import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { MetricDataAnalyzeResult } from '@/services/asset-inventory/types/asset-analysis-type';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';


interface Props {
    loading: boolean;
    data?: AnalyzeResponse<MetricDataAnalyzeResult>;
    legend?: Record<string, boolean>;
}
const props = withDefaults(defineProps<Props>(), {
    loading: true,
    data: () => ({}),
    legend: () => ({}),
});
const emit = defineEmits<{(event: 'update:legends', val: Record<string, boolean>): void;
}>();
const LIMIT = 15;
const chartContext = ref<HTMLElement | null>(null);
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const storeState = reactive({
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
});
const state = reactive({
    proxyLegend: useProxyValue('legend', props, emit),
    chart: null as EChartsType | null,
    yAxisData: [],
    chartData: [],
    parsedGroupBy: computed<string>(() => metricExplorerPageState.selectedChartGroupBy?.replace('labels.', '') || ''),
    chartOptions: computed<LineSeriesOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        grid: {
            left: 0,
            right: '25%',
            containLabel: true,
        },
        legend: {
            type: 'scroll',
            show: true,
            icon: 'circle',
            orient: 'vertical',
            itemWidth: 10,
            itemHeight: 10,
            left: '77%',
            top: 0,
            selected: state.proxyLegend,
            formatter: (val) => getReferenceLabel(storeState.allReferenceTypeInfo, state.parsedGroupBy, val),
        },
        tooltip: {
            formatter: (params) => {
                const _name = getReferenceLabel(storeState.allReferenceTypeInfo, state.parsedGroupBy, params.name);
                const _value = numberFormatter(params.value) || '';
                return `${params.marker} ${_name}: <b>${_value}</b>`;
            },
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                formatter: (val) => numberFormatter(val, { notation: 'compact' }),
            },
        },
        yAxis: {
            type: 'category',
            data: state.yAxisData,
            axisLabel: {
                formatter: (val) => getReferenceLabel(storeState.allReferenceTypeInfo, state.parsedGroupBy, val),
            },
        },
        series: state.chartData,
    })),
});

/* Util */
const getGroupByData = (rawData: AnalyzeResponse<MetricDataAnalyzeResult>) => {
    const _orderedData = orderBy(rawData.results || [], 'count', 'desc');

    const _yAxisData = _orderedData.map((d) => d[state.parsedGroupBy]).slice(0, LIMIT);
    const _etcValue = sum(_orderedData.slice(LIMIT).map((d) => d.count));
    if (_etcValue) _yAxisData.push('etc');
    state.yAxisData = _yAxisData;

    return state.yAxisData.map((d) => ({
        name: d,
        type: 'bar',
        stack: true,
        barMaxWidth: 50,
        data: state.yAxisData.map((v) => {
            if (d === v && d === 'etc') return _etcValue;
            const _data = _orderedData.find((od) => d === v && od[state.parsedGroupBy] === v);
            return _data?.count || 0;
        }),
    }));
};
const getTotalData = (rawData: AnalyzeResponse<MetricDataAnalyzeResult>) => {
    state.yAxisData = ['Total'];
    return [{
        name: 'Total',
        type: 'bar',
        barMaxWidth: 50,
        data: [rawData.results?.[0]?.count],
    }];
};
const drawChart = (rawData?: AnalyzeResponse<MetricDataAnalyzeResult>) => {
    if (isEmpty(rawData)) return;

    if (metricExplorerPageState.selectedChartGroupBy) {
        state.chartData = getGroupByData(rawData);
    } else {
        state.chartData = getTotalData(rawData);
    }

    // init legend
    const _legend: Record<string, boolean> = {};
    if (isEmpty(state.proxyLegend)) {
        const _series = state.chartData.map((d) => d.name);
        _series.forEach((d) => {
            _legend[d] = true;
        });
        state.proxyLegend = _legend;
    }

    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
    state.chart.on('legendselectchanged', (d) => {
        state.proxyLegend = d.selected;
    });
};

watch([() => chartContext.value, () => props.loading, () => props.data], async ([_chartContext, loading, data]) => {
    if (_chartContext && !loading) {
        drawChart(data);
    }
}, { immediate: false });
watch(() => state.proxyLegend, () => {
    state.chart.setOption(state.chartOptions, true);
});
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
