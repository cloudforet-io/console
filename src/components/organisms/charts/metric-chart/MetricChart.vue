<template>
    <p-chart-loader :loading="loading">
        <template #loader>
            <p-skeleton height="100%" />
        </template>
        <canvas ref="chartRef" />
    </p-chart-loader>
</template>

<script lang="ts">
import { defineComponent, toRefs } from '@vue/composition-api';
import { MetricChartProps, metricChartProps } from '@/components/organisms/charts/metric-chart/MetricChart.toolset';
import { SChartToolSet } from '@/lib/chart/toolset';
import { SLineChart } from '@/lib/chart/line-chart';
import PChartLoader from '@/components/organisms/charts/chart-loader/ChartLoader.vue';
import _ from 'lodash';
import { gray } from '@/styles/colors';
import { tooltips } from '@/lib/chart/s-chart';
import { chartTimestampFormatter } from '@/lib/util';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';

export default defineComponent({
    name: 'PMetricChart',
    components: { PSkeleton, PChartLoader },
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

        const ts = new SChartToolSet<SLineChart>(SLineChart,
            (chart) => {
                _.forEach(props.dataset, (d, k) => chart.addData(d, k));

                return chart.setLabels(getLabels())
                    .setColors(props.colors)
                    .setLineTension(0)
                    // .setGradientHeight(100)
                    .setFill(false)
                    // .setGridLineColor(gray[200])
                    // .setGridLineDisplay(true)
                    // .setGridLineDrawTicks(false)
                    // .setTicksDisplay(true)
                    // .setTicksAutoSkip(true)
                    // .setTicksAutoSkipPadding(50, 'x')
                    // .setTicksAutoSkipPadding(20, 'y')
                    // .setTicksPadding(10)
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
        return {
            ...toRefs(ts.state),
        };
    },
});
</script>

<style lang="postcss" scoped>
</style>
