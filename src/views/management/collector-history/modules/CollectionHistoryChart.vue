<template>
    <p-chart-loader :loading="loading" class="collection-history-chart">
        <template #loader>
            <p-skeleton width="100%" height="16rem" />
        </template>
        <canvas ref="chartRef" />
    </p-chart-loader>
</template>

<script lang="ts">
import {
    chain, orderBy, range, max,
} from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import { Moment } from 'moment-timezone/moment-timezone';

import { reactive, watch, toRefs } from '@vue/composition-api';

import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';

import { NSChart } from '@/lib/chart/s-chart';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { FILTER_OPERATOR, fluentApi } from '@/lib/fluent-api';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import { getTimezone } from '@/lib/util';
import {
    black, coral, gray, primary,
} from '@/styles/colors';

const TICKS_COUNT = 5;
const DAY_COUNT = 30;
const DEFAULT_MAX = 600;
const DEFAULT_STEP_SIZE = 100;
const LEGEND_COLORS: {[k: string]: string} = {
    success: primary,
    failure: coral.default,
};
interface DataType {
    date: string;
    success: number;
    failure: number;
}
// interface State {
//     loading: boolean;
//     chartRef: HTMLCanvasElement|null;
//     chart: Chart|null;
//     data: DataType[];
//     currentDate: Moment;
//     selectedDate: string;
// }

export default {
    name: 'PCollectorHistoryChart',
    components: { PSkeleton, PChartLoader },
    setup() {
        const state = reactive({
            loading: true,
            chartRef: null as HTMLCanvasElement|null,
            chart: null as null|NSChart,
            data: [] as any,
            currentDate: moment().tz(getTimezone()),
            selectedDate: '',
        });

        const getJobStat = async () => {
            state.loading = true;
            try {
                // const query = new QueryHelper();
                // query.setSort(state.sortBy, state.sortDesc).setPage(((state.thisPage - 1) * state.pageSize) + 1, state.pageSize);
                // const res = await SpaceConnector.client.statistics.topic.dailyJobSummary();

                const res = await fluentApi.statisticsTest().history().stat<DataType>()
                    .setTopic('daily_job_summary')
                    .addGroupKey('created_at', 'date')
                    .addGroupField('success', STAT_OPERATORS.sum, 'values.success_count')
                    .addGroupField('failure', STAT_OPERATORS.sum, 'values.fail_count')
                    .setFilter({ key: 'created_at', value: `now/d-${DAY_COUNT - 1}d`, operator: FILTER_OPERATOR.gtTime })
                    .execute();
                state.data = res.data.results.map(d => ({
                    date: d.date,
                    success: d.success,
                    failure: d.failure,
                }));
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const initChartData = () => {
            let data;
            if (state.data.length > 0) {
                data = orderBy(state.data, ['date'], ['asc']);
            } else {
                data = chain(range(0, DAY_COUNT))
                    .map(i => ({
                        failure: null,
                        success: null,
                        date: moment().subtract(i, 'days').toISOString(),
                    }))
                    .orderBy(['date'], ['asc'])
                    .value();
            }
            return data;
        };
        const drawChart = (canvas) => {
            const chartData = initChartData();
            const datasets = [
                {
                    label: 'Success',
                    data: chartData.map(d => d.success) as number[],
                    backgroundColor: 'transparent',
                    borderColor: LEGEND_COLORS.success,
                    borderWidth: 1,
                    pointBackgroundColor: LEGEND_COLORS.success,
                    pointRadius: 2,
                }, {
                    label: 'Failure',
                    data: chartData.map(d => d.failure) as number[],
                    backgroundColor: 'transparent',
                    borderColor: LEGEND_COLORS.failure,
                    borderWidth: 1,
                    pointBackgroundColor: LEGEND_COLORS.failure,
                    pointRadius: 2,
                },
            ];
            const labels = chartData.map(d => moment(d.date).format('D'));
            const maxNumber: number = state.data.length === 0 ? DEFAULT_MAX : max(datasets.map(ds => max(ds.data as number[]))) as number;
            const stepSize = state.data.length === 0 ? DEFAULT_STEP_SIZE : maxNumber / (TICKS_COUNT || 1);
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
                    const date = chartData[item._index].date;
                    state.selectedDate = date;
                    console.log(date);
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

            state.chart = new NSChart(canvas, {
                type: 'line',
                data: {
                    labels,
                    datasets,
                },
                options,
            });
        };

        const init = async () => {
            await getJobStat();
        };
        init();

        watch([() => state.chartRef, () => state.loading], ([ctx, loading]) => {
            if (ctx && !loading) {
                drawChart(ctx);
            }
        }, {
            lazy: true,
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
}
</style>
