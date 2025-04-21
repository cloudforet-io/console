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

import { CURRENCY_SYMBOL } from '@/store/display/constant';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    indigo, red, yellow,
} from '@/styles/colors';

import { useBudgetDetailPageStore } from '../stores/budget-detail-page-store';

const budgetPageStore = useBudgetDetailPageStore();
const budgetData = computed(() => budgetPageStore.$state.budgetData);

const chartContext = ref<HTMLElement|null>(null);

const state = reactive({
    data: [],
    xAxisData: computed(() => state.data.map((d) => dayjs.utc(d.date).format('MMM YYYY'))),
    yAxisData: computed(() => [0, 25, 50, 75, 100]),
    chart: null as EChartsType | null,
    chartData: [],
    chartOptions: computed<BarSeriesOption>(() => ({
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
            formatter: (params: any) => {
                const usageData = params.find((p) => p.seriesName === 'Budget Usage Trend');
                if (!usageData) return '';

                const index = usageData.dataIndex;
                const item = state.data[index];

                const usage = Number(item.budget_usage);
                const budget = Number(item.budget);
                const usageFormatted = usage.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
                const budgetFormatted = budget.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
                const rate = Math.floor((usage / budget) * 100);
                const remaining = (budget - usage).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

                const currency = CURRENCY_SYMBOL[budgetData.value?.currency ?? 'KRW'];
                const month = dayjs.utc(item.date).format('MMM YYYY');

                return `
                    <div style="margin-bottom: 4px;"><b>${month}</b></div>
                    <div>Planned Budget: ${currency} ${budgetFormatted}</div>
                    <div>Actual Spend: ${currency} ${usageFormatted}</div>
                    <div>Usage Rate: ${rate}%</div>
                    <div>Budget Remaining: ${currency} ${remaining}</div>
                `;
            },
        },
        legend: {
            show: false,
        },
        xAxis: {
            type: 'category',
            data: state.xAxisData,
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: Number(Math.max(...state.data.map((d) => (d.budget_usage / d.budget) * 100)).toFixed(0)) < 100
                ? 100 : Math.max(...state.data.map((d) => (d.budget_usage / d.budget) * 100)).toFixed(0),
            interval: 100,
            axisLabel: {
                formatter: (value) => `${value}%`,
            },
        },
        series: state.chartData,
    })),
});

const fetchBudgetUsageAnalyze = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze({
            budget_id: budgetData.value?.budget_id,
            query: {
                group_by: ['name', 'date', 'currency'],
                fields: {
                    budget_usage: {
                        key: 'cost',
                        operator: 'sum',
                    },
                    budget: {
                        key: 'limit',
                        operator: 'sum',
                    },
                },
                sort: [{ key: 'date', desc: false }],
            },
        });
        state.data = results;
    } catch (error) {
        ErrorHandler.handleError(error);
    }
};

const drawChart = (data: any) => {
    if (isEmpty(data)) return;

    state.chartData = [
        {
            name: 'Budget Background (0~100%)',
            type: 'bar',
            data: state.data.map(() => 100),
            barGap: '-100%',
            itemStyle: {
                color: indigo[100],
            },
            silent: true,
        },
        {
            name: 'Budget Usage Trend',
            type: 'bar',
            data: state.data.map((item) => Number(((item.budget_usage / item.budget) * 100).toFixed(2))),
            minBarHeight: 4,
            label: {
                show: true,
                position: 'insideBottom',
                distance: 4,
                formatter: (params) => `${params.value}%`,
            },
            itemStyle: {
                color: (params: any) => {
                    const value = Number(params.value);
                    if (value >= 100) return red[400];
                    if (value >= 90) return yellow[500];
                    return indigo[400];
                },
            },
        },
    ];
    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
};

watch(() => state.data, () => {
    drawChart(state.data);
}, { deep: true, immediate: true });

watch(() => budgetData, async () => {
    await fetchBudgetUsageAnalyze();
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
    height: 17rem;
    .chart {
        height: 100%;
        width: 100%;
    }
}
</style>
