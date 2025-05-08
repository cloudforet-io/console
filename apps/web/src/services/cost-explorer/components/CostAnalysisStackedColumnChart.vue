<script lang="ts" setup>
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { BarSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import isEmpty from 'lodash/isEmpty';
import throttle from 'lodash/throttle';

import {
    PDataLoader, PSkeleton,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';

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
    accumulated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    loading: true,
    data: () => ({}),
    legend: () => ({}),
    accumulated: false,
});
const emit = defineEmits<{(e: 'update:legend', value: Record<string, boolean>): void;
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
    chartData: [] as BarSeriesOption[],
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
const getSeriesData = (slicedData: CostAnalyzeRawData[], etcData: CostAnalyzeRawData[], accumulated: boolean) => {
    const _seriesData: any[] = [];
    const _today = dayjs.utc();
    slicedData.forEach((vd) => {
        let _accumulatedData = 0;
        _seriesData.push({
            name: vd[state.parsedChartGroupBy] || 'Unknown',
            type: 'bar',
            stack: true,
            barMaxWidth: 50,
            data: state.xAxisData.map((xAxis) => {
                if (dayjs.utc(xAxis).isAfter(_today)) return 0;
                const _elem = vd.value_sum?.find((v) => v[DATE_FIELD_NAME] === xAxis);
                const _value = _elem ? _elem?.value : 0;
                if (accumulated) {
                    _accumulatedData += _value;
                    return _accumulatedData;
                }
                return _value;
            }),
        });
    });
    if (etcData.length) {
        let _accumulatedData = 0;
        _seriesData.push({
            name: 'etc',
            type: 'bar',
            stack: true,
            barMaxWidth: 50,
            data: state.xAxisData.map((xAxis) => {
                if (dayjs.utc(xAxis).isAfter(_today)) return 0;
                const _value = etcData.reduce((acc, etcd) => {
                    const _elem = etcd.value_sum?.find((v) => v[DATE_FIELD_NAME] === xAxis);
                    return acc + (_elem ? _elem.value : 0);
                }, 0);
                if (accumulated) {
                    _accumulatedData += _value;
                    return _accumulatedData;
                }
                return _value;
            }),
        });
    }
    return _seriesData;
};
const getGroupByData = (rawData: AnalyzeResponse<CostAnalyzeRawData>, accumulated: boolean): BarSeriesOption[] => {
    const _slicedData = rawData.results?.slice(0, LIMIT) ?? [];
    const _etcData = rawData.results?.slice(LIMIT) ?? [];
    return getSeriesData(_slicedData, _etcData, accumulated);
};
const getTotalData = (rawData: AnalyzeResponse<CostAnalyzeRawData>, accumulated: boolean) => {
    let _data;
    if (accumulated) {
        let _accumulatedData = 0;
        const _today = dayjs.utc();
        _data = state.xAxisData.map((d) => {
            if (dayjs.utc(d).isAfter(_today)) return 0;
            const _elem = rawData.results?.[0]?.value_sum?.find((v) => v[DATE_FIELD_NAME] === d);
            const _value = _elem?.value ?? 0;
            _accumulatedData += _value;
            return _accumulatedData;
        });
    } else {
        _data = state.xAxisData.map((d) => {
            const _elem = rawData.results?.[0]?.value_sum?.find((v) => v[DATE_FIELD_NAME] === d);
            return _elem ? _elem.value : 0;
        });
    }
    return [{
        name: 'Total',
        type: 'bar',
        barMaxWidth: 50,
        data: _data,
    }];
};
const drawChart = (rawData: AnalyzeResponse<CostAnalyzeRawData>, updateLegend = false) => {
    if (isEmpty(rawData)) return;

    if (costAnalysisPageState.chartGroupBy) {
        state.chartData = getGroupByData(rawData, props.accumulated);
    } else {
        state.chartData = getTotalData(rawData, props.accumulated);
    }

    // init legend
    if (updateLegend) {
        const _legend: Record<string, boolean> = {};
        state.chartData.forEach((d) => {
            _legend[d.name] = true;
        });
        state.proxyLegend = _legend;
    }

    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
    if (updateLegend) {
        state.chart.on('legendselectchanged', (d) => {
            state.proxyLegend = d.selected;
        });
    }
};

watch([() => chartContext.value, () => props.loading, () => props.data, () => props.accumulated], async ([_chartContext, loading, data], prev) => {
    if (_chartContext && !loading) {
        drawChart(data, prev[2] !== data);
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
                   :data="state.chartData"
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
