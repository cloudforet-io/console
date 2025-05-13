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

import { indigo } from '@/styles/colors';

import { useBudgetCreatePageStore } from '@/services/cost-explorer/stores/budget-create-page-store';

const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;

const chartContext = ref<HTMLElement|null>(null);

const state = reactive({
    data: {},
    xAxisData: computed(() => {
        const startDate = budgetCreatePageState.startMonth.length > 0
            ? dayjs.utc(budgetCreatePageState.startMonth[0]).subtract(1, 'year')
            : dayjs.utc().subtract(1, 'year').subtract(3, 'month');
        const endDate = budgetCreatePageState.endMonth.length > 0
            ? dayjs.utc(budgetCreatePageState.endMonth[0]).subtract(1, 'year')
            : dayjs.utc().subtract(1, 'year').subtract(1, 'month');
        const monthDiff = endDate.diff(startDate, 'month');

        return Array.from({ length: monthDiff + 1 }, (_, i) => startDate.add(i, 'month').format('YYYY-MM'));
    }),
    chart: null as EChartsType | null,
    chartData: [],
    chartOptions: computed<BarSeriesOption>(() => ({
        color: indigo[400],
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

    const dataMap: Record<string, number> = {};
    results.forEach((item) => {
        (item.cost_trend || []).forEach((trend) => {
            dataMap[trend.date] = (dataMap[trend.date] || 0) + trend.value;
        });
    });

    return allDates.map((date) => ({
        date,
        value: dataMap[date] || 0,
    }));
};

const fetchBudgetUsageAnalyze = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.costAnalysis.unifiedCost.analyze({
            query: {
                start: dayjs.utc(budgetCreatePageState.startMonth[0]).subtract(1, 'year').format('YYYY-MM'),
                end: dayjs.utc(budgetCreatePageState.endMonth[0]).subtract(1, 'year').format('YYYY-MM'),
                group_by: !budgetCreatePageState.scope.serviceAccount ? ['project_id', 'is_confirmed'] : ['project_id', 'service_account_id', 'is_confirmed'],
                fields: {
                    cost_trend: {
                        key: `cost.${budgetCreatePageState.currency}`,
                        operator: 'sum',
                    },
                },
                granularity: 'MONTHLY',
                field_group: ['date'],
                filter: !budgetCreatePageState.scope.serviceAccount ? [
                    { k: 'project_id', v: budgetCreatePageState.project, o: 'eq' },
                ] : [
                    { k: 'service_account_id', v: budgetCreatePageState.scope.serviceAccount, o: 'eq' },
                ],
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
        type: 'bar',
        stack: false,
        barMaxWidth: 50,
        itemStyle: {
            color: indigo[400],
        },
        label: {
            show: true,
            position: 'top',
            formatter: (params) => `${CURRENCY_SYMBOL[budgetCreatePageState.currency]} ${Number(params.value).toFixed(2)}`,
        },
        data: data.map((item) => item.value),
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
    <p-pane-layout class="chart-wrapper p-4">
        <p class="font-bold text-sm">
            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.PREVIOUS_PERIOD_SPEND') }}
        </p>
        <div ref="chartContext"
             class="chart"
        />
    </p-pane-layout>
</template>

<style scoped lang="postcss">
.chart-wrapper {
    width: 56rem;
    height: 17rem;
    .chart {
        height: 100%;
        width: 100%;
    }
}
</style>
