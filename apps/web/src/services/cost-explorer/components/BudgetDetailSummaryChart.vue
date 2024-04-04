<script setup lang="ts">
import {
    computed, reactive, ref, watch,
} from 'vue';

import type { XYChart } from '@amcharts/amcharts5/xy';
import { PDataLoader, PSkeleton } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { numberFormatter } from '@cloudforet/utils';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import {
    gray, indigo, red,
} from '@/styles/colors';

import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { getStackedChartData } from '@/services/cost-explorer/helpers/cost-explorer-chart-data-helper';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';
import type { XYChartData } from '@/services/cost-explorer/types/cost-explorer-chart-type';


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
    chart: null as null | XYChart,
    limitProperty: computed(() => ((budgetPageState.budgetData?.time_unit === 'TOTAL') ? 'total_limit' : 'limit')),
    chartData: computed<XYChartData[]>(() => {
        if (props.loading || !budgetPageState.budgetUsageData?.length) return [];
        const accumulatedData = getStackedChartData(budgetPageState.budgetUsageData, GRANULARITY.MONTHLY, {
            start: budgetPageState.budgetData?.start,
            end: budgetPageState.budgetData?.end,
        });
        if (budgetPageState.budgetData?.time_unit === 'TOTAL') {
            accumulatedData.forEach((data) => {
                data.total_limit = budgetPageState.budgetData?.limit;
            });
        }
        return accumulatedData;
    }),
});

const makeMonthlyPlanningLineSeries = (chart: XYChart) => {
    const lineSeries = chartHelper.createXYLineSeries(chart, {
        name: 'date',
        valueYField: state.limitProperty,
        stroke: chartHelper.color(gray[600]),
        fill: chartHelper.color(gray[600]),
    });
    lineSeries.strokes.template.setAll({
        strokeWidth: 1.5,
        strokeDasharray: [4, 2],
    });
    if (state.limitProperty === 'total_limit') {
        lineSeries.bullets.clear();
    }
    return lineSeries;
};

const chartHelper = useAmcharts5(chartContext);
const drawChart = () => {
    const { chart, xAxis, yAxis } = chartHelper.createXYDateChart();

    // set base interval of xAxis
    xAxis.get('baseInterval').timeUnit = 'month';
    // set label adapter of yAxis
    yAxis.get('renderer').labels.template.adapters.add('text', (text) => {
        if (text) {
            const convertedText = text.replace(/,/g, '');
            const num = Number(convertedText);
            if (Number.isNaN(num)) return text;
            return numberFormatter(num);
        }
        return text;
    });

    // create column series
    const columnSeries = chartHelper.createXYColumnSeries(chart, {
        name: 'date',
        valueYField: 'cost',
        stacked: true,
        stroke: undefined,
    });
    columnSeries.columns.template.set('width', chartHelper.percent(25));
    columnSeries.columns.template.adapters.add('fill', (fill, target) => {
        const MonthToDate = dayjs.utc().startOf('month').format('YYYY-MM-DD');
        const data = target.dataItem?.dataContext;
        if (!data) return chartHelper.color(indigo[600]);
        if (data?.date === MonthToDate) {
            return chartHelper.color(indigo[300]);
        }
        if (data[state.limitProperty] < data?.cost) {
            return chartHelper.color(red[400]);
        }
        return chartHelper.color(indigo[600]);
    });

    // set data processor
    columnSeries.data.processor = chartHelper.createDataProcessor({
        dateFormat: 'YYYY-MM',
        dateFields: ['date'],
    });

    // set series to chart and set data
    columnSeries.data.setAll(state.chartData);
    chart.series.push(columnSeries);

    // set tooltip
    const tooltip = chartHelper.createTooltip();
    chartHelper.setXYSingleTooltipText(chart, tooltip, budgetPageState.budgetData?.currency);
    columnSeries.set('tooltip', tooltip);

    // set budget line series
    const lineSeries = makeMonthlyPlanningLineSeries(chart);
    chart.series.push(lineSeries);
    lineSeries.data.setAll(state.chartData);
    return chart;
};

watch([() => chartContext.value, () => props.loading], async ([_chartContext, loading]) => {
    if (_chartContext && !loading) {
        state.chart = drawChart();
    }
}, { immediate: false });
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
