<script lang="ts" setup>
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { LineSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import {
    isEmpty, orderBy, throttle, zipWith,
} from 'lodash';

import { numberFormatter } from '@cloudforet/utils';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';

import { useProxyValue } from '@/common/composables/proxy-state';
import {
    getDateLabelFormat, getReferenceLabel, getWidgetDateFields,
} from '@/common/modules/widgets/_helpers/widget-date-helper';

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
    stacked?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    loading: true,
    data: () => ({}),
    legend: () => ({}),
    stacked: false,
});

const emit = defineEmits<{(event: 'update:legend', val: Record<string, boolean>): void;
}>();
const DATE_FIELD_NAME = 'date';
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
    xAxisData: computed<string[]>(() => getWidgetDateFields(metricExplorerPageState.granularity, metricExplorerPageState.period?.start, metricExplorerPageState.period?.end)),
    chartData: [],
    parsedGroupBy: computed<string>(() => metricExplorerPageState.selectedChartGroupBy?.replace('labels.', '') || ''),
    chartOptions: computed<LineSeriesOption>(() => ({
        grid: {
            left: 50,
            right: '20%',
        },
        legend: {
            type: 'scroll',
            show: true,
            icon: 'circle',
            orient: 'vertical',
            itemWidth: 10,
            itemHeight: 10,
            left: '80%',
            top: 0,
            selected: state.proxyLegend,
            formatter: (val) => getReferenceLabel(storeState.allReferenceTypeInfo, state.parsedGroupBy, val),
        },
        tooltip: {
            trigger: 'axis',
            confine: true,
            formatter: (params) => {
                const _params = params as any[];
                const _axisValue = getReferenceLabel(storeState.allReferenceTypeInfo, DATE_FIELD_NAME, _params[0].axisValue);
                const _values = _params.map((p) => {
                    const _seriesName = getReferenceLabel(storeState.allReferenceTypeInfo, state.parsedGroupBy, p.seriesName);
                    const _value = p.value ? numberFormatter(p.value) : undefined;
                    if (!_value) return undefined;
                    return `${p.marker} ${_seriesName}: <b>${_value}</b>`;
                });
                return [_axisValue, ..._values].filter((d) => !!d).join('<br/>');
            },
        },
        xAxis: {
            type: 'category',
            data: state.xAxisData,
            axisLabel: {
                formatter: (val) => dayjs.utc(val).format(getDateLabelFormat(metricExplorerPageState.granularity)),
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (val) => numberFormatter(val, { notation: 'compact' }),
            },
        },
        series: state.chartData,
    })),
});

const getGroupByData = (rawData: AnalyzeResponse<MetricDataAnalyzeResult>) => {
    const _seriesData: any[] = [];
    const _orderedData = orderBy(rawData?.results || [], '_total_count', 'desc');
    let _etcValueList: number[] = [];
    _orderedData.forEach((d, idx) => {
        if (idx >= LIMIT) {
            const _eachEtcValue: number[] = state.xAxisData.map((date) => {
                const _data = d.count?.find((v) => v[DATE_FIELD_NAME] === date);
                return _data ? _data.value : 0;
            });
            _etcValueList = zipWith(_etcValueList, _eachEtcValue, (a, b) => (a || 0) + (b || 0));
            return;
        }
        _seriesData.push({
            name: d[state.parsedGroupBy] || '--',
            type: 'line',
            stack: props.stacked,
            areaStyle: props.stacked ? {} : undefined,
            data: state.xAxisData.map((date) => {
                const _data = d.count?.find((v) => v[DATE_FIELD_NAME] === date);
                return _data ? _data.value : 0;
            }),
        });
    });
    if (_etcValueList.length) {
        _seriesData.push({
            name: 'etc',
            type: 'line',
            stack: props.stacked,
            areaStyle: props.stacked ? {} : undefined,
            data: _etcValueList,
        });
    }
    return _seriesData;
};
const getTotalData = (rawData: AnalyzeResponse<MetricDataAnalyzeResult>) => ({
    name: 'Total',
    type: 'line',
    stack: props.stacked,
    areaStyle: props.stacked ? {} : undefined,
    data: state.xAxisData.map((d) => {
        const _data = rawData.results?.[0]?.count?.find((v) => v[DATE_FIELD_NAME] === d);
        return _data ? _data.value : 0;
    }),
});
const drawChart = (rawData?: AnalyzeResponse<MetricDataAnalyzeResult>) => {
    if (isEmpty(rawData)) return;

    if (metricExplorerPageState.selectedChartGroupBy) {
        state.chartData = getGroupByData(rawData);
    } else {
        state.chartData = getTotalData(rawData);
    }

    // init legend
    const _legend: Record<string, boolean> = {};
    if (metricExplorerPageState.selectedChartGroupBy && isEmpty(state.proxyLegend)) {
        const _series = state.chartData?.map((d) => d.name);
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
});
watch(() => state.proxyLegend, () => {
    state.chart.setOption(state.chartOptions, true);
});
useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
</script>

<template>
    <div class="h-full">
        <div v-show="props.data?.results?.length"
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
