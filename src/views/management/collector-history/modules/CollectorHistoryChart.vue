<template>
    <p-chart-loader :loading="loading" class="collection-history-chart">
        <template #loader>
            <p-skeleton width="100%" height="16rem" />
        </template>
        <div class="top-part">
            <p-date-pagination :date.sync="currentDate" :timezone="timezone" />
        </div>
        <span class="y-label-text">
            {{ $t('MANAGEMENT.COLLECTOR_HISTORY.CHART.JOB_COUNT') }}
        </span>
        <div ref="chartRef" class="chart" />
    </p-chart-loader>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import {
    reactive, watch, toRefs, computed, onUnmounted,
} from '@vue/composition-api';

import { PChartLoader, PDatePagination, PSkeleton } from '@spaceone/design-system';

import { SpaceConnector } from '@/lib/space-connector';
import { alert, primary } from '@/styles/colors';
import { store } from '@/store';
import config from '@/lib/config';

dayjs.extend(isSameOrBefore);

am4core.useTheme(am4themes_animated);


interface ChartData {
    date: Dayjs;
    success: number | null;
    failure: number | null;
}

const LEGEND_COLORS = {
    success: primary,
    failure: alert,
};

export default {
    name: 'PCollectorHistoryChart',
    components: {
        PDatePagination,
        PSkeleton,
        PChartLoader,
    },
    props: {
        selectedDate: {
            type: String,
            default: null,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            loading: true,
            chartRef: null as HTMLElement | null,
            chart: null,
            chartRegistry: {},
            chartData: [] as ChartData[],
            successData: [] as number[],
            failureData: [] as number[],
            //
            timezone: computed(() => store.state.user.timezone),
            currentDate: dayjs.utc().tz(store.state.user.timezone),
            currentMonthStart: computed(() => dayjs(state.currentDate).startOf('month')),
            currentMonthEnd: computed(() => dayjs(state.currentDate).endOf('month')),
        });

        /* util */
        const initChartData = (data) => {
            const dataWithTimezone = data.map(d => ({
                date: dayjs.utc(d.date).tz(state.timezone).format('YYYY-MM-DD'),
                success: d.success,
                failure: d.failure,
            }));
            const chartData = [] as ChartData[];
            let now = state.currentMonthStart.clone();

            while (now.isSameOrBefore(state.currentMonthEnd, 'day')) {
                // eslint-disable-next-line no-loop-func
                const existData = dataWithTimezone.find(d => now.isSame(d.date, 'day'));

                if (existData) {
                    chartData.push({
                        date: now.format('YYYY-MM-DD'),
                        success: existData.success,
                        failure: existData.failure,
                    });
                } else {
                    chartData.push({
                        date: now.format('YYYY-MM-DD'),
                        success: null,
                        failure: null,
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
            chart.data = state.chartData;

            const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            dateAxis.dataFields.category = 'date';
            dateAxis.tooltip.disabled = true;
            dateAxis.renderer.minGridDistance = 20;
            dateAxis.fontSize = 12;
            dateAxis.renderer.labels.template.adapter.add('text', (text, target) => dayjs.utc(target.dataItem.category).format('M/D'));

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;
            valueAxis.fontSize = 12;
            valueAxis.extraMax = 0.1;

            const createSeries = (type, color) => {
                const series = chart.series.push(new am4charts.LineSeries());
                series.dataFields.categoryX = 'date';
                series.dataFields.valueY = type;
                series.stroke = am4core.color(color);
                series.tooltipText = `{date}\n${type}: {${type}}`;
                series.tooltip.fontSize = 12;
                series.tooltip.getFillFromObject = false;
                series.tooltip.label.fill = color;
                series.tooltip.background.strokeWidth = 0;
                series.tooltip.pointerOrientation = 'vertical';
                series.connect = false;
                series.tensionX = 0.8;
                series.bulletsContainer.parent = chart.seriesContainer;
                return series;
            };
            const successSeries = createSeries('success', LEGEND_COLORS.success);
            const failureSeries = createSeries('failure', LEGEND_COLORS.failure);

            const createCircleBullet = (series, color) => {
                const bullet = series.bullets.push(new am4charts.Bullet());
                const circle = bullet.createChild(am4core.Circle);
                circle.strokeWidth = 0;
                circle.width = 5;
                circle.height = 5;
                circle.fill = am4core.color(color);

                const circleState = circle.states.create('hover');
                circleState.properties.width = 10;
                circleState.properties.height = 10;

                circle.events.on('hit', (event) => {
                    const clickedData = event.target.dataItem.dataContext;
                    emit('click-date', clickedData.date);
                });
            };
            createCircleBullet(successSeries, LEGEND_COLORS.success);
            createCircleBullet(failureSeries, LEGEND_COLORS.failure);

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.lineX.strokeOpacity = 0;
            chart.cursor.lineY.strokeOpacity = 0;
            chart.cursor.behavior = 'none';
        };

        /* api */
        const getDailyJobSummary = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.statistics.topic.dailyJobSummary({
                    start: state.currentMonthStart.toISOString(),
                    end: state.currentMonthEnd.toISOString(),
                });
                state.chartData = initChartData(res.results);
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const init = async () => {
            await getDailyJobSummary();
        };
        init();

        watch(() => state.currentDate, async () => {
            await getDailyJobSummary();
        }, { immediate: false });
        watch([() => state.chartRef, () => state.chartData], ([ctx, chartData]) => {
            if (ctx && chartData.length > 0) {
                drawChart(ctx);
            }
        }, { immediate: false });

        onUnmounted(() => {
            if (state.chart) disposeChart(state.chartRef);
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss">
.collection-history-chart {
    height: 20rem;
    padding-top: 1rem;
    padding-bottom: 3rem;

    .chart {
        height: 16rem;
    }

    .top-part {
        position: relative;
        height: 2rem;
        .p-date-pagination {
            position: absolute;
            right: 0;
        }
    }

    .y-label-text {
        @apply text-gray-500;
        font-size: 0.75rem;
    }
}
</style>
