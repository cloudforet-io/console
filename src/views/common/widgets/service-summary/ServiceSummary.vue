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
import {
    computed, reactive, toRefs, UnwrapRef, watch,
} from '@vue/composition-api';
import numeral from 'numeral';
import {
    serviceSummaryProps,
    ServiceSummaryPropsType, Trend, Value,
} from '@/views/common/widgets/service-summary/ServiceSummary.toolset';
import AnimatedNumber from 'animated-number-vue';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PChartLoader from '@/components/organisms/charts/chart-loader/PChartLoader.vue';
import { gray, blue } from '@/styles/colors';
import { FILTER_OPERATOR, fluentApi } from '@/lib/fluent-api';
import { maxBy, minBy, chain } from 'lodash';
import moment from 'moment';
import Chart, { ChartColor } from 'chart.js';
import { SpaceChart, tooltips } from '@/lib/chart/space-chart';
import Color from 'color';


export default {
    name: 'ServiceSummary',
    components: { PWidgetLayout, PChartLoader, AnimatedNumber },
    props: serviceSummaryProps,
    setup(props: ServiceSummaryPropsType) {
        interface StateInterface {
            chartRef: HTMLCanvasElement|null;
            chart: Chart|null;
            data: Trend[];
            loading: boolean;
            count: number;
            errored: boolean;
            noChange: boolean;
            isDataReady: boolean;
        }

        const state: UnwrapRef<StateInterface> = reactive({
            chartRef: null,
            chart: null,
            data: [],
            loading: true,
            count: 0,
            errored: false,
            noChange: computed(() => state.data.every(d => d.count === state.data[0].count)),
            isDataReady: false,
        });

        const countFormatter = (val): string => (val < 10000 ? numeral(val).format('0,0') : numeral(val).format('0.0a'));

        const gradientHeight = 80;
        const ticksCount = 2;

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
                        const gradient = canvas.getContext('2d')?.createLinearGradient(0, 0, 0, gradientHeight);
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

        watch([() => state.chartRef, () => state.isDataReady], ([ctx, isDataReady]) => {
            if (ctx && isDataReady) {
                drawChart(ctx);
            }
        }, {
            immediate: false,
        });


        const countApi = fluentApi.statisticsTest().resource().stat<Value>().setCount('count');

        const trendApi = fluentApi.statisticsTest().history().stat<Trend>()
            .addGroupKey('created_at', 'date')
            .setFilter(
                { key: 'created_at', value: 'now/d-30d', operator: FILTER_OPERATOR.gtTime },
            );

        const getCount = async (): Promise<void> => {
            try {
                const res = await props.getAction(countApi).execute();
                state.count = res.data.results[0]?.count || 0;
            } catch (e) {
                console.error(e);
            }
        };

        const getTrend = async (): Promise<void> => {
            const padItem = { count: 0, date: '' };
            try {
                const res = await props.getTrendAction(trendApi).execute();
                // no data case
                if (res.data.results.length === 0) {
                    state.data = [padItem, padItem];
                    // one data case
                } else if (res.data.results.length === 1) {
                    const item = res.data.results[0];
                    item.count = state.count;
                    item.date = moment(item.date).format('M/D');
                    state.data = [padItem, item, { ...padItem, count: item.count }];
                    // more than one data case
                } else {
                    state.data = chain(res.data.results)
                        .sortBy('date')
                        .forEach((d) => {
                            d.date = moment(d.date).format('M/D');
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


        const getData = async (): Promise<void> => {
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

        getData();

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
