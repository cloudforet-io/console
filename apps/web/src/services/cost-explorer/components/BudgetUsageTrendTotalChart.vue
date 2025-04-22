<script setup lang="ts">
import {
    computed, reactive, ref, watch, onMounted, onBeforeUnmount,
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

import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';

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
            formatter: (params) => {
                const tooltipLines = [`${params[0].axisValue}`];
                let accumulatedValue: string | null = null;
                let accumulatedColor = peacock[400];

                params.forEach((param) => {
                    const value = Number(param.data);
                    const formatted = Number.isNaN(value) ? '-' : value.toLocaleString(undefined, { maximumFractionDigits: 3 });

                    if (param.seriesName === 'Accumulated Usage (under Planned Budget)' || param.seriesName === 'Accumulated Usage (over Planned Budget)') {
                        if (accumulatedValue === null || value > Number(accumulatedValue.replace(/,/g, ''))) {
                            accumulatedValue = formatted;
                            if (param.seriesName.includes('over')) {
                                accumulatedColor = red[400];
                            } else {
                                accumulatedColor = peacock[400];
                            }
                        }
                    } else if (param.seriesName === 'Actual Spend') {
                        tooltipLines.push(`${param.marker} ${param.seriesName}: ${param.data}`);
                    } else {
                        tooltipLines.push(`${param.marker} ${param.seriesName}: ${formatted}`);
                    }
                });

                if (accumulatedValue !== null) {
                    const marker = `<span style="display:inline-block;margin-right:4px;border-radius:50%;width:10px;height:10px;background-color:${accumulatedColor};"></span>`;
                    tooltipLines.push(`${marker} Accumulated Usage: ${accumulatedValue}`);
                }

                return tooltipLines.join('<br/>');
            },
        },
        legend: {
            show: true,
            left: '40px',
            bottom: 0,
            selectedMode: false,
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

const handleResize = () => {
    state.chart?.resize();
};

onMounted(() => {
    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
});

const drawChart = (rawData: {
    budget: number;
    budget_usage: number;
    currency: Currency;
    date: string;
    name: string;
}[]) => {
    const data = rawData.slice(0, 12);
    if (isEmpty(data)) return;

    const xAxisData = data.map((d) => dayjs.utc(d.date).format('MMM YYYY'));

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
            data: data.map((item) => Number(item.budget_usage).toFixed(3)),
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
            data: data.map(() => threshold),
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
            color: peacock[400],
        },
        {
            name: 'Accumulated Usage (over Planned Budget)',
            type: 'line',
            data: accumulatedAbove,
            color: red[400],
        },
    ];

    state.chart?.dispose();
    state.chart = init(chartContext.value);
    state.chart.setOption({
        ...state.chartOptions,
        xAxis: {
            ...state.chartOptions.xAxis,
            data: xAxisData,
        },
        series: state.chartData,
    }, true);
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
    overflow-x: auto;

    .chart {
        height: 100%;
        min-width: 62.5rem;
        width: 100%;
    }
}
</style>
