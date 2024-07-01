<script lang="ts" setup>
import {
    nextTick, ref, watch,
} from 'vue';

import type * as am5xy from '@amcharts/amcharts5/xy';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';

import { numberFormatter } from '@cloudforet/utils';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import { GRANULARITY } from '@/services/asset-inventory/constants/asset-analysis-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { Legend, XYChartData } from '@/services/asset-inventory/types/asset-analysis-type';


interface Props {
    loading: boolean;
    chart: null | am5xy.XYChart;
    chartData: XYChartData[];
    legends: Legend[];
    colorSet?: string[];
    stacked?: boolean;
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

    // set color set
    chartHelper.setChartColors(chart, props.colorSet);

    // set base interval of xAxis
    xAxis.get('baseInterval').timeUnit = metricExplorerPageState.granularity === GRANULARITY.DAILY ? 'day' : 'month';

    // set date format for daily chart
    if (metricExplorerPageState.granularity === GRANULARITY.DAILY) {
        xAxis.setAll({
            dateFormats: {
                day: 'd',
            },
        });
    }

    // hide zoom button
    chart.zoomOutButton.set('forceHidden', true);

    // set cursor if line chart
    chart.get('cursor')?.lineX.setAll({
        visible: true,
    });

    // set series
    const _legends = props.stacked ? cloneDeep(props.legends).reverse() : props.legends;
    _legends.forEach((legend) => {
        const seriesSettings: Partial<am5xy.IXYSeriesSettings> = {
            name: legend.label as string,
            valueYField: legend.name,
            stacked: props.stacked,
        };
        if (legend.color) {
            seriesSettings.fill = chartHelper.color(legend.color);
            seriesSettings.stroke = chartHelper.color(legend.color);
        }

        // create series
        const series = chartHelper.createXYLineSeries(chart, seriesSettings);
        chart.series.push(series);

        // set fill opacity if stacked
        if (props.stacked) {
            series.fills.template.setAll({
                fillOpacity: 0.3,
                visible: true,
            });
        }

        // set data processor on series
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat: metricExplorerPageState.granularity === GRANULARITY.DAILY ? 'yyyy-MM-dd' : 'yyyy-MM',
            dateFields: [DATE_FIELD_NAME],
        });

        // create tooltip and set on series
        const tooltip = chartHelper.createTooltip();
        const valueFormatter = (val) => numberFormatter(val) as string;
        chartHelper.setXYSharedTooltipText(chart, tooltip, valueFormatter);
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
        <div v-show="props.chartData.length"
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
