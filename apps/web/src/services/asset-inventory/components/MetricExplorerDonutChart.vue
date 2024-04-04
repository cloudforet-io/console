<script lang="ts" setup>
import {
    nextTick, ref, watch,
} from 'vue';

import type * as am5percent from '@amcharts/amcharts5/percent';
import {
    PSkeleton,
} from '@spaceone/design-system';

import { numberFormatter } from '@cloudforet/utils';

import { useAmcharts5 } from '@/common/composables/amcharts5';

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

const drawChart = () => {
    const chart = chartHelper.createDonutChart();
    const seriesSettings = {
        categoryField: 'category',
        valueField: 'value',
    };
    const series = chartHelper.createPieSeries(seriesSettings);
    series.labels.template.set('forceHidden', false);
    series.ticks.template.set('forceHidden', false);

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


    if (props.chartData.some((d) => typeof d.value === 'number' && d.value > 0)) {
        const tooltip = chartHelper.createTooltip();
        const valueFormatter = (val) => numberFormatter(val, { minimumFractionDigits: 2 }) as string;
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
