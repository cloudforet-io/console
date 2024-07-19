<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { BarSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import { throttle } from 'lodash';

import { PDataLoader, PSkeleton } from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import {
    getDateLabelFormat, getWidgetDateFields,
} from '@/common/modules/widgets/_helpers/widget-date-helper';

import {
    gray, indigo, red,
} from '@/styles/colors';

import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';


interface Props {
    loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    loading: true,
});

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;
const chartContext = ref<HTMLElement | null>(null);
const state = reactive({
    limitProperty: computed(() => ((budgetPageState.budgetData?.time_unit === 'TOTAL') ? 'total_limit' : 'limit')),
    xAxisData: computed(() => getWidgetDateFields(GRANULARITY.MONTHLY, budgetPageState.budgetData?.start, budgetPageState.budgetData?.end)),
    chartData: [],
    chart: null as EChartsType | null,
    chartOptions: computed<BarSeriesOption>(() => ({
        grid: {
            left: '3%',
            right: 10,
            top: 10,
            bottom: 30,
        },
        legend: {
            show: false,
        },
        tooltip: {
        },
        xAxis: {
            type: 'category',
            data: state.xAxisData,
            axisLabel: {
                formatter: (val) => dayjs.utc(val).format(getDateLabelFormat(GRANULARITY.MONTHLY)),
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

const drawChart = () => {
    const _totalLimit = state.limitProperty === 'total_limit' ? budgetPageState.budgetData?.limit : undefined;
    let _accumulatedValue = 0;
    const _accumulatedData: any[] = [];
    state.xAxisData.forEach((d) => {
        const _data = budgetPageState.budgetUsageData?.find((v) => v.date === d);
        const _limit = _totalLimit || _data?.limit || 0;
        const _cost = _data?.cost || 0;
        _accumulatedValue += _cost;
        _accumulatedData.push({
            value: _accumulatedValue,
            itemStyle: {
                color: _limit < _accumulatedValue ? red[400] : indigo[600],
            },
        });
    });
    state.chartData = [
        {
            name: '',
            type: 'bar',
            barMaxWidth: 25,
            data: _accumulatedData,
        },
        {
            name: '',
            type: 'line',
            symbol: 'none',
            lineStyle: {
                type: 'dashed',
                width: 1,
                color: gray[600],
            },
            data: state.xAxisData.map((d) => {
                const _data = budgetPageState.budgetUsageData?.find((v) => v.date === d);
                return _totalLimit || _data?.limit || 0;
            }),
        },
    ];

    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
};

watch([() => chartContext.value, () => props.loading], async ([_chartContext, loading]) => {
    if (_chartContext && !loading) {
        drawChart();
    }
}, { immediate: true });
useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
</script>

<template>
    <p-data-loader :loading="props.loading"
                   class="budget-detail-summary-chart"
    >
        <template #loader>
            <p-skeleton height="100%" />
        </template>
        <div ref="chartContext"
             class="chart"
        />
    </p-data-loader>
</template>

<style lang="scss" scoped>
.budget-detail-summary-chart {
    height: 15rem;
    .chart {
        height: 100%;
    }
}
</style>
