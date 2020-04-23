<template>
    <fragment>
        <div class="flex justify-between">
            <span class="text-sm font-bold capitalize">{{ title }}</span>
            <span class="text-sm text-gray flex-grow">&nbsp; {{ unit.y | yUnit }}</span>
            <p-lottie v-if="loading && chart" name="spinner" auto />
        </div>
        <p-chart-loader :loading="loading && !chart" class="chart">
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <canvas ref="chartRef" />
            <transition name="fade-in">
                <div v-if="error || (loading && chart)" class="shade">
                    <p v-if="error">
                        Unavailable
                    </p>
                </div>
            </transition>
        </p-chart-loader>
    </fragment>
</template>

<script lang="ts">
import { defineComponent, toRefs, watch } from '@vue/composition-api';
import { MetricChartProps, metricChartProps } from '@/components/organisms/charts/metric-chart/MetricChart.toolset';
import { SChartToolSet } from '@/lib/chart/toolset';
import { SLineChart } from '@/lib/chart/line-chart';
import PChartLoader from '@/components/organisms/charts/chart-loader/ChartLoader.vue';
import _ from 'lodash';
import { gray } from '@/styles/colors';
import { tooltips } from '@/lib/chart/s-chart';
import { chartTimestampFormatter } from '@/lib/util';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';

export default defineComponent({
    name: 'PMetricChart',
    filters: {
        yUnit(unit: string) {
            return unit ? `(${unit})` : '';
        },
    },
    components: { PLottie, PSkeleton, PChartLoader },
    props: metricChartProps,
    setup(props: MetricChartProps) {
        const getLabels = () => {
            if (props.unit.x === 'Timestamp') {
                const labels: string[] | string[][] = props.labels.map(t => chartTimestampFormatter(t));
                labels.forEach((e, i, a: string[] | string[][]) => {
                    if (typeof e === 'string' && /\n/.test(e)) {
                        a[i] = e.split(/\n/);
                    }
                });
                return labels;
            }
            return props.labels;
        };

        const ts = new SChartToolSet<SLineChart, object>(SLineChart,
            (chart) => {
                _.forEach(props.dataset, (d, k) => chart.addData(d, k));

                return chart.setLabels(getLabels())
                    .setColors(props.colors)
                    .setLineTension(0)
                    // .setGradientHeight(150)
                    .setFill(false)
                    .apply();
            }, undefined, {
                options: {
                    maintainAspectRatio: false,
                    legend: {
                        display: false,
                    },
                    scales: {
                        yAxes: [{
                            gridLines: {
                                display: true,
                                drawTicks: false,
                                color: gray[100],
                                zeroLineColor: gray[100],
                            },
                            ticks: {
                                display: true,
                                autoSkip: true,
                                autoSkipPadding: 20,
                                padding: 10,
                                suggestedMin: 0,
                            },
                        }],
                        xAxes: [{
                            gridLines: {
                                display: true,
                                drawTicks: false,
                                color: gray[100],
                                zeroLineColor: gray[100],
                            },
                            ticks: {
                                autoSkip: true,
                                autoSkipPadding: 50,
                                padding: 10,
                                maxRotation: 0,
                            },
                            afterTickToLabelConversion(scaleInstance): void {
                                scaleInstance.ticks[0] = null;
                                scaleInstance.ticks[scaleInstance.ticks.length - 1] = null;
                            },
                        }],
                    },
                    tooltips: {
                        ...tooltips,
                        mode: 'point',
                    },
                },
            });

        watch(() => props.dataset, () => {
            if (ts.state.chart) {
                _.forEach(props.dataset, (ds, label) => {
                    ts.state.chart?.updateData(ds, label);
                    ts.state.chart?.setLabels(getLabels());
                });
                ts.state.chart.update();
            }
        });
        return {
            ...toRefs(ts.state),
        };
    },
});
</script>

<style lang="postcss" scoped>
    .chart {
        @apply mt-5 relative;
        height: 12.5rem;
    }
    .shade {
        @apply absolute opacity-50 bg-white w-full h-full flex items-center justify-center;
        bottom: 0;
    }
    .fade-in-enter-active, .fade-in-leave-active {
        transition: opacity 0.5s;
    }
    .fade-in-enter, .fade-in-leave-to {
        opacity: 0;
    }
    .fade-in-enter-to, .fade-in-leave {
        opacity: 0.5;
    }
</style>
