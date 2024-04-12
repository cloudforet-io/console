<script lang="ts" setup>
import {
    nextTick, ref, watch,
} from 'vue';

import type * as am5xy from '@amcharts/amcharts5/xy';
import {
    PSkeleton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';

import { numberFormatter } from '@cloudforet/utils';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { Legend, XYChartData } from '@/services/asset-inventory/types/metric-explorer-type';
import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constant';


interface Props {
    loading: boolean;
    chart: null | am5xy.XYChart;
    chartData: XYChartData[];
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

const DATE_FIELD_NAME = 'date';
const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;

const drawChart = () => {
    const _dateAxisSettings = metricExplorerPageState.granularity === GRANULARITY.DAILY ? {
        min: dayjs.utc(metricExplorerPageState.period?.start).valueOf(),
        max: dayjs.utc(metricExplorerPageState.period?.end).add(1, 'day').valueOf(),
    } : {};
    const { chart, xAxis } = chartHelper.createXYDateChart({}, _dateAxisSettings);

    // set base interval of xAxis
    xAxis.get('baseInterval').timeUnit = metricExplorerPageState.granularity === GRANULARITY.DAILY ? 'day' : 'month';

    // hide zoom button
    chart.zoomOutButton.set('forceHidden', true);

    // set cursor if line chart
    chart.get('cursor')?.lineX.setAll({
        visible: true,
    });

    // set series
    props.legends.forEach((legend) => {
        const seriesSettings = {
            name: legend.label as string,
            valueYField: legend.name,
        };

        // create series
        const series = chartHelper.createXYLineSeries(chart, seriesSettings);
        chart.series.push(series);

        // set data processor on series
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat: metricExplorerPageState.granularity === GRANULARITY.DAILY ? 'yyyy-MM-dd' : 'yyyy-MM',
            dateFields: [DATE_FIELD_NAME],
        });

        // create tooltip and set on series
        const tooltip = chartHelper.createTooltip();
        const _tooltipValueFormatter = (value?: number): string => numberFormatter(value, { minimumFractionDigits: 2 }) ?? '';
        chartHelper.setXYSharedTooltipText(chart, tooltip, _tooltipValueFormatter);
        series.set('tooltip', tooltip);

        // set data on series
        series.data.setAll(cloneDeep(props.chartData));
    });
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
