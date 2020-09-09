<template>
    <p-widget-layout class="p-widget-layout-container">
        <template #title>
            <b>History</b>
            <router-link to="/management/collector-history" class="see-more-text">
                <span>see more</span>
                <p-i name="ic_arrow_right" width="1rem" height="1rem"
                     color="transparent currentColor" class="ml-1"
                />
            </router-link>
        </template>
        <div class="text-gray text-xs mb-2">
            Job Count
        </div>
        <p-chart-loader :loading="loading" class="chart">
            <template #loader>
                <p-skeleton width="100%" height="100%" />
            </template>
            <canvas ref="chartRef" />
        </p-chart-loader>
        <div class="legend-lap">
            <span v-for="(legend) in legends" :key="legend.name" class="legend">
                <span class="color" :style="{color: legend.color}" />
                {{ legend.name }}
            </span>
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
import Chart from 'chart.js';
import moment from 'moment';
import _ from 'lodash';
import numeral from 'numeral';

import {
    computed, reactive, toRefs, UnwrapRef, watch,
} from '@vue/composition-api';

import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { SBarChart } from '@/lib/chart/bar-chart';
import { HistoryStat } from '@/lib/fluent-api/statistics/history';
import { NSChart, tooltips } from '@/lib/chart/s-chart';
import { SpaceConnector } from '@/lib/space-connector';
import { getTimezone } from '@/lib/util';
import {
    coral, gray, primary2, black,
} from '@/styles/colors';

interface Data {
    date: string;
    success: number;
    failure: number;
}

interface Props {
    getAction: (api: HistoryStat<Data>) => HistoryStat<Data>;
}

const TICKS_COUNT = 5;
const DAY_COUNT = 7;
const DEFAULT_MAX = 600;
const DEFAULT_STEP_SIZE = 100;

export default {
    name: 'SCollectionHistory',
    components: {
        PI,
        PWidgetLayout,
        PChartLoader,
        PSkeleton,
    },
    props: {
        getAction: {
            type: Function,
            default: api => api,
        },
    },
    setup(props: Props) {
        interface DataType {
            date: string;
            success: number;
            failure: number;
        }
        interface InitDataType {
            chartRef: HTMLCanvasElement|null;
            chart: Chart|null;
            data: DataType[];
            loading: boolean;
        }
        const LEGEND_COLORS: {[k: string]: string} = {
            failure: coral.default,
            success: primary2,
        };

        const state: UnwrapRef<InitDataType> = reactive({
            chartRef: null,
            chart: null,
            data: [],
            loading: true,
        });

        const drawChart = (canvas) => {
            let data;
            if (state.data.length > 0) {
                data = state.data;
            } else {
                data = _.chain(_.range(0, DAY_COUNT))
                    .map(i => ({
                        failure: 0,
                        success: 0,
                        date: moment().subtract(i, 'days').toISOString(),
                    }))
                    .orderBy(['date'], ['asc'])
                    .value();
            }

            const datasets = [{
                label: 'Success',
                data: data.map(d => d.success) as number[],
                barPercentage: 0.4,
                categoryPercentage: 0.3,
                backgroundColor: LEGEND_COLORS.success,
                borderColor: LEGEND_COLORS.success,
            }, {
                label: 'Failure',
                data: data.map(d => d.failure) as number[],
                barPercentage: 0.4,
                categoryPercentage: 0.3,
                backgroundColor: LEGEND_COLORS.failure,
                borderColor: LEGEND_COLORS.failure,
            }];

            const max: number = state.data.length === 0 ? DEFAULT_MAX
                : _.max(datasets.map(ds => _.max(ds.data as number[]))) as number;
            const stepSize = state.data.length === 0 ? DEFAULT_STEP_SIZE
                : max / (TICKS_COUNT || 1);


            state.chart = new NSChart(canvas, {
                type: 'bar',
                data: {
                    labels: data.map(d => moment(d.date).format('MM/DD')),
                    datasets,
                },
                options: {
                    layout: {
                        padding: {
                        },
                    },
                    maintainAspectRatio: false,
                    legend: {
                        display: false,
                    },
                    responsive: true,
                    tooltips,
                    scales: {
                        yAxes: [{
                            gridLines: {
                                drawTicks: false,
                                drawBorder: false,
                                color: gray[200],
                                zeroLineColor: gray[200],
                            },
                            ticks: {
                                beginAtZero: true,
                                stepSize,
                                max,
                                padding: 10,
                                fontColor: black,
                                callback: (value) => {
                                    if (typeof value === 'number') {
                                        return value < 10000 ? numeral(value).format('0,0') : numeral(value).format('0.0a');
                                    }
                                    return value;
                                },
                            },
                            afterTickToLabelConversion: (scaleInstance) => {
                                scaleInstance.ticks[0] = null;
                                scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;
                            },
                        }],
                        xAxes: [{
                            gridLines: {
                                drawTicks: false,
                                drawBorder: false,
                                color: gray[200],
                                zeroLineColor: gray[200],
                            },
                            ticks: {
                                padding: 10,
                                fontColor: black,
                            },
                        }],
                    },
                },
                plugins: [{
                    beforeDraw(chart: SBarChart): void {
                        const ctx: CanvasRenderingContext2D | null = chart.ctx;
                        if (!ctx) return;

                        ctx.save();

                        ctx.strokeStyle = gray[200];
                        ctx.lineWidth = 1;

                        ctx.beginPath();
                        ctx.moveTo(chart.chartArea.left, chart.chartArea.bottom);
                        ctx.lineTo(chart.chartArea.right, chart.chartArea.bottom);
                        ctx.moveTo(chart.chartArea.right, chart.chartArea.top);
                        ctx.lineTo(chart.chartArea.right, chart.chartArea.bottom);
                        ctx.moveTo(chart.chartArea.right, chart.chartArea.top);
                        ctx.lineTo(chart.chartArea.left, chart.chartArea.top);
                        ctx.stroke();

                        ctx.restore();
                    },
                }],
            }, {
                borderWidth: 0,
                categoryPercentage: 0.5,
                barPercentage: 0.8,
            });
        };

        watch([() => state.chartRef, () => state.loading], ([ctx, loading]) => {
            if (ctx && !loading) {
                drawChart(ctx);
            }
        }, {
            immediate: false,
        });

        const getData = async (): Promise<void> => {
            state.loading = true;
            state.data = [];
            try {
                const now = moment().tz(getTimezone());
                const start = moment().tz(getTimezone()).subtract(6, 'days');
                const res = await SpaceConnector.client.statistics.topic.dailyJobSummary({
                    start: start.format(),
                    end: now.format(),
                });
                state.data = _.orderBy(res.results, ['date'], ['asc']);
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        getData();

        return {
            ...toRefs(state),
            legends: computed(() => _.chain(LEGEND_COLORS)
                .map((v, k) => ({ name: k, color: v }))
                .reverse()
                .value()),
        };
    },
};
</script>

<style lang="postcss">
.p-widget-layout-container {
    .see-more-text {
        @apply text-blue-600;
        margin-left: 1.5rem;
        font-size: 0.875rem;
        &:hover {
            @apply text-blue-600;
        }
    }

    .chart {
        height: 254px;
    }

    .legend-lap {
        width: 100%;
        text-align: center;
        text-transform: uppercase;
        padding-top: 0.5rem;
        .legend {
            font-size: 0.875rem;
            padding: 0 1rem;
        }
        .color {
            display: inline-block;
            width: 0.75rem;
            height: 0.75rem;
            margin-right: 0.5rem;
            border-radius: 2px;
            background-color: currentColor;
        }
    }
}
</style>
