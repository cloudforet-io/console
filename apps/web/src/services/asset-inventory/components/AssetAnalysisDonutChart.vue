<script lang="ts" setup>
import {
    nextTick, ref, watch,
} from 'vue';

import type * as am5percent from '@amcharts/amcharts5/percent';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import { gray } from '@/styles/colors';

import type { Legend, RealtimeChartData } from '@/services/asset-inventory/types/asset-analysis-type';


interface Props {
    loading: boolean;
    chart: null | am5percent.PieChart;
    chartData: RealtimeChartData[];
    legends: Legend[];
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
    const chart = chartHelper.createDonutChart();
    const seriesSettings = {
        categoryField: 'category',
        valueField: 'value',
        alignLabels: false,
    };
    const series = chartHelper.createPieSeries(seriesSettings);
    series.labels.template.set('forceHidden', false);
    series.ticks.template.set('forceHidden', false);
    series.ticks.template.set('visible', true);
    series.labels.template.setAll({
        text: '{category}',
        fontSize: 12,
        fill: chartHelper.color(gray[700]),

    });
    chart.series.push(series);

    // set color
    chartHelper.setChartColors(chart, props.colorSet);

    // tooltip
    if (props.chartData.some((d) => typeof d.value === 'number' && d.value > 0)) {
        const tooltip = chartHelper.createTooltip();
        chartHelper.setPieTooltipText(series, tooltip);
        series.slices.template.set('tooltip', tooltip);
        series.data.setAll(props.chartData);
    }
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
