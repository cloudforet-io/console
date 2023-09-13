<script setup lang="ts">

import {
    computed, onUnmounted, reactive, ref, watch,
} from 'vue';

import * as am4charts from '@amcharts/amcharts4/charts';
import type { XYChart } from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { PDataLoader, PSkeleton } from '@spaceone/design-system';
import dayjs from 'dayjs';

import config from '@/lib/config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    gray, indigo, red,
} from '@/styles/colors';

import type { BudgetModel, BudgetUsageModel } from '@/services/cost-explorer/budget/model';
import { BUDGET_TIME_UNIT } from '@/services/cost-explorer/budget/model';
import { getStackedChartData } from '@/services/cost-explorer/cost-analysis/lib/widget-data-helper';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/store/budget-detail-page-store';


const categoryKey = 'date';
const columnChartValueName = 'cost';

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;

const chartRef = ref<HTMLElement|null>(null);

const state = reactive({
    chart: null as XYChart | null,
    chartRegistry: {},
    limitProperty: computed(() => ((state.budgetData.time_unit === BUDGET_TIME_UNIT.TOTAL) ? 'total_limit' : 'limit')),
    chartData: [] as any,
    loading: true,
    budgetUsageData: computed<BudgetUsageModel|null>(() => budgetPageState.budgetUsageData),
    budgetData: computed<BudgetModel|null>(() => budgetPageState.budgetData),
});

const getChartData = () => {
    try {
        state.loading = true;
        const accumulatedData = getStackedChartData(state.budgetUsageData, {
            start: state.budgetData.start,
            end: state.budgetData.end,
        }, 'month');
        if (state.budgetData.time_unit === BUDGET_TIME_UNIT.TOTAL) {
            accumulatedData.forEach((data) => {
                data.total_limit = state.budgetData.limit;
            });
        }
        return accumulatedData;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    } finally {
        state.loading = false;
    }
};

const disposeChart = (chartContext) => {
    if (state.chartRegistry[chartContext]) {
        state.chartRegistry[chartContext].dispose();
        delete state.chartRegistry[chartContext];
    }
};

const makeTotalPlanningLineSeries = (chart: XYChart) => {
    const lineSeries = chart.series.push(new am4charts.LineSeries());
    lineSeries.name = 'Total Budget';
    lineSeries.dataFields.valueY = state.limitProperty;
    lineSeries.dataFields.categoryX = categoryKey;
    lineSeries.stroke = am4core.color(gray[600]);
    lineSeries.strokeWidth = 1.5;
    lineSeries.strokeDasharray = '4, 2';
};

const makeMonthlyPlanningLineSeries = (chart: XYChart) => {
    /* Create series - Line */
    const lineSeries = chart.series.push(new am4charts.LineSeries());
    lineSeries.name = 'Budgeted';
    lineSeries.dataFields.valueY = state.limitProperty;
    lineSeries.dataFields.categoryX = categoryKey;
    lineSeries.stroke = am4core.color(gray[600]);
    lineSeries.strokeWidth = 1.5;
    lineSeries.strokeDasharray = '4, 2';

    /* Create Bullet */
    const bullet = lineSeries.bullets.push(new am4charts.Bullet());
    bullet.fill = am4core.color(gray[600]);
    bullet.tooltipText = '[#fff font-size: 12px]{name} in {categoryX}:\n[/][#fff font-size: 12px]{valueY}[/] [#fff]{additional}[/]';
    const circle = bullet.createChild(am4core.Circle);
    circle.radius = 4;
    circle.fill = am4core.color('white');
    circle.strokeWidth = 2;
};

const drawChart = (chartContext) => {
    /* Create chart */
    const createChart = () => {
        disposeChart(chartContext);
        state.chartRegistry[chartContext] = am4core.create(chartContext, am4charts.XYChart);
        return state.chartRegistry[chartContext];
    };
    const chart = createChart();
    state.chart = chart;
    if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;

    /* Create axes */
    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = categoryKey;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.fontSize = 12;
    categoryAxis.renderer.labels.template.adapter.add('text', (text, target) => dayjs.utc(target.dataItem.category).format('MMM YYYY'));

    /* Create value axis */
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.fontSize = 12;
    // valueAxis.renderer.labels.template.adapter.add('text', (text, target) => {
    //     if (target.dataItem) {
    //         if (target.dataItem.value) return commaFormatter(numberFormatter(target.dataItem.value));
    //     }
    //     return text;
    // });
    valueAxis.renderer.labels.template.fill = am4core.color(gray[400]);

    /* Create series - Column */
    const columnSeries = chart.series.push(new am4charts.ColumnSeries());
    columnSeries.name = 'Actual Cost';
    columnSeries.dataFields.valueY = columnChartValueName;
    columnSeries.dataFields.categoryX = 'date';

    columnSeries.columns.template.tooltipText = '[#fff font-size: 12px]{name} in {categoryX}:\n[/][#fff font-size: 12px bold]{valueY}[/] [#fff]{additional}[/]';
    columnSeries.columns.template.propertyFields.stroke = 'stroke';
    columnSeries.columns.template.propertyFields.strokeWidth = 'strokeWidth';
    columnSeries.columns.template.strokeOpacity = 0;
    columnSeries.columns.template.width = am4core.percent(17);
    columnSeries.tooltip.label.textAlign = 'middle';

    /* Fill column by condition */
    columnSeries.columns.template.adapter.add('fill', (fill, target) => {
        const MonthToDate = dayjs.utc().startOf('month').format('YYYY-MM-DD');
        if (target.dataItem?.dataContext?.date === MonthToDate) {
            return am4core.color(indigo[300]);
        }
        if (target.dataItem?.dataContext[state.limitProperty] < target.dataItem?.dataContext?.cost) {
            return am4core.color(red[400]);
        }
        return am4core.color(indigo[600]);
    });

    if (state.budgetData.time_unit === BUDGET_TIME_UNIT.TOTAL) makeTotalPlanningLineSeries(chart);
    else makeMonthlyPlanningLineSeries(chart);

    chart.data = getChartData();
};

watch([() => chartRef.value], ([chartContext]) => {
    if (chartContext) {
        drawChart(chartContext);
    }
}, { immediate: false });

onUnmounted(() => {
    if (state.chart) state.chart.dispose();
});

(() => {
    getChartData();
})();


</script>
<template>
    <p-data-loader :loading="state.loading">
        <template #loader>
            <p-skeleton height="100%" />
        </template>
        <div ref="chartRef"
             class="chart"
        />
    </p-data-loader>
</template>
