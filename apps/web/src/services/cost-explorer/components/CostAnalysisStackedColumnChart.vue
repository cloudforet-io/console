<script lang="ts" setup>
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { BarSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import {
    isEmpty, throttle,
} from 'lodash';

import {
    PDataLoader, PSkeleton,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';

import { useProxyValue } from '@/common/composables/proxy-state';
import {
    getDateLabelFormat,
    getReferenceLabel,
    getWidgetDateFields,
} from '@/common/modules/widgets/_helpers/widget-date-helper';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';

import { getPeriodByGranularity } from '@/services/cost-explorer/helpers/cost-explorer-period-helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';
import type { CostAnalyzeRawData } from '@/services/cost-explorer/types/cost-analyze-type';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';


interface Props {
    loading: boolean;
    data: AnalyzeResponse<CostAnalyzeRawData>;
    legend?: Record<string, boolean>;
}

const props = withDefaults(defineProps<Props>(), {
    loading: true,
    data: () => ({}),
    legend: () => ({}),
});
const emit = defineEmits<{(e: 'update:legend', value): void;
}>();

const LIMIT = 15;
const DATE_FIELD_NAME = 'date';
const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.state;
const chartContext = ref<HTMLElement | null>(null);
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const storeState = reactive({
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
});
const state = reactive({
    proxyLegend: useProxyValue('legend', props, emit),
    xAxisData: computed(() => {
        const _period = getPeriodByGranularity(costAnalysisPageState.granularity, costAnalysisPageState.period ?? {});
        return getWidgetDateFields(costAnalysisPageState.granularity, _period?.start, _period?.end);
    }),
    parsedChartGroupBy: computed(() => costAnalysisPageState.chartGroupBy?.replace('additional_info.', '').replace('tags.', '')),
    chartData: [],
    chart: null as EChartsType | null,
    chartOptions: computed<BarSeriesOption>(() => ({
        color: MASSIVE_CHART_COLORS,
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
            formatter: (val) => getReferenceLabel(storeState.allReferenceTypeInfo, costAnalysisPageState.chartGroupBy, val),
        },
        tooltip: {
            formatter: (params) => {
                const _params = Array.isArray(params) ? params : [params];
                return _params.map((p) => {
                    const _seriesName = getReferenceLabel(storeState.allReferenceTypeInfo, costAnalysisPageState.chartGroupBy, p.seriesName);
                    const _value = numberFormatter(p.value) || '';
                    return `${_seriesName}<br>${p.marker} ${params.name}: <b>${_value}</b>`;
                }).join('<br>');
            },
        },
        xAxis: {
            type: 'category',
            data: state.xAxisData,
            axisLabel: {
                formatter: (val) => dayjs.utc(val).format(getDateLabelFormat(costAnalysisPageState.granularity)),
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

/* Util */
const getGroupByData = (rawData: AnalyzeResponse<CostAnalyzeRawData>) => {
    const _slicedData = rawData.results?.slice(0, LIMIT);
    const _etcData = rawData.results?.slice(LIMIT);

    const _seriesData: any[] = [];
    _slicedData?.forEach((d) => {
        _seriesData.push({
            name: d[state.parsedChartGroupBy] || 'Unknown',
            type: 'bar',
            stack: true,
            barMaxWidth: 50,
            data: state.xAxisData.map((xAxis) => {
                const _data = d.value_sum?.find((v) => v[DATE_FIELD_NAME] === xAxis);
                return _data ? _data?.value : undefined;
            }),
        });
    });
    if (_etcData?.length) {
        _seriesData.push({
            name: 'etc',
            type: 'bar',
            stack: true,
            barMaxWidth: 50,
            data: state.xAxisData.map((xAxis) => {
                const _data = _etcData.reduce((acc, d) => {
                    const _value = d.value_sum?.find((v) => v[DATE_FIELD_NAME] === xAxis);
                    return acc + (_value ? _value.value : 0);
                }, 0);
                return _data;
            }),
        });
    }
    return _seriesData;
};
const getTotalData = (rawData: AnalyzeResponse<CostAnalyzeRawData>) => [{
    name: 'Total',
    type: 'bar',
    barMaxWidth: 50,
    data: state.xAxisData.map((d) => {
        const _data = rawData.results?.[0]?.value_sum?.find((v) => v[DATE_FIELD_NAME] === d);
        return _data ? _data.value : 0;
    }),
}];
const drawChart = (rawData: AnalyzeResponse<CostAnalyzeRawData>) => {
    if (isEmpty(rawData)) return;

    if (costAnalysisPageState.chartGroupBy) {
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
});
watch(() => state.proxyLegend, () => {
    if (!state.chart) return;
    state.chart?.setOption(state.chartOptions, true);
});
useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
</script>

<template>
    <p-data-loader :loading="props.loading"
                   :data="props.data?.results"
                   class="cost-analysis-stacked-column-chart"
    >
        <template #loader>
            <p-skeleton height="100%" />
        </template>
        <div ref="chartContext"
             class="chart"
        />
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.cost-analysis-stacked-column-chart {
    height: 100%;

    /* custom design-system component - p-data-loader */
    :deep(.data-loader-container) {
        .no-data-wrapper {
            max-height: inherit;
        }
    }
    .chart {
        height: 100%;
    }
}
</style>
