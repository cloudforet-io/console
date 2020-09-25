<template>
    <p-widget-layout class="p-widget-layout-container">
        <template #title>
            <b>History</b>
            <router-link to="/management/collector-history" class="see-more-text">
                <span>see more</span>
                <p-i name="ic_arrow_right" width="1rem" height="1rem"
                     color="inherit transparent"
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
import _, { orderBy, chain, range } from 'lodash';
import numeral from 'numeral';
import dayjs from 'dayjs';

import {
    computed, reactive, toRefs, watch, UnwrapRef, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';

import { SpaceChart, tooltips } from '@/lib/chart/space-chart';
import { SpaceConnector } from '@/lib/space-connector';
import { getTimezone } from '@/lib/util';
import { queryTagsToQueryString } from '@/lib/router-query-string';
import {
    coral, gray, primary2, black,
} from '@/styles/colors';

interface Data {
    date: string;
    success: number;
    failure: number;
}
interface State {
    chartRef: HTMLCanvasElement|null;
    chart: Chart|null;
    data: Data[];
    loading: boolean;
}
const TICKS_COUNT = 5;
const DAY_COUNT = 7;
const DEFAULT_MAX = 600;
const DEFAULT_STEP_SIZE = 100;

export default {
    name: 'CollectorHistory',
    components: {
        PI,
        PWidgetLayout,
        PChartLoader,
        PSkeleton,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const LEGEND_COLORS: {[k: string]: string} = {
            failure: coral.default,
            success: primary2,
        };

        const state: UnwrapRef<State> = reactive({
            chartRef: null,
            chart: null,
            data: [],
            loading: true,
        });

        const onClickChart = (point, event) => {
            const item = event[0];
            if (item) {
                const clickedData = state.data[item._index];
                const queryTags: QueryTag[] = [];
                const selectedDate = moment(clickedData.date).format('YYYY-MM-DD');
                queryTags.push({
                    key: { label: 'Start Time', name: 'created_at', dataType: 'datetime' },
                    value: { label: selectedDate, name: selectedDate },
                    operator: '=',
                });
                vm.$router.push({ name: 'collectorHistory', query: { filters: queryTagsToQueryString(queryTags) } });
            }
        };
        const drawChart = (canvas) => {
            let data;
            if (state.data.length > 0) {
                data = state.data;
            } else {
                data = chain(range(0, DAY_COUNT))
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
                barPercentage: 0.5,
                categoryPercentage: 0.25,
                backgroundColor: LEGEND_COLORS.success,
                borderColor: LEGEND_COLORS.success,
            }, {
                label: 'Failure',
                data: data.map(d => d.failure) as number[],
                barPercentage: 0.5,
                categoryPercentage: 0.25,
                backgroundColor: LEGEND_COLORS.failure,
                borderColor: LEGEND_COLORS.failure,
            }];

            const max: number = state.data.length === 0 ? DEFAULT_MAX
                : _.max(datasets.map(ds => _.max(ds.data as number[]))) as number;
            const stepSize = state.data.length === 0 ? DEFAULT_STEP_SIZE
                : max / (TICKS_COUNT || 1);


            state.chart = new SpaceChart(canvas, {
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
                    onClick: onClickChart,
                },
                plugins: [{
                    beforeDraw(chart): void {
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
                const today = dayjs().tz(getTimezone());
                const res = await SpaceConnector.client.statistics.topic.dailyJobSummary({
                    start: today.subtract(6, 'day').toISOString(),
                    end: today.toISOString(),
                });
                const orderedData = orderBy(res.results, ['date'], ['asc']);
                state.data = orderedData.map(d => ({
                    date: moment(d.date).tz(getTimezone()).subtract(1, 'day').format('YYYY-MM-DD'),
                    success: d.success,
                    failure: d.failure,
                }));
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
            @apply text-secondary underline;
        }
    }

    .chart {
        height: 254px;
    }

    .legend-lap {
        width: 100%;
        text-align: center;
        text-transform: capitalize;
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
