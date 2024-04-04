<script lang="ts" setup>
import {
    nextTick, ref, watch,
} from 'vue';

import type * as am5xy from '@amcharts/amcharts5/xy';
import {
    PSkeleton,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { numberFormatter } from '@cloudforet/utils';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import {
    setXYSharedTooltipText,
} from '@/common/composables/amcharts5/xy-chart-helper';

import type { RealtimeChartData } from '@/services/asset-inventory/types/metric-explorer-type';


interface Props {
    loading: boolean;
    chart: null | am5xy.XYChart;
    chartData: RealtimeChartData[];
}
const props = withDefaults(defineProps<Props>(), {
    loading: true,
    chart: null,
    chartData: () => ([]),
    legends: () => ([]),
});
const emit = defineEmits<{(e: 'update:chart', value): void;
}>();

const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);

const drawChart = () => {
    // create chart and axis
    const { chart, xAxis, yAxis } = chartHelper.createXYHorizontalChart();
    const _chartData = cloneDeep(props.chartData).reverse();
    yAxis.data.setAll(_chartData);

    const seriesSettings: Partial<am5xy.IXYSeriesSettings> = {
        name: '{category}',
        valueXField: 'value',
        categoryYField: 'category',
        xAxis,
        yAxis,
        baseAxis: yAxis,
        stacked: true,
        stroke: undefined,
    };

    // create series
    const series = chartHelper.createXYColumnSeries(chart, seriesSettings);

    // set series style
    series.columns.template.setAll({
        height: 16,
    });

    // set tooltip if showPassFindings is true
    const tooltip = chartHelper.createTooltip();
    const _tooltipValueFormatter = (value?: number): string => numberFormatter(value, { minimumFractionDigits: 2 }) ?? '';
    setXYSharedTooltipText(chart, tooltip, _tooltipValueFormatter);
    series.set('tooltip', tooltip);

    // add series to chart
    chart.series.push(series);

    // set data to series
    series.data.setAll(_chartData);

    return chart;
};

watch([() => chartContext.value, () => props.loading, () => props.chartData], async ([_chartContext, loading, chartData]) => {
    if (_chartContext && !loading && chartData.length) {
        chartHelper.refreshRoot();
        await nextTick();
        const chart = drawChart();
        emit('update:chart', chart);
    }
}, { immediate: false });
</script>

<template>
    <div class="h-full">
        <p-skeleton v-if="props.loading"
                    height="100%"
        />
        <div v-else
             ref="chartContext"
             class="chart"
        />
    </div>
</template>

<style lang="postcss" scoped>
.chart {
    height: 100%;
}
</style>
