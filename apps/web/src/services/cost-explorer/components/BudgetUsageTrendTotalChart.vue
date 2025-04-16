<script setup lang="ts">
import {
    computed, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { BarSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import { isEmpty } from 'lodash';

import type { Currency } from '@/store/display/type';

import {
    gray, indigo, peacock, red,
} from '@/styles/colors';

import { useBudgetDetailPageStore } from '../stores/budget-detail-page-store';

const budgetpageStore = useBudgetDetailPageStore();
const budgetPageState = budgetpageStore.$state;


interface Props {
    data: any;
}

const props = defineProps<Props>();

const chartContext = ref<HTMLElement|null>(null);

const state = reactive({
    data: computed(() => props.data),
    xAxisData: computed(() => state.data.map((d) => dayjs.utc(d.date).format('MMM YYYY'))),
    chart: null as EChartsType | null,
    chartData: [],
    chartOptions: computed<BarSeriesOption>(() => ({
        grid: {
            left: '3%',
            right: '3%',
            top: '10%',
            bottom: '10%',
            containLabel: true,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
            },
        },
        legend: {
            show: true,
            left: '40px',
            bottom: 0,
            formatter: (name) => name,
            textStyle: {
                rich: {
                    'Planned Budget': {
                        lineHeight: 10,
                    },
                },
            },
        },
        xAxis: {
            type: 'category',
            data: state.xAxisData,
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (number) => {
                    if (number >= 1000000000) {
                        const value = number / 1000000000;
                        return `${value % 1 === 0 ? Math.floor(value) : value.toFixed(2)}T`;
                    }
                    if (number >= 1000000) {
                        const value = number / 1000000;
                        return `${value % 1 === 0 ? Math.floor(value) : value.toFixed(2)}M`;
                    }
                    if (number >= 1000) {
                        const value = number / 1000;
                        return `${value % 1 === 0 ? Math.floor(value) : value.toFixed(2)}K`;
                    }
                    return number.toString();
                },
            },
        },
        series: state.chartData,
    })),
});

const drawChart = (data: {
    budget: number;
    budget_usage: number;
    currency: Currency;
    date: string;
    name: string;
}[]) => {
    if (isEmpty(data)) return;

    let accumulatedValue = 0;
    const accumulatedData: number[] = [];

    data.forEach((item) => {
        accumulatedValue += item.budget_usage;
        accumulatedData.push(accumulatedValue);
    });

    const threshold = Number(budgetPageState.budgetData?.limit ?? 0);

    const accumulatedBelow: (number | null)[] = [];
    const accumulatedAbove: (number | null)[] = [];

    let overThresholdStarted = false;

    accumulatedData.forEach((val) => {
        if (val > threshold) {
            if (!overThresholdStarted) {
                accumulatedBelow.push(val);
                accumulatedAbove.push(val);
                overThresholdStarted = true;
            } else {
                accumulatedBelow.push(null);
                accumulatedAbove.push(val);
            }
        } else {
            accumulatedBelow.push(val);
            accumulatedAbove.push(null);
        }
    });

    state.chartData = [
        {
            name: 'Actual Spend',
            type: 'bar',
            showBackground: false,
            barWidth: '56px',
            label: {
                show: false,
            },
            data: data.map((item) => Number(item.budget_usage).toFixed(2)),
            color: indigo[400],
        },
        {
            name: 'Planned Budget',
            type: 'line',
            symbol: 'none',
            lineStyle: {
                type: 'dashed',
                width: 1,
                color: gray[600],
            },
            data: state.xAxisData.map(() => threshold),
            legendHoverLink: false,
            emphasis: { disabled: true },
            itemStyle: {
                borderWidth: 0,
            },
        },
        {
            name: 'Accumulated Usage (under Planned Budget)',
            type: 'line',
            data: accumulatedBelow,
            lineStyle: {
                color: peacock[400],
                width: 3,
            },
            itemStyle: {
                color: '#fff',
                borderColor: peacock[400],
                borderWidth: 2,
            },
            symbol: 'circle',
            symbolSize: 6,
        },
        {
            name: 'Accumulated Usage (over Planned Budget)',
            type: 'line',
            data: accumulatedAbove,
            lineStyle: {
                color: red[400],
                width: 3,
            },
            itemStyle: {
                color: '#fff',
                borderColor: red[400],
                borderWidth: 2,
            },
            symbol: 'circle',
            symbolSize: 6,
        },
    ];

    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
};

watch([() => state.data, () => budgetPageState], () => {
    drawChart(state.data);
}, { deep: true, immediate: true });
</script>

<template>
    <div class="chart-wrapper">
        <div ref="chartContext"
             class="chart"
        />
    </div>
</template>

<style scoped lang="postcss">
.chart-wrapper {
    @apply mb-6;
    height: 17rem;
    .chart {
        height: 100%;
        width: 100%;
    }
}
</style>
