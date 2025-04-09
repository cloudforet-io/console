<script setup lang="ts">
import {
    computed, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { BarSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type { EChartsType } from 'echarts/core';
import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PPaneLayout } from '@cloudforet/mirinae';

import { CURRENCY_SYMBOL } from '@/store/display/constant';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useBudgetCreatePageStore } from '../stores/budget-create-page-store';

const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;

const chartContext = ref<HTMLElement|null>(null);

const state = reactive({
    data: {},
    xAxisData: computed(() => {
        const startDate = budgetCreatePageState.startMonth.length > 0
            ? dayjs.utc(budgetCreatePageState.startMonth[0])
            : dayjs.utc().subtract(3, 'month');
        const endDate = budgetCreatePageState.endMonth.length > 0
            ? dayjs.utc(budgetCreatePageState.endMonth[0])
            : dayjs.utc().subtract(1, 'month');
        const monthDiff = endDate.diff(startDate, 'month');

        return Array.from({ length: monthDiff + 1 }, (_, i) => startDate.add(i, 'month').format('YYYY-MM'));
    }),
    chart: null as EChartsType | null,
    chartData: [],
    chartOptions: computed<BarSeriesOption>(() => ({
        color: '#7F9CF5',
        grid: {
            left: '3%',
            right: '3%',
            top: '10%',
            bottom: '5%',
            containLabel: true,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
            },
            valueFormatter: (value) => Number(value).toFixed(2),
        },
        legend: {
            show: false,
        },
        xAxisLabel: {
            show: true,
        },
        xAxis: {
            type: 'category',
            data: state.xAxisData,
            axisLabel: {
                formatter: (value: string) => dayjs(value).format('MMM YYYY'),
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (value: number) => {
                    const currencySymbol = CURRENCY_SYMBOL[budgetCreatePageState.currency];
                    return `${currencySymbol} ${value}`;
                },
            },
        },
        series: state.chartData,
    })),
});

const processData = (results: any[]) => {
    const allDates = state.xAxisData;

    const processedData = allDates.map((date) => {
        const matchingResults = results.filter((r) => r.date === date);
        return {
            date,
            average_cost: matchingResults.length > 0
                ? matchingResults.reduce((sum, curr) => sum + curr.cost_trend, 0) / matchingResults.length
                : 0,
        };
    });

    return processedData;
};

const fetchBudgetUsageAnalyze = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze({
            query: {
                group_by: ['budget_id', 'name', 'date'],
                start: budgetCreatePageState.startMonth.length > 0 ? dayjs.utc(budgetCreatePageState.startMonth[0]).format('YYYY-MM') : dayjs.utc().subtract(3, 'month').format('YYYY-MM'),
                end: budgetCreatePageState.endMonth.length > 0 ? dayjs.utc(budgetCreatePageState.endMonth[0]).format('YYYY-MM') : dayjs.utc().subtract(1, 'month').format('YYYY-MM'),
                fields: {
                    cost_trend: {
                        key: 'cost',
                        operator: 'average',
                    },
                },
            },
        });
        state.data = processData(results);
    } catch (error) {
        ErrorHandler.handleError(error);
    }
};

const drawChart = (data: any) => {
    if (isEmpty(data)) return;

    state.chartData = {
        name: `Last ${state.xAxisData.length} Month Cost Trend`,
        type: 'bar',
        stack: false,
        barMaxWidth: 50,
        itemStyle: {
            color: '#7F9CF5',
        },
        label: {
            show: true,
            position: 'top',
            formatter: (params) => `${CURRENCY_SYMBOL[budgetCreatePageState.currency]} ${Number(params.value).toFixed(2)}`,
        },
        data: data.map((item) => item.average_cost),
    };
    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
};

watch(() => state.data, () => {
    drawChart(state.data);
}, { deep: true, immediate: true });

watch(() => budgetCreatePageState, async () => {
    await fetchBudgetUsageAnalyze();
}, { deep: true, immediate: true });
</script>

<template>
    <p-pane-layout class="chart-wrapper">
        <div ref="chartContext"
             class="chart"
        />
    </p-pane-layout>
</template>

<style scoped lang="postcss">
.chart-wrapper {
    width: 25rem;
    height: 17rem;
    .chart {
        height: 100%;
        width: 100%;
    }
}
</style>
