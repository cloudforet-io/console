<template>
    <p-widget-layout class="service-summary">
        <template #top>
            <div class="top">
                <span class="title">{{ title }}</span>
                <router-link class="count" :to="to" :style="{
                    color: countColor,
                }"
                >
                    <animated-number :value="count"
                                     :format-value="countFormatter"
                                     :duration="1500"
                                     :round="1"
                                     easing="easeInOutSine"
                    />
                </router-link>
            </div>
        </template>
        <p-chart-loader :loading="loading" class="line-chart">
            <canvas ref="chartRef" />
        </p-chart-loader>
    </p-widget-layout>
</template>

<script lang="ts">
import { maxBy, minBy, chain } from 'lodash';
import Color from 'color';
import numeral from 'numeral';
import Chart, { ChartColor } from 'chart.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';

import {
    computed, reactive, toRefs, UnwrapRef, watch,
} from '@vue/composition-api';

import { PWidgetLayout, PChartLoader } from '@spaceone/design-system';

import AnimatedNumber from 'animated-number-vue';

import { SpaceChart, tooltips } from '@/lib/chart/space-chart';
import { SpaceConnector } from '@/lib/space-connector';
import styles, { gray, blue } from '@/styles/colors';

dayjs.extend(utc);
dayjs.extend(tz);


const GRADIENT_HEIGHT = 80;

interface ChartData {
    count: number;
    date: string;
}

interface State {
    loading: boolean;
    chartRef: HTMLCanvasElement|null;
    chart: Chart|null;
    data: ChartData[];
    count: number;
    errored: boolean;
    noChange: boolean;
    isDataReady: boolean;
}

const colorset = Object.freeze([
    styles.primary,
    styles.primary2,
    styles.coral.default,
    styles.secondary,
    styles.secondary1,
    styles.safe,
    styles.green[600],
    styles.green[400],
    styles.yellow.default,
    styles.primary1,
]);

export default {
    name: 'ServiceSummary',
    components: {
        PWidgetLayout,
        PChartLoader,
        AnimatedNumber,
    },
    props: {
        type: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            default: '',
        },
        to: {
            type: [String, Object],
            default: '/dashboard',
        },
        color: {
            type: String,
            default: colorset[0],
        },
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state: UnwrapRef<State> = reactive({
            loading: true,
            chartRef: null,
            chart: null,
            data: [],
            count: 0,
            errored: false,
            noChange: computed(() => state.data.every(d => d.count === state.data[0].count)),
            isDataReady: false,
        });

        /* util */
        const countFormatter = (val): string => (val < 10000 ? numeral(val).format('0,0') : numeral(val).format('0.0a'));
        const drawChart = (canvas) => {
            const maxItem = maxBy(state.data, 'count');
            const minItem = minBy(state.data, 'count');
            const max = maxItem ? maxItem.count : 80;
            const min = minItem ? minItem.count : 0;
            const diff = Math.abs(max - min);

            state.chart = new SpaceChart(canvas,
                {
                    type: 'line',
                    data: {
                        labels: state.data.map(d => d.date),
                        datasets: [{
                            label: props.title,
                            data: state.data.map(d => d.count),
                        }],
                    },
                    options: {
                        maintainAspectRatio: false,
                        legend: {
                            display: false,
                        },
                        layout: {
                            padding: {
                                top: 10,
                                left: -5,
                                bottom: 0,
                            },
                        },
                        scales: {
                            yAxes: [{
                                gridLines: {
                                    display: !state.noChange,
                                    drawTicks: false,
                                    drawBorder: false,
                                    borderDash: [2, 2],
                                    color: blue[200],
                                    zeroLineBorderDash: [2, 2],
                                    offsetGridLines: false,
                                    tickMarkLength: 0,
                                },
                                ticks: {
                                    display: false,
                                    beginAtZero: false,
                                    max: state.noChange ? undefined : max + (diff / 30),
                                },
                            }],
                            xAxes: [{
                                gridLines: {
                                    display: !state.noChange,
                                    drawTicks: false,
                                    drawBorder: true,
                                    drawOnChartArea: false,
                                    color: blue[300],
                                    borderDash: [2, 2],
                                    zeroLineColor: blue[300],
                                    zeroLineBorderDash: [2, 2],
                                    offsetGridLines: false,
                                },
                                ticks: {
                                    fontColor: gray[400],
                                    fontSize: 10,
                                    fontFamily: 'Noto Sans',
                                    padding: 4,
                                    autoSkip: true,
                                    autoSkipPadding: 10,
                                    maxRotation: 0,
                                },
                                beforeCalculateTickRotation(scaleInstance: any): void {
                                    scaleInstance.ticks[0] = null;
                                    scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;
                                },
                            }],
                        },
                        tooltips,
                    },
                    plugins: [{
                        beforeDraw(chart: SpaceChart): void {
                            if (state.noChange) return;
                            const ctx = chart.ctx;
                            if (!ctx) return;
                            ctx.save();

                            ctx.strokeStyle = blue[300];
                            ctx.lineWidth = 1;

                            ctx.beginPath();
                            ctx.moveTo(chart.chartArea.left, chart.chartArea.top);
                            ctx.lineTo(chart.chartArea.right, chart.chartArea.top);
                            ctx.stroke();

                            ctx.restore();
                        },
                        afterDraw(chart: Chart): void {
                            if (state.noChange) return;
                            const ctx = chart.ctx;
                            if (!ctx) return;
                            ctx.font = '10px Noto Sans';
                            ctx.fillStyle = props.color;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';

                            if (chart.data?.datasets) {
                                chart.data.datasets.forEach((dataset: any) => {
                                    for (let i = 0; i < dataset.data.length; i++) {
                                        if (i === 1 || i === state.data.length - 2) {
                                            // eslint-disable-next-line guard-for-in,no-restricted-syntax
                                            for (const key in dataset._meta) {
                                                const model = dataset._meta[key].data[i]._model;
                                                // @ts-ignore
                                                const text = countFormatter(dataset.data[i]);
                                                ctx.fillText(text, model.x, model.y - 2);
                                            }
                                        }
                                    }
                                });
                            }
                        },
                    }],
                }, {
                    borderWidth: 1,
                    fill: 'start',
                    pointRadius: state.noChange ? 0 : state.data.map((d, i) => {
                        if (i === 0 || i === state.data.length - 1) return 0;
                        return 1;
                    }),
                    pointBackgroundColor: props.color,
                    pointBorderWidth: 0,
                    lineTension: 0.02,
                    backgroundColor: (): ChartColor => {
                        const color = state.errored ? gray.default : props.color;
                        const gradient = canvas.getContext('2d')?.createLinearGradient(0, 0, 0, GRADIENT_HEIGHT);
                        if (gradient) {
                            gradient.addColorStop(0, Color(color).alpha(0.25).toString());
                            gradient.addColorStop(0.5, Color(color).alpha(0.125).toString());
                            gradient.addColorStop(1, Color(color).alpha(0).toString());
                        }
                        return gradient || color;
                    },
                    borderColor: state.errored ? gray.default : props.color,
                });
        };

        /* api */
        const getCount = async () => {
            try {
                let res;
                if (props.type === 'project') {
                    res = await SpaceConnector.client.statistics.topic.projectCount();
                } else if (props.type === 'server') {
                    res = await SpaceConnector.client.statistics.topic.serverCount({
                        project_id: props.projectId,
                    });
                } else if (props.type === 'cloudService') {
                    res = await SpaceConnector.client.statistics.topic.cloudServiceCount({
                        project_id: props.projectId,
                    });
                }
                state.count = res.results[0]?.count || 0;
            } catch (e) {
                console.error(e);
            }
        };
        const getTrend = async () => {
            const padItem = { count: 0, date: '' };
            try {
                let res;
                if (props.type === 'project') {
                    res = await SpaceConnector.client.statistics.topic.dailyProjectCount();
                } else if (props.type === 'server') {
                    res = await SpaceConnector.client.statistics.topic.dailyServerCount({
                        project_id: props.projectId,
                    });
                } else if (props.type === 'cloudService') {
                    res = await SpaceConnector.client.statistics.topic.dailyCloudServiceCount({
                        project_id: props.projectId,
                    });
                }

                if (res.results.length === 0) {
                    state.data = [padItem, padItem];
                } else if (res.results.length === 1) {
                    const item = res.results[0];
                    item.count = state.count;
                    item.date = dayjs(item.date).format('M/D');
                    state.data = [padItem, item, { ...padItem, count: item.count }];
                } else {
                    state.data = chain(res.results)
                        .sortBy('date')
                        .forEach((d) => {
                            d.date = dayjs(d.date).format('M/D');
                        })
                        .value();
                    state.data[state.data.length - 1].count = state.count;
                    state.data.splice(0, 0, { ...padItem, count: state.data[0].count });
                    state.data.push({ ...padItem, count: state.data[state.data.length - 1].count });
                }
            } catch (e) {
                console.error(e);
                state.errored = true;
                state.data = [padItem, padItem];
            } finally {
                state.isDataReady = true;
            }
        };

        const init = async () => {
            state.loading = true;
            state.data = [];
            state.count = 0;
            try {
                await getCount();
                await getTrend();
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        init();

        watch([() => state.chartRef, () => state.isDataReady], ([ctx, isDataReady]) => {
            if (ctx && isDataReady) {
                drawChart(ctx);
            }
        }, {
            immediate: false,
        });

        return {
            ...toRefs(state),
            countColor: computed(() => (state.loading || state.errored ? gray[500] : props.color)),
            countFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.service-summary::v-deep {
    .widget-contents {
        padding: 0;
        display: flex;
        align-items: flex-end;
    }
}
.top {
    @apply mb-2 mx-6 flex justify-between items-baseline;
}
.title {
    @apply mt-6 text-sm leading-normal capitalize font-bold mr-2;
    line-height: 1.5;
}
.count {
    @apply inline-block leading-none text-2xl font-bold ml-6 border-b border-transparent;
    &:hover {
        border-color: currentColor;
    }
}
.line-chart {
    height: 7.3rem;
    width: 100%;
}
</style>
