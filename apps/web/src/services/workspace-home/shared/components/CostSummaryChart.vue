<script lang="ts" setup>
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { LineSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import { throttle } from 'lodash';

import { numberFormatter } from '@cloudforet/utils';


import type { Currency } from '@/store/display/type';

import { green, blue, coral } from '@/styles/colors';

import type { CostChartData } from '@/services/workspace-home/shared/composables/use-cost-chart-data';

interface Props {
    data: CostChartData[];
    currency: Currency|undefined;
}
const props = withDefaults(defineProps<Props>(), {
    data: () => ([]),
});

const chartContext = ref<HTMLElement|null>(null);

const state = reactive({
    chart: null as EChartsType | null,
    chartData: computed<CostChartData[]>(() => {
        const data = props.data ?? [];
        if (!data) return [];
        return data;
    }),
    chartValueData: computed<string[]>(() => state.chartData.map((m) => m.value)),
    chartDateData: computed<string[]>(() => state.chartData.map((m) => m.date)),
    chartPieces: computed(() => {
        const lastMonth = dayjs().utc().subtract(1, 'month').format('YYYY-MM');
        const currentMonth = dayjs().utc().format('YYYY-MM');
        const currentMarkArea = {
            gt: state.chartDateData.indexOf(currentMonth) - 1 || 0,
            lte: state.chartDateData.indexOf(currentMonth) || 0,
            color: blue[500],
        };
        const lastMonthData = state.chartData.find((i) => i.date === lastMonth);
        if (lastMonthData && !lastMonthData?.is_confirmed) {
            return [
                {
                    lte: state.chartDateData.indexOf(lastMonth) - 1,
                    color: green[700],
                },
                {
                    gt: state.chartDateData.indexOf(lastMonth) - 1,
                    lte: state.chartDateData.indexOf(lastMonth),
                    color: coral[400],
                },
                currentMarkArea,
            ];
        }
        return [
            {
                lte: state.chartDateData.indexOf(currentMonth) - 1 || 0,
                color: green[700],
            },
            currentMarkArea,
        ];
    }),
    chartOptions: computed<LineSeriesOption>(() => ({
        grid: {
            top: 20,
            right: 35,
            bottom: 0,
            left: 30,
            containLabel: true,
        },
        tooltip: {
            trigger: 'axis',
            valueFormatter: (val) => numberFormatter(val) || '',
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: state.chartDateData,
            axisTick: {
                alignWithLabel: true,
            },
            nameTextStyle: {
                fontSize: 12,
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (val) => numberFormatter(val, { notation: 'compact' }),
            },
            splitNumber: 4,
        },
        visualMap: {
            show: false,
            dimension: 0,
            pieces: state.chartPieces,
        },
        series: [
            {
                data: state.chartValueData,
                type: 'line',
            },
        ],
    })),
});

useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 300));
/* Watcher */
watch([() => state.chartData, () => chartContext.value], ([, chartCtx]) => {
    if (chartCtx) {
        state.chart = init(chartContext.value);
        state.chart.setOption(state.chartOptions, true);
    }
}, { immediate: true });
</script>

<template>
    <div class="cost-summary-chart">
        <div ref="chartContext"
             class="chart"
        />
    </div>
</template>

<style lang="postcss" scoped>
.cost-summary-chart {
    height: 16.65rem;
    .chart {
        height: 100%;
        width: 100%;
    }
}
</style>
