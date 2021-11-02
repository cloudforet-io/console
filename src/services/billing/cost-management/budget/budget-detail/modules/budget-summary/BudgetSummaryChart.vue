<template>
    <div ref="chartRef" class="chart" />
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';
import config from '@/lib/config';
import { gray, coral } from '@/styles/colors';

am4core.useTheme(am4themesAnimated);

const tempData = [
    {
        date: '2021-10',
        limit: 100,
        usd_cost: 120,
        lineDash: '5,5',
    }, {
        date: '2021-09',
        limit: 100,
        usd_cost: 88,
        lineDash: '5,5',
    }, {
        date: '2021-08',
        limit: 120,
        usd_cost: 50,
        lineDash: '5,5',
    }, {
        date: '2021-07',
        limit: 100,
        usd_cost: 70,
        lineDash: '5,5',
    }, {
        date: '2021-06',
        limit: 100,
        usd_cost: 90,
        lineDash: '5,5',
        columnDash: '5,5',
        fillOpacity: 0.2,
        additional: '(projection)',
    }];

export default {
    name: 'BudgetSummaryChart',
    props: {
        chartData: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props) {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as null | any,
            chartRegistry: {},
        });

        const disposeChart = (chartContext) => {
            if (state.chartRegistry[chartContext]) {
                state.chartRegistry[chartContext].dispose();
                delete state.chartRegistry[chartContext];
            }
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
            categoryAxis.dataFields.category = 'date';
            categoryAxis.renderer.minGridDistance = 30;

            /* Create value axis */
            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

            /* Create series - Column */
            const columnSeries = chart.series.push(new am4charts.ColumnSeries());
            columnSeries.name = 'Actual Cost';
            columnSeries.dataFields.valueY = 'usd_cost';
            columnSeries.dataFields.categoryX = 'date';

            columnSeries.columns.template.tooltipText = '[#fff font-size: 15px]{name} in {categoryX}:\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]';
            columnSeries.columns.template.propertyFields.fillOpacity = 'fillOpacity';
            columnSeries.columns.template.propertyFields.stroke = 'stroke';
            columnSeries.columns.template.propertyFields.strokeWidth = 'strokeWidth';
            columnSeries.columns.template.propertyFields.strokeDasharray = 'columnDash';
            columnSeries.tooltip.label.textAlign = 'middle';

            /* Create series - Line */
            const lineSeries = chart.series.push(new am4charts.LineSeries());
            lineSeries.name = 'Budgeted';
            lineSeries.dataFields.valueY = 'limit';
            lineSeries.dataFields.categoryX = 'date';

            lineSeries.stroke = am4core.color(gray[400]);
            lineSeries.strokeWidth = 2;
            lineSeries.propertyFields.strokeDasharray = 'lineDash';
            lineSeries.tooltip.label.textAlign = 'middle';

            /* Fill column by condition */
            columnSeries.columns.template.adapter.add('fill', (fill, target) => {
                if (target.dataItem?.dataContext?.limit < target.dataItem?.dataContext?.usd_cost) {
                    return am4core.color(coral[500]);
                }
                return fill;
            });

            /* Create Bullet */
            const bullet = lineSeries.bullets.push(new am4charts.Bullet());
            bullet.fill = am4core.color(gray[400]); // tooltips grab fill from parent by default
            bullet.tooltipText = '[#fff font-size: 15px]{name} in {categoryX}:\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]';
            const circle = bullet.createChild(am4core.Circle);
            circle.radius = 4;
            circle.fill = am4core.color('#fff');
            circle.strokeWidth = 2;
            chart.data = tempData;
        };

        watch([() => state.chartRef, () => props.chartData], ([chartContext, chartData]) => {
            if (chartContext && chartData.length > 0) {
                drawChart(chartContext);
            }
        }, { immediate: false });
        return {
            ...toRefs(state),
        };
    },
};
</script>
