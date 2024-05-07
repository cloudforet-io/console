<script lang="ts" setup>
import {
    nextTick, ref, watch,
} from 'vue';

import type * as am5percent from '@amcharts/amcharts5/percent';

import { numberFormatter } from '@cloudforet/utils';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import { BASIC_CHART_COLORS } from '@/styles/colorsets';

import type { Legend, RealtimeChartData } from '@/services/asset-inventory/types/metric-explorer-type';


interface Props {
    loading: boolean;
    chart: null | am5percent.PieChart;
    chartData: RealtimeChartData[];
    legends: Legend[];
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

const valueFormatter = (val) => numberFormatter(val, { maximumFractionDigits: 0 }) as string;
const drawChart = () => {
    const chart = chartHelper.createDonutChart();
    const seriesSettings = {
        categoryField: 'category',
        valueField: 'value',
    };
    const series = chartHelper.createPieSeries(seriesSettings);
    series.labels.template.set('forceHidden', false);
    series.ticks.template.set('forceHidden', false);
    series.labels.template.setAll({
        text: '{category} ({valuePercentTotal.formatNumber("0.00")}%)',
        fontSize: 14,
    });
    series.labels.template.adapters.add('y', (y, target) => {
        const dataItem = target.dataItem;
        if (dataItem) {
            const tick = dataItem.get('tick');
            if (tick) {
                if (dataItem.get('valuePercentTotal') < 5) {
                    target.set('forceHidden', true);
                    tick.set('forceHidden', true);
                }
            }
            return y;
        }
        return undefined;
    });
    chart.series.push(series);

    // set color
    if (props.legends.length <= BASIC_CHART_COLORS.length) {
        chartHelper.setChartColors(chart, BASIC_CHART_COLORS);
    }

    // tooltip
    if (props.chartData.some((d) => typeof d.value === 'number' && d.value > 0)) {
        const tooltip = chartHelper.createTooltip();
        chartHelper.setPieTooltipText(series, tooltip, valueFormatter);
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
