<template>
    <p-chart-loader :loading="loading" class="alert-history-chart">
        <template #loader>
            <p-skeleton width="100%" height="100%" />
        </template>
        <div ref="chartRef" class="chart" />
    </p-chart-loader>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { capitalize } from 'lodash';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PChartLoader, PSkeleton } from '@spaceone/design-system';
import { gray, red } from '@/styles/colors';
import { store } from '@/store';
import config from '@/lib/config';

am4core.useTheme(am4themes_animated);
am4core.options.autoSetClassName = true;
am4core.options.classNamePrefix = 'AlertHistoryChart';
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);

interface ChartData {
    date: string;
    open: number | null;
    resolved: number | null;
    openPercentage?: number;
    resolvedPercentage?: number;
}

const ALERT_STATE = {
    OPEN: 'open',
    RESOLVED: 'resolved',
};
const OPEN_COLOR = red[400];
const RESOLVED_COLOR = gray[400];

export default {
    name: 'AlertHistoryChart',
    components: {
        PChartLoader,
        PSkeleton,
    },
    props: {
        currentDate: {
            type: Object,
            default: dayjs.utc(),
        },
    },
    setup(props) {
        const state = reactive(({
            loading: true,
            chartRef: null as HTMLElement | null,
            chart: null,
            chartRegistry: {},
            chartData: [] as ChartData[],
            currentMonthStart: computed(() => dayjs.utc(props.currentDate).startOf('month')),
            currentMonthEnd: computed(() => dayjs.utc(props.currentDate).endOf('month')),
        }));

        /* util */
        const initChartData = (data) => {
            const chartData = [] as ChartData[];
            let now = state.currentMonthStart.clone();

            while (now.isSameOrBefore(state.currentMonthEnd, 'day')) {
                // eslint-disable-next-line no-loop-func
                const existData = data.find(d => d.date === now.format('YYYY-MM-DD'));

                if (existData) {
                    const total = existData.open + existData.resolved;
                    const openPercentage = Math.round((existData.open / total) * 100);
                    const resolvedPercentage = 100 - openPercentage;
                    chartData.push({
                        date: now.format('YYYY-MM-DD'),
                        open: existData.open,
                        resolved: existData.resolved,
                        openPercentage,
                        resolvedPercentage,
                    });
                } else {
                    chartData.push({
                        date: now.format('YYYY-MM-DD'),
                        open: null,
                        resolved: null,
                    });
                }

                now = now.add(1, 'day');
            }
            return chartData;
        };
        const disposeChart = (ctx) => {
            if (state.chartRegistry[ctx]) {
                state.chartRegistry[ctx].dispose();
                delete state.chartRegistry[ctx];
            }
        };
        const drawChart = (ctx) => {
            const createChart = () => {
                disposeChart(ctx);
                state.chartRegistry[ctx] = am4core.create(ctx, am4charts.XYChart);
                return state.chartRegistry[ctx];
            };
            const chart = createChart();
            state.chart = chart;
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.paddingLeft = -5;
            chart.paddingBottom = -10;
            chart.paddingTop = -10;
            chart.data = state.chartData;

            const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            dateAxis.dataFields.category = 'date';
            dateAxis.tooltip.disabled = true;
            dateAxis.renderer.minGridDistance = 35;
            dateAxis.fontSize = 12;
            dateAxis.renderer.labels.template.fill = am4core.color(gray[600]);
            dateAxis.renderer.grid.template.stroke = am4core.color(gray[500]);
            dateAxis.renderer.labels.template.adapter.add('text', (text, target) => dayjs.utc(target.dataItem.category).format('M/D'));
            dateAxis.renderer.labels.template.adapter.add('fill', (fill, target) => {
                const today = dayjs.utc().format('YYYY-MM-DD');
                if (target.dataItem.category === today) return am4core.color(gray[900]);
                return am4core.color(gray[600]);
            });
            dateAxis.renderer.grid.template.adapter.add('strokeOpacity', (strokeOpacity, target) => {
                const today = dayjs.utc().format('YYYY-MM-DD');
                if (target.dataItem.category === today) return 1;
                return 0;
            });

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;
            valueAxis.renderer.minGridDistance = 25;
            valueAxis.min = 0;
            valueAxis.fontSize = 12;
            valueAxis.extraMax = 0.1;
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.labels.template.fill = am4core.color(gray[600]);

            const createSeries = (name, color) => {
                const series = chart.series.push(new am4charts.ColumnSeries());
                series.name = capitalize(name);
                series.stacked = true;
                series.dataFields.categoryX = 'date';
                series.dataFields.valueY = name;
                series.fill = am4core.color(color);
                series.stroke = am4core.color('white');
                series.strokeWidth = 1;
                series.strokeOpacity = 0;
                series.columns.template.width = am4core.percent(35);

                // tooltip
                if (name === ALERT_STATE.OPEN) {
                    series.columns.template.tooltipText = `[${OPEN_COLOR}]Open: [${OPEN_COLOR}; bold]{open} ({openPercentage}%)
[${RESOLVED_COLOR}]Resolved: [${RESOLVED_COLOR}; bold]{resolved} ({resolvedPercentage}%)`;
                    series.tooltip.pointerOrientation = 'down';
                    series.columns.template.tooltipX = am4core.percent(50);
                    series.columns.template.tooltipY = am4core.percent(0);
                    series.tooltip.dy = -5;
                    series.tooltip.fontSize = 14;
                    series.tooltip.getFillFromObject = false;
                    series.tooltip.label.fill = am4core.color(gray[900]);
                    series.tooltip.autoTextColor = false;
                    series.tooltip.background.fillOpacity = 1;
                    series.tooltip.background.stroke = am4core.color(gray[400]);
                }
            };
            createSeries(ALERT_STATE.RESOLVED, RESOLVED_COLOR);
            createSeries(ALERT_STATE.OPEN, OPEN_COLOR);

            chart.legend = new am4charts.Legend();
            chart.legend.useDefaultMarker = true;
            chart.legend.position = 'top';
            chart.legend.contentAlign = 'left';
            chart.legend.fontSize = 12;
            const marker = chart.legend.markers;
            marker.template.width = 10;
            marker.template.height = 10;
            marker.template.children.getIndex(0).cornerRadius(12, 12, 12, 12);

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.lineX.strokeOpacity = 0;
            chart.cursor.lineY.strokeOpacity = 0;
            chart.cursor.behavior = 'none';
        };

        /* api */
        const getData = async () => {
            state.loading = true;
            const chartData = [
                {
                    date: '2021-06-05',
                    open: 30,
                    resolved: 16,
                },
                {
                    date: '2021-06-07',
                    open: 10,
                    resolved: 10,
                },
                {
                    date: '2021-06-08',
                    open: 10,
                    resolved: 0,
                },
                {
                    date: '2021-06-09',
                    open: 9,
                    resolved: 2,
                },
                {
                    date: '2021-06-10',
                    open: 0,
                    resolved: 0,
                },
            ];
            state.chartData = initChartData(chartData);
            state.loading = false;
        };

        watch([() => state.chartRef, () => state.chartData], ([chartContext, data]) => {
            if (chartContext && data) {
                drawChart(chartContext);
            }
        });

        watch(() => props.currentDate, () => {
            getData();
        }, { immediate: true });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.alert-history-chart {
    height: 100%;

    .chart {
        height: 100%;
    }
}
</style>
<style lang="postcss">
.AlertHistoryChartAxisRendererX-group {
    @screen tablet {
        display: none;
    }
}
</style>
