<template>
    <div class="collector-history-chart">
        <div class="top-part">
            <div class="legend-wrapper">
                <div v-for="legend in legends"
                     :key="legend.color"
                     class="legend"
                >
                    <span class="circle"
                          :style="{ 'background-color': legend.color }"
                    />
                    <span class="text">{{ legend.label }}</span>
                </div>
            </div>
            <p-date-pagination :date.sync="currentDate"
                               :timezone="timezone"
            />
        </div>
        <p-data-loader :loading="loading">
            <template #loader>
                <p-skeleton width="100%" />
            </template>
            <div ref="chartRef"
                 class="chart"
            />
        </p-data-loader>
    </div>
</template>

<script lang="ts">

import {
    reactive, watch, toRefs, computed, onUnmounted, getCurrentInstance,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import {
    PDataLoader, PDatePagination, PSkeleton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import config from '@/lib/config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    gray, green, coral,
} from '@/styles/colors';

interface ChartData {
    date: string;
    tooltipDate: string;
    completed: number | null;
    failed: number | null;
}

const VALUE_TYPE = {
    completed: 'completed',
    failed: 'failed',
};

const LEGEND_COLORS = {
    completed: green[400],
    failed: coral[400],
};

export default {
    name: 'PCollectorHistoryChart',
    components: {
        PDatePagination,
        PSkeleton,
        PDataLoader,
    },
    props: {
        selectedDate: {
            type: String,
            default: null,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            loading: true,
            chartRef: null as HTMLElement | null,
            chart: null,
            chartRegistry: {},
            chartData: [] as ChartData[],
            completedData: [] as number[],
            failedData: [] as number[],
            legends: computed(() => ([
                {
                    label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.COMPLETED'),
                    color: green[400],
                },
                {
                    label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.FAILED'),
                    color: coral[400],
                },
            ])),
            //
            timezone: computed(() => store.state.user.timezone),
            currentDate: dayjs.utc().tz(store.state.user.timezone),
            currentMonthStart: computed(() => dayjs(state.currentDate).startOf('month')),
            currentMonthEnd: computed(() => dayjs(state.currentDate).endOf('month')),
        });

        /* util */
        const initChartData = (data) => {
            const dataWithTimezone = data.map((d) => ({
                date: dayjs.utc(d.date).tz(state.timezone).format('YYYY-MM-DD'),
                completed: d.success,
                failed: d.failure,
            }));
            const chartData = [] as ChartData[];
            let now = state.currentMonthStart.clone();

            while (now.isSameOrBefore(state.currentMonthEnd, 'day')) {
                // eslint-disable-next-line no-loop-func
                const existData = dataWithTimezone.find((d) => now.isSame(d.date, 'day'));

                if (existData) {
                    chartData.push({
                        date: now.format('YYYY-MM-DD'),
                        tooltipDate: now.format('MM/DD/YYYY'),
                        completed: existData.completed,
                        failed: existData.failed,
                    });
                } else {
                    chartData.push({
                        date: now.format('YYYY-MM-DD'),
                        tooltipDate: now.format('MM/DD/YYYY'),
                        completed: null,
                        failed: null,
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
            chart.paddingLeft = -5;
            chart.paddingBottom = -10;
            chart.data = state.chartData;

            const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            dateAxis.dataFields.category = 'date';
            dateAxis.tooltip.disabled = true;
            dateAxis.renderer.minGridDistance = 30;
            dateAxis.fontSize = 12;
            dateAxis.renderer.labels.template.fill = am4core.color(gray[600]);
            dateAxis.renderer.cellStartLocation = 0.3;
            dateAxis.renderer.cellEndLocation = 0.7;
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
            valueAxis.renderer.minGridDistance = 20;
            valueAxis.fontSize = 12;
            valueAxis.extraMax = 0.1;
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.labels.template.fill = am4core.color(gray[400]);
            valueAxis.renderer.labels.template.adapter.add('text', (label, target) => {
                if (target.dataItem && (target.dataItem.value === 0)) return 'job';
                return label;
            });

            const createSeries = (type, color) => {
                const series = chart.series.push(new am4charts.ColumnSeries());
                series.dataFields.categoryX = 'date';
                series.dataFields.valueY = type;
                series.strokeWidth = 0;
                series.fill = am4core.color(color);
                series.columns.template.width = am4core.percent(65);

                series.columns.template.events.on('hit', (event) => {
                    const clickedData = event.target.dataItem.dataContext;
                    emit('click-date', {
                        type,
                        date: clickedData.date,
                    });
                });

                // tooltip
                const tooltipTextColor = type === VALUE_TYPE.completed ? green[500] : coral[500];
                if (type === VALUE_TYPE.completed) {
                    series.columns.template.tooltipText = `[font-size: 1rem; ${tooltipTextColor}; bold]{completed} [font-size: 0.875rem; ${tooltipTextColor};](Total Completed)
[font-size: 0.75rem; ${gray[700]}]{tooltipDate}`;
                } else {
                    series.columns.template.tooltipText = `[font-size: 1rem; ${tooltipTextColor}; bold]{failed} [font-size: 0.875rem; ${tooltipTextColor};](Total Failed)
[font-size: 0.75rem; ${gray[700]}]{tooltipDate}`;
                }
                series.tooltip.pointerOrientation = 'down';
                series.columns.template.tooltipX = am4core.percent(50);
                series.columns.template.tooltipY = am4core.percent(0);
                series.tooltip.dy = -5;
                series.tooltip.fontSize = 12;
                series.tooltip.getFillFromObject = false;
                series.tooltip.label.fill = am4core.color(gray[900]);
                series.tooltip.autoTextColor = false;
                series.tooltip.background.fillOpacity = 1;
                series.tooltip.background.stroke = am4core.color(color);
            };
            createSeries('completed', LEGEND_COLORS.completed);
            createSeries('failed', LEGEND_COLORS.failed);
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
                ErrorHandler.handleError(e);
                state.chartData = [];
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
.collector-history-chart {
    @apply bg-white border border-gray-200 rounded-lg;
    height: 14rem;
    padding: 1rem;

    .top-part {
        position: relative;
        height: 2rem;

        .legend-wrapper {
            position: absolute;
            left: 0;
            .legend {
                display: inline-block;

                &:first-child {
                    padding-right: 1rem;
                }

                .circle {
                    @apply rounded-full;
                    display: inline-block;
                    width: 0.5rem;
                    height: 0.5rem;
                    margin-right: 0.25rem;
                }
                .text {
                    @apply text-gray-600;
                    font-size: 0.75rem;
                    line-height: 1.5;
                }
            }
        }

        .p-date-pagination {
            position: absolute;
            right: 0;

            .date-text-wrapper .date-text {
                @apply text-gray-800;
            }
        }
    }

    .p-data-loader {
        height: 10rem;

        .p-skeleton {
            height: 10rem;
        }

        .chart {
            height: 10rem;
        }
    }
}
</style>
