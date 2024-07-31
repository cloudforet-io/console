<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { LineSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import { isEmpty, throttle } from 'lodash';

import {
    PDataLoader, PSkeleton, PSpinner, PTooltip,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { MonitoringResourceType, Unit } from '@/common/components/charts/metric-chart/type';

interface ChartData {
    label: string;
    [key: string]: number | string;
}
interface Props {
    loading: boolean;
    dataset: Record<string, number[]>;
    labels: string[];
    resources: MonitoringResourceType[];
    unit: Unit;
    timezone?: string;
    title: string;
    error: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    loading: true,
    dataset: () => ({}),
    labels: () => ([]),
    resources: () => ([]),
    unit: () => ({ x: 'Timestamp', y: 'Count' }),
    timezone: 'UTC',
    title: '',
    error: false,
});

const chartContext = ref<HTMLElement|null>(null);
const state = reactive({
    chart: null as EChartsType | null,
    chartData: [] as ChartData[],
    chartOptions: computed<LineSeriesOption>(() => ({
        legend: {
            type: 'scroll',
            show: true,
            bottom: 0,
            left: 0,
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
        },
        tooltip: {
            trigger: 'axis',
            confine: true,
            valueFormatter: (val) => numberFormatter(val) || '',
        },
        grid: {
            top: 10,
            bottom: 20,
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: props.labels,
            axisLabel: {
                formatter: (val) => dayjs.utc(val).format('M/D\nHH:mm'),
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

const drawChart = (rawData) => {
    if (isEmpty(rawData)) return;

    const _seriesData: any[] = [];
    Object.entries(rawData).forEach(([key, value]) => {
        _seriesData.push({
            name: key,
            type: 'line',
            data: value,
            showSymbol: false,
        });
    });
    state.chartData = _seriesData;
    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
};

/* Watcher */
watch([() => props.loading, () => chartContext.value], ([loading, chartCtx]) => {
    if (!loading && chartCtx) {
        drawChart(props.dataset);
    }
});
useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
</script>

<template>
    <div class="p-metric-chart">
        <div class="chart-title-wrapper">
            <p-tooltip :contents="props.title"
                       class="chart-title"
            >
                <span class="chart-title">{{ props.title }}</span>
            </p-tooltip>
            <span class="chart-unit ">&nbsp; {{ props.unit.y ? `(${props.unit.y})` : '' }}</span>
            <p-spinner v-if="props.loading && state.chart" />
        </div>
        <p-data-loader :loading="loading && !state.chart"
                       :data="state.chartData"
                       class="chart-wrapper"
                       show-data-from-scratch
        >
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartContext"
                 class="chart"
            />
            <transition name="fade-in">
                <div v-if="props.error"
                     class="shade"
                >
                    <span>{{ $t('COMMON.COMPONENTS.METRIC_CHART.UNAVAILABLE') }}</span>
                </div>
            </transition>
            <template #no-data>
                <span class="no-data-text">
                    {{ $t('COMMON.COMPONENTS.METRIC_CHART.NO_DATA') }}
                </span>
            </template>
        </p-data-loader>
    </div>
</template>

<style lang="postcss">
.p-metric-chart {
    @apply bg-white rounded-lg;
    position: relative;
    box-shadow: 0 2px 4px rgba(theme('colors.black'), 0.06);
    padding: 1.25rem;

    .chart-title-wrapper {
        @apply flex justify-between;
        .chart-title {
            @apply text-sm font-bold capitalize truncate;
        }
        .chart-unit {
            @apply text-sm text-gray flex-shrink ml-2;
        }
    }

    .chart-wrapper {
        position: relative;
        height: 12.5rem;
        width: 100%;
        margin-top: 1.25rem;
        .chart {
            height: 100%;
            width: 100%;
        }
        .no-data-text {
            @apply text-gray-400;
            position: absolute;
        }
    }

    .p-data-loader {
        .data-wrapper {
            overflow-y: hidden;
        }
    }
}
</style>
