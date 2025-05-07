<script setup lang="ts">
import {
    computed, reactive, ref, watch, onMounted, onBeforeUnmount,
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

import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';

const budgetPageStore = useBudgetDetailPageStore();
const budgetData = computed(() => budgetPageStore.$state.budgetData);

const chartContext = ref<HTMLElement|null>(null);

interface Props {
    data: any;
}

const props = defineProps<Props>();

const state = reactive({
    data: props.data,
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
                type: 'none',
            },
            formatter: (params: any) => {
                const usageData = params.find((p) => p.seriesName === 'Actual Spend');
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
            icon: 'circle',
            data: [
                { name: 'Planned Budget', itemStyle: { color: indigo[100] } },
                { name: 'Actual Spend (≤ 90%)', itemStyle: { color: indigo[400] } },
                { name: 'Actual Spend (90–100%)', itemStyle: { color: yellow[500] } },
                { name: 'Actual Spend (> 100%)', itemStyle: { color: red[400] } },
            ],
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
            name: 'Planned Budget',
            type: 'bar',
            data: state.data.map(() => 99.5),
            barGap: '-100%',
            itemStyle: {
                color: indigo[100],
            },
            silent: true,
        },
        {
            name: 'Actual Spend',
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
                    if (value > 100) return red[400];
                    if (value > 90) return yellow[500];
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

const handleResize = () => {
    state.chart?.resize();
};

onMounted(() => {
    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
});
</script>

<template>
    <div>
        <div class="chart-wrapper">
            <div ref="chartContext"
                 class="chart"
            />
        </div>
        <div class="legend-custom flex gap-4 mb-6 ml-4 font-normal text-xs text-gray-700">
            <div class="flex items-center gap-1">
                <div class="w-3 h-3 rounded-full bg-indigo-100" />
                <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.PLANNED_BUDGET') }}</span>
            </div>
            <div class="flex items-center gap-1">
                <div class="w-3 h-3 rounded-full bg-indigo-400" />
                <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.ACTUAL_SPEND') }}</span>
            </div>
            <div class="flex items-center gap-1">
                <div class="w-3 h-3 rounded-full bg-yellow-500" />
                <span> 90% &lt; {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.ACTUAL_SPEND') }} &lt; 100%</span>
            </div>
            <div class="flex items-center gap-1">
                <div class="w-3 h-3 rounded-full bg-red-400" />
                <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.ACTUAL_SPEND') }} &gt; 100%</span>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.chart-wrapper {
    height: 20rem;
    overflow-x: auto;
    overflow: visible;
    position: relative;

    .chart {
        height: 100%;
        min-width: 700px;
    }
}
</style>
