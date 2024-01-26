<script lang="ts" setup>
import {
    computed,
    reactive, ref, watch,
} from 'vue';

import type * as am5xy from '@amcharts/amcharts5/xy';
import {
    PDataLoader, PSkeleton,
} from '@spaceone/design-system';
import { cloneDeep, isEmpty } from 'lodash';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { getLegends, getXYChartData } from '@/services/cost-explorer/helpers/cost-explorer-chart-data-helper';
import type { Legend, XYChartData } from '@/services/cost-explorer/types/cost-explorer-chart-type';


interface Props {
    loading: boolean;
    data: any;
    groupBy?: string;
    period?: { start: string; end: string };
}
const props = withDefaults(defineProps<Props>(), {
    loading: true,
    data: () => ([]),
    groupBy: undefined,
    period: undefined,
});

const DATE_FIELD_NAME = 'date';
const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const state = reactive({
    legends: computed<Legend[]>(() => {
        if (isEmpty(props.data) || !props.groupBy) return [];
        return getLegends(props.data, GRANULARITY.MONTHLY, props.groupBy);
    }),
    chartData: computed<XYChartData[]>(() => {
        if (isEmpty(props.data) || !props.groupBy || !props.period) return [];
        return getXYChartData(props.data, GRANULARITY.MONTHLY, props.period, props.groupBy);
    }),
});

/* Util */
const drawChart = () => {
    chartHelper.refreshRoot();
    const { chart, xAxis, yAxis } = chartHelper.createXYDateChart();

    // set base interval of xAxis
    xAxis.get('baseInterval').timeUnit = 'month';

    // set label adapter of yAxis
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    yAxis.get('renderer').remove('labels');

    // set min value of yAxis
    state.legends.forEach((legend) => {
        // create series
        const seriesSettings: Partial<am5xy.IXYSeriesSettings> = {
            name: legend.label as string,
            valueYField: legend.name,
            stacked: true,
            stroke: undefined,
        };
        if (legend.color) seriesSettings.fill = chartHelper.color(legend.color);
        const series = chartHelper.createXYColumnSeries(chart, seriesSettings);

        chart.series.push(series);

        // set data processor
        const dateFormat = 'yyyy-MM';
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat,
            dateFields: [DATE_FIELD_NAME],
        });

        // create tooltip and set on series
        const tooltip = chartHelper.createTooltip();
        chartHelper.setXYSharedTooltipText(chart, tooltip);
        series.set('tooltip', tooltip);

        // set data
        series.data.setAll(cloneDeep(state.chartData));
    });
};

/* Watcher */
watch([() => state.chartData, () => state.legends, () => chartContext.value], async ([chartData, legends, _chartContext]) => {
    if (chartData.length && legends.length && _chartContext) drawChart();
}, { immediate: true });
</script>

<template>
    <p-data-loader class="chart-wrapper"
                   :loading="props.loading"
                   :data="state.chartData"
    >
        <template #loader>
            <p-skeleton height="100%" />
        </template>
        <div ref="chartContext"
             class="chart"
        />
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.chart-wrapper {
    height: 17rem;
    padding-top: 1.5rem;
    padding-bottom: 1rem;
    .chart {
        height: 100%;
        width: 100%;
    }
}
</style>
