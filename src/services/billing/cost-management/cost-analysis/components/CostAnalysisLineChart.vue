<template>
    <div ref="chartRef" class="chart" />
</template>

<script lang="ts">
import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import { reactive, toRefs, watch } from '@vue/composition-api';
import config from '@/lib/config';
import { gray } from '@/styles/colors';

am4core.useTheme(am4themes_animated);
am4core.options.autoSetClassName = true;
am4core.options.classNamePrefix = 'CostAnalysisChart';


export default {
    name: 'CostAnalysisLineChart',
    props: {
        chartData: {
            type: Array,
            default: () => ([]),
        },
        legendRef: {
            type: HTMLDivElement,
            default: () => ({}),
        },
        isStacked: {
            type: Boolean,
            default: false,
        },
        categories: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props) {
        const state = reactive({
            chart: null,
            chartRef: null as HTMLElement | null,
            chartRegistry: {},
        });

        const createLegend = (chartLegend, legendCtx) => {
            chartLegend.useDefaultMarker = true;
            chartLegend.position = 'right';
            chartLegend.useDefaultMarker = true;
            chartLegend.fontSize = 14;

            const marker = chartLegend.markers;
            marker.template.children.getIndex(0).cornerRadius(12, 12, 12, 12);
            marker.template.width = 10;
            marker.template.height = 10;

            const legendContainer = am4core.create(legendCtx, am4core.Container);
            legendContainer.width = am4core.percent(100);
            legendContainer.height = am4core.percent(100);
            chartLegend.parent = legendContainer;
        };

        const disposeChart = (ctx) => {
            if (state.chartRegistry[ctx]) {
                state.chartRegistry[ctx].legend.dispose();
                state.chartRegistry[ctx].dispose();
                delete state.chartRegistry[ctx];
            }
        };
        const drawChart = (ctx, legendCtx) => {
            const createChart = () => {
                disposeChart(ctx);
                state.chartRegistry[ctx] = am4core.create(ctx, am4charts.XYChart);
                return state.chartRegistry[ctx];
            };

            const chart = createChart();
            chart.scrollbarX = new am4core.Scrollbar();
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.paddingLeft = -5;
            chart.paddingBottom = -10;
            chart.data = props.chartData;

            chart.dateFormatter.inputDateFormat = 'yyyy-MM-dd';
            const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.startLocation = 0.5;
            dateAxis.endLocation = 0.5;
            dateAxis.baseInterval = {
                timeUnit: 'day',
                count: 1,
            };
            dateAxis.dateFormats.setKey('day', 'M/d');
            dateAxis.renderer.minGridDistance = 50;
            dateAxis.fontSize = 12;
            dateAxis.renderer.grid.template.strokeOpacity = 0;
            dateAxis.renderer.grid.template.stroke = am4core.color(gray[500]);
            dateAxis.renderer.grid.template.location = 0;
            dateAxis.renderer.labels.template.fill = am4core.color(gray[900]);
            dateAxis.renderer.cellStartLocation = 0.1;
            dateAxis.renderer.cellEndLocation = 0.9;

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.minWidth = 20;
            valueAxis.fontSize = 12;
            valueAxis.extraMax = 0.01;
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.labels.template.fill = am4core.color(gray[900]);

            const createSeries = (field, name) => {
                const series = chart.series.push(new am4charts.LineSeries());
                series.name = name;
                series.dataFields.dateX = 'date';
                series.dataFields.valueY = field;
                series.strokeWidth = 1;
                series.bulletsContainer.parent = chart.seriesContainer;
                series.tooltipText = '[font-size:10px]{name} {valueY}';

                if (props.isStacked) {
                    series.stacked = true;
                    series.fillOpacity = 0.5;
                }

                return series;
            };

            props.categories.forEach((d) => {
                createSeries(d.name, d.label);
            });

            chart.legend = new am4charts.Legend();
            createLegend(chart.legend, legendCtx);

            // cursor
            chart.cursor = new am4charts.XYCursor();
            chart.cursor.maxTooltipDistance = 20;
            chart.cursor.lineX.stroke = am4core.color(gray[900]);
            chart.cursor.lineX.strokeDasharray = '';
            chart.cursor.lineX.strokeOpacity = 1;
            chart.cursor.lineY.stroke = am4core.color(gray[900]);
            chart.cursor.lineY.strokeDasharray = '';
            chart.cursor.lineY.strokeOpacity = 1;
            dateAxis.tooltip.label.fontSize = 12;
            valueAxis.tooltip.label.fontSize = 12;

            // range
            // const range = dateAxis.axisRanges.create();
            // range.date =
            state.chart = chart;
        };

        watch([() => state.chartRef, () => props.legendRef, () => props.chartData], ([ctx, legendCtx, chartData]) => {
            if (ctx && chartData.length > 0) {
                drawChart(ctx, legendCtx);
            }
        }, { immediate: false });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
</style>
