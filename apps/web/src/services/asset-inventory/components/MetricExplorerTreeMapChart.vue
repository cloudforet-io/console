<script lang="ts" setup>
import {
    nextTick, ref, watch,
} from 'vue';

import {
    PSkeleton,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import type {
    Legend, RealtimeChartData, TreemapChartData,
} from '@/services/asset-inventory/types/metric-explorer-type';


interface Props {
    loading: boolean;
    chartData: RealtimeChartData[];
    legends: Legend[];
}

const props = withDefaults(defineProps<Props>(), {
    loading: true,
    chart: null,
    chartData: () => ([]),
    legends: () => ([]),
});

const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);


const getRefinedTreemapChartData = (data: RealtimeChartData[]): TreemapChartData[] => [{
    children: data,
}];
const drawChart = () => {
    if (!props.chartData?.length) return;
    const seriesSettings = {
        valueField: 'value',
        categoryField: 'category',
        nodePaddingInner: 4,
    };
    const series = chartHelper.createTreeMapSeries(seriesSettings);
    const tooltip = chartHelper.createTooltip();
    series.set('tooltip', tooltip);
    chartHelper.setTreemapTooltipText(series, tooltip);
    chartHelper.setTreemapLabelText(series, {
        oversizedBehavior: 'truncate',
    });

    const _chartData = getRefinedTreemapChartData(cloneDeep(props.chartData));
    series.data.setAll(_chartData);
};

watch([() => chartContext.value, () => props.loading, () => props.chartData], async ([_chartContext, loading, chartData]) => {
    if (_chartContext && !loading && chartData.length) {
        chartHelper.refreshRoot();
        await nextTick();
        drawChart();
    }
}, { immediate: false });
</script>

<template>
    <div class="h-full">
        <p-skeleton v-if="props.loading"
                    height="100%"
        />
        <div ref="chartContext"
             class="chart"
        />
    </div>
</template>

<style lang="postcss" scoped>
.chart {
    height: 100%;
}
</style>
