<template>
    <p-widget-layout title="History">
        <div class="text-gray text-xs mb-2">
            Job Count
        </div>
        <p-chart-loader :loading="loading" class="chart">
            <template #loader>
                <p-skeleton width="100%" height="100%" />
            </template>
            <canvas ref="chartRef" />
        </p-chart-loader>
        <template #extra>
            <span v-for="(legend) in legends" :key="legend.name" class="legend">
                <span class="color" :style="{color: legend.color}" />
                {{ legend.name }}
            </span>
        </template>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import {
    coral, gray, primary, black,
} from '@/styles/colors';
import _ from 'lodash';
import { SBarChart } from '@/lib/chart/bar-chart';
import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import { FILTER_OPERATOR, fluentApi } from '@/lib/fluent-api';
import moment from 'moment';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';
import { HistoryStat } from '@/lib/fluent-api/statistics/history';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { NSChart, tooltips } from '@/lib/chart/s-chart';
import Chart from 'chart.js';
import numeral from 'numeral';

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
            success: primary,
            failure: coral.default,
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
                backgroundColor: LEGEND_COLORS.success,
                borderColor: LEGEND_COLORS.success,
            }, {
                label: 'Failure',
                data: data.map(d => d.failure) as number[],
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
            lazy: true,
        });


        const api = fluentApi.statisticsTest().history().stat<Data>()
            .setTopic('daily_job_summary')
            .addGroupKey('created_at', 'date')
            .addGroupField('success', STAT_OPERATORS.sum, 'values.success_count')
            .addGroupField('failure', STAT_OPERATORS.sum, 'values.fail_count')
            .setFilter({ key: 'created_at', value: `now/d-${DAY_COUNT - 1}d`, operator: FILTER_OPERATOR.gtTime });


        const getData = async (): Promise<void> => {
            state.loading = true;
            state.data = [];
            try {
                const res = await props.getAction(api).execute();
                state.data = _.orderBy(res.data.results, ['date'], ['asc']);
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

<style lang="postcss" scoped>
.chart {
    height: 254px;
}
.legend {
    @apply uppercase ml-6 inline-flex items-center float-right;
    font-size: 0.875rem;
    font-weight: normal;
    .color {
        display: inline-block;
        width: 0.75rem;
        height: 0.75rem;
        margin-right: 0.5rem;
        border-radius: 2px;
        background-color: currentColor;
    }
}
</style>
