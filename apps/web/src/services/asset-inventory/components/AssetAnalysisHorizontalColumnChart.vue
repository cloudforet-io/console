<script lang="ts" setup>
import {
    nextTick, ref, watch,
} from 'vue';

import type * as am5xy from '@amcharts/amcharts5/xy';
import { cloneDeep } from 'lodash';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import type { RealtimeChartData } from '@/services/asset-inventory/types/asset-analysis-type';


interface Props {
    loading: boolean;
    chart: null | am5xy.XYChart;
    chartData: RealtimeChartData[];
    colorSet?: string[];
}
const props = withDefaults(defineProps<Props>(), {
    loading: true,
    chart: null,
    chartData: () => ([]),
    legends: () => ([]),
    colorSet: () => ([]),
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
        stroke: undefined,
    };

    // create series
    const series = chartHelper.createXYColumnSeries(chart, seriesSettings);

    // set color
    series.columns.template.adapters.add('fill', (fill, target) => {
        const _index = series.columns.indexOf(target);
        return props.colorSet[_index];
    });

    // set tooltip if showPassFindings is true
    const tooltip = chartHelper.createTooltip();
    tooltip.label.adapters.add('text', (_, target) => {
        let fieldName;
        chart.series.each((s) => {
            fieldName = s.get('valueXField') || '';
        });
        const targetName = target.dataItem?.dataContext?.category;
        const value = target.dataItem?.dataContext?.[fieldName];
        return `[fontSize: 14px;}]${targetName}:[/] [fontSize: 14px; bold]${value}[/]`;
    });
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
        <div v-show="!props.loading"
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
