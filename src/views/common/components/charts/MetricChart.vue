<template>
    <div class="p-metric-chart">
        <div class="flex justify-between">
            <span class="text-sm font-bold capitalize">{{ title }}</span>
            <span class="text-sm text-gray flex-grow">&nbsp; {{ unit.y ? `(${unit.y})` : '' }}</span>
            <p-lottie v-if="loading && chart" name="thin-spinner" auto />
        </div>
        <p-chart-loader :loading="loading && !chart" class="chart">
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef" class="chart" />
            <transition name="fade-in">
                <div v-if="error || (loading && chart)" class="shade">
                    <p v-if="error">
                        Unavailable
                    </p>
                </div>
            </transition>
        </p-chart-loader>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { PChartLoader, PSkeleton, PLottie } from '@spaceone/design-system';

import {
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { gray } from '@/styles/colors';

dayjs.extend(utc);
am4core.useTheme(am4themes_animated);


const chartTimestampFormatter = (value, timezone) => dayjs.tz(dayjs.unix(value.seconds), timezone).format('MM/DD[\n]HH:mm');

export default {
    name: 'PMetricChart',
    components: { PLottie, PSkeleton, PChartLoader },
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
        dataset: {
            type: Object,
            default: () => ({}),
        },
        labels: {
            type: Array,
            default: () => [],
        },
        colors: {
            type: Array,
            default: () => [],
        },
        unit: {
            type: Object,
            default: () => ({ x: 'Timestamp', y: 'Count' }),
            validator(unit) {
                return typeof unit.x === 'string' && typeof unit.y === 'string';
            },
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        title: {
            type: String,
            default: '',
        },
        error: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const getLabels = () => {
            if (props.unit.x === 'Timestamp') {
                const labels: string[] | string[][] = props.labels.map(t => chartTimestampFormatter(t, props.timezone));
                labels.forEach((e, i, a: string[] | string[][]) => {
                    if (typeof e === 'string' && /\n/.test(e)) {
                        a[i] = e.split(/\n/);
                    }
                });
                return labels;
            }
            return props.labels as string[];
        };

        const state = reactive({
            chartRef: null,
            chart: null as null | any,
            data: [], // as MetricChartData[],
        });

        const convertChartData = async () => {
            const labels = getLabels().map(d => d.join(' '));
            const chartDataList = [];
            labels.forEach((label, index) => {
                const chartData = {};
                chartData.label = label;
                Object.entries(props.dataset).forEach(([key, value]) => {
                    chartData[key] = value[index];
                });
                chartDataList.push(chartData);
            });
            state.data = chartDataList;
        };

        const drawChart = (ctx) => {
            convertChartData();
            const chart = am4core.create(ctx, am4charts.XYChart);
            chart.logo.disabled = true;
            chart.paddingLeft = -5;
            chart.paddingBottom = -10;
            chart.paddingTop = 10;
            chart.data = state.data;

            const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            dateAxis.dataFields.category = 'label';
            dateAxis.tooltip.disabled = true;
            dateAxis.renderer.minGridDistance = 60;
            dateAxis.fontSize = 12;
            dateAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            dateAxis.renderer.grid.template.strokeOpacity = 1;
            dateAxis.renderer.labels.template.adapter.add('text', (label, target) => {
                if (target.dataItem && (target.dataItem.category)) {
                    return target.dataItem.category.split(' ').join('\n');
                }
                return label;
            });

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;
            valueAxis.fontSize = 12;
            valueAxis.extraMax = 0.1;
            valueAxis.min = 0;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.grid.template.strokeOpacity = 1;

            const createSeries = (valueName, color) => {
                const series = chart.series.push(new am4charts.LineSeries());
                series.dataFields.categoryX = 'label';
                series.dataFields.valueY = valueName;
                series.stroke = am4core.color(color);
                series.tooltipText = `{label}\n${valueName}: {${valueName}}`;
                series.tooltip.fontSize = 12;
                series.tooltip.getFillFromObject = false;
                series.tooltip.label.fill = am4core.color(gray.dark);
                series.tooltip.background.fill = am4core.color('white');
                series.tooltip.background.stroke = am4core.color(color);
                series.tooltip.pointerOrientation = 'vertical';
                return series;
            };

            Object.keys(props.dataset).forEach((key, index) => {
                createSeries(key, props.colors[index]);
            });

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.lineX.strokeOpacity = 0;
            chart.cursor.lineY.strokeOpacity = 0;
            chart.cursor.behavior = 'none';
        };

        watch([() => state.chartRef, () => props.loading], async ([ctx, loading]) => {
            if (ctx && !loading) {
                await convertChartData();
                drawChart(ctx);
            }
        }, { immediate: false });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss">
.p-metric-chart {
    .chart {
        position: relative;
        height: 12.5rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        margin-top: 1.25rem;
    }
}
</style>
