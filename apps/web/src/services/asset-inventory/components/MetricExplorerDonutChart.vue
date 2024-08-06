<script lang="ts" setup>
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';

import type { PieSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import { isEmpty, orderBy, throttle } from 'lodash';

import { numberFormatter } from '@cloudforet/utils';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';

import { useProxyValue } from '@/common/composables/proxy-state';
import { getReferenceLabel } from '@/common/modules/widgets/_helpers/widget-date-helper';

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
    legend: Record<string, boolean>;
}
const props = withDefaults(defineProps<Props>(), {
    loading: true,
    data: () => ({}),
    legend: () => ({}),
});
const emit = defineEmits<{(event: 'update:legend', val: Record<string, boolean>): void;
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
    parsedGroupBy: computed<string>(() => metricExplorerPageState.selectedChartGroupBy?.replace('labels.', '') || ''),
    chart: null as EChartsType | null,
    chartData: [],
    chartOptions: computed<PieSeriesOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        tooltip: {
            trigger: 'item',
            position: 'inside',
            formatter: (params) => {
                const _name = getReferenceLabel(storeState.allReferenceTypeInfo, state.parsedGroupBy, params.name);
                const _value = numberFormatter(params.value) || '';
                return `${params.marker} ${_name}: <b>${_value}</b>`;
            },
        },
        grid: {
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
        series: [
            {
                type: 'pie',
                radius: ['60%', '80%'],
                center: ['40%', '45%'],
                data: state.chartData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
                avoidLabelOverlap: false,
                label: {
                    show: false,
                },
            },
        ],
    })),
});

/* Util */
const getGroupByData = (rawData: AnalyzeResponse<MetricDataAnalyzeResult>) => {
    const _orderedData = orderBy(rawData.results || [], '_total_count', 'desc');
    const _slicedData = _orderedData.slice(0, LIMIT);
    const _etcData = _orderedData.slice(LIMIT).reduce((acc, cur) => {
        acc[state.parsedGroupBy] = 'etc';
        acc.count = (acc.count || 0) + (cur.count || 0);
        return acc;
    }, {} as Record<string, string|number>);
    const _refinedData = isEmpty(_etcData) ? _slicedData : [..._slicedData, _etcData];
    return _refinedData?.map((v) => ({
        name: v[state.parsedGroupBy] || '--',
        value: v?.count || 0,
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
