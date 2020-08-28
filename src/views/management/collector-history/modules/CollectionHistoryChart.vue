<template>
    <p-chart-loader :loading="loading" class="collection-history-chart">
        <template #loader>
            <p-skeleton width="100%" height="16rem" />
        </template>
        <div class="top-lap">
            <p-date-pagination :date.sync="currentDate" />
        </div>
        <span class="y-label-text">Job Count</span>
        <canvas ref="chartRef" />
    </p-chart-loader>
</template>

<script lang="ts">
import {
    orderBy, range, max, find,
} from 'lodash';
import moment from 'moment';
import numeral from 'numeral';

import {
    reactive, watch, toRefs, computed,
} from '@vue/composition-api';

import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import PDatePagination from '@/components/organisms/date-pagination/pDatePagination.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';

import { NSChart } from '@/lib/chart/s-chart';
import { SpaceConnector } from '@/lib/space-connector';
import { getTimezone } from '@/lib/util';
import {
    black, red, gray, primary,
} from '@/styles/colors';

const TICKS_COUNT = 5;
const DEFAULT_MAX = 600;
const DEFAULT_STEP_SIZE = 100;
const LEGEND_COLORS: {[k: string]: string} = {
    success: primary,
    failure: red.default,
};

interface ChartDataType {
    date: string;
    success: number | null;
    failure: number | null;
}

export default {
    name: 'PCollectorHistoryChart',
    components: {
        PDatePagination,
        PSkeleton,
        PChartLoader,
    },
    setup() {
        const state = reactive({
            loading: true,
            chartRef: null as HTMLCanvasElement|null,
            chart: null as null|NSChart,
            chartData: [] as ChartDataType[],
            successData: [] as number[],
            failureData: [] as number[],
            noData: false,
            //
            currentDate: moment().tz(getTimezone()),
            currentDateText: computed(() => state.currentDate.format('YYYY-MM-DD')),
            currentMonthStart: computed(() => moment(state.currentDateText).startOf('month')),
            currentMonthEnd: computed(() => moment(state.currentDateText).endOf('month')),
            dayCount: computed(() => state.currentDate.daysInMonth()),
            selectedDate: '',
        });

        const initChartData = (rawData) => {
            state.noData = rawData.length === 0;

            const orderedData = orderBy(rawData, ['date'], ['asc']);
            const dateFormattedData = orderedData.map(d => ({
                date: moment(d.date).tz(getTimezone()).format('YYYY-MM-DD'),
                success: d.success,
                failure: d.failure,
            }));
            const chartData = [] as ChartDataType[];
            const today = moment().tz(getTimezone());
            const now = moment(state.currentMonthStart.format());

            while (now.isSameOrBefore(state.currentMonthEnd)) {
                const nowText = now.format('YYYY-MM-DD');
                const existData = find(dateFormattedData, { date: nowText });
                let success: number | null = 0;
                let failure: number | null = 0;

                if (existData) {
                    success = existData.success;
                    failure = existData.failure;
                } else if (now.isAfter(today, 'days')) {
                    success = null;
                    failure = null;
                }
                chartData.push({
                    date: now.format('YYYY-MM-DD'),
                    success,
                    failure,
                });

                now.add(1, 'days');
            }
            return chartData;
        };
        const getDailyJobSummary = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.statistics.topic.dailyJobSummary({
                    start: state.currentMonthStart.format(),
                    end: state.currentMonthEnd.format(),
                });
                state.chartData = initChartData(res.results);
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        const drawChart = (canvas) => {
            const datasets = [
                {
                    label: 'Success',
                    data: state.chartData.map(d => d.success),
                    backgroundColor: 'transparent',
                    borderColor: LEGEND_COLORS.success,
                    borderWidth: 1,
                    pointBackgroundColor: LEGEND_COLORS.success,
                    pointRadius: 2,
                }, {
                    label: 'Failure',
                    data: state.chartData.map(d => d.failure),
                    backgroundColor: 'transparent',
                    borderColor: LEGEND_COLORS.failure,
                    borderWidth: 1,
                    pointBackgroundColor: LEGEND_COLORS.failure,
                    pointRadius: 2,
                },
            ];
            const maxNumber = state.noData ? DEFAULT_MAX : max(datasets.map(ds => max(ds.data as number[]))) as number;
            const stepSize = state.noData ? DEFAULT_STEP_SIZE : maxNumber / (TICKS_COUNT || 1);
            const tooltips = {
                cornerRadius: 2,
                caretSize: 6,
                caretPadding: 8,
                displayColors: false,
                backgroundColor: gray[900],
                callbacks: {
                    title: tooltipItems => `8/${tooltipItems[0].xLabel}`,
                },
            };
            const pointClickEvent = (point, event) => {
                const item = event[0];
                if (item) {
                    const clickedData = state.chartData[item._index];
                    state.selectedDate = clickedData.date;
                }
            };

            const options = {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            stepSize,
                            max: maxNumber,
                            callback: (value) => {
                                if (typeof value === 'number') {
                                    return value < 10000 ? numeral(value).format('0,0') : numeral(value).format('0.0a');
                                }
                                return value;
                            },
                        },
                        afterTickToLabelConversion: (scaleInstance) => {
                            scaleInstance.ticks[0] = '';
                            scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;
                        },
                    }],
                    xAxes: [{
                        display: 'auto',
                        gridLines: {
                            color: gray[200],
                            zeroLineColor: gray[200],
                        },
                        ticks: {
                            padding: 10,
                            fontColor: black,
                        },
                    }],
                },
                tooltips,
                legend: {
                    display: false,
                },
                maintainAspectRatio: false,
                onClick: pointClickEvent,
            };

            const currentMonthText = state.currentDate.format('M');
            state.chart = new NSChart(canvas, {
                type: 'line',
                data: {
                    labels: (range(1, state.dayCount + 1)).map(d => `${currentMonthText}/${d}`),
                    datasets,
                },
                options,
            });
        };

        const init = async () => {
            await getDailyJobSummary();
        };
        init();

        watch(() => state.currentDate, () => {
            getDailyJobSummary();
        }, { immediate: false });

        watch([() => state.chartRef, () => state.chartData], ([ctx, chartData]) => {
            if (ctx && chartData.length > 0) {
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
.collection-history-chart {
    height: 20rem;
    padding-top: 1rem;
    padding-bottom: 3rem;

    .top-lap {
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
