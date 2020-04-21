<template>
    <p-chart-loader :loading="loading">
        <template #loader>
            chart loading
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

export default defineComponent({
    name: 'PMetricChart',
    components: { PChartLoader },
    props: metricChartProps,
    setup(props: MetricChartProps) {
        const ts = new SChartToolSet<SLineChart>(SLineChart,
            (chart) => {
                _.forEach(props.dataset, (d, k) => chart.addData(d, k));
                return chart.setLabels(props.labels).setColors(props.colors).apply();
            });
        return {
            ...toRefs(ts.state),
        };
    },
});
</script>

<style lang="postcss" scoped>

</style>
