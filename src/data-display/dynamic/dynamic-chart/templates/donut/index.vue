<template>
    <div ref="chartRef" class="p-dynamic-chart-donut" />
</template>

<script lang="ts">
import {
    defineComponent, onMounted, onUnmounted,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import * as am4core from '@amcharts/amcharts4/core';
import { PieChart } from '@amcharts/amcharts4/charts';

import {
    DEFAULT_NAME_OPTIONS,
    DEFAULT_VALUE_OPTIONS,
} from '@/data-display/dynamic/dynamic-chart/config';

import { getLegends, getPieSeries } from '@/data-display/dynamic/dynamic-chart/templates/donut/helper';
import { DynamicChartTemplateProps } from '@/data-display/dynamic/dynamic-chart/type';


export default defineComponent<DynamicChartTemplateProps>({
    name: 'PDynamicChartDonut',
    props: {
        data: {
            type: Array,
            default: () => [],
        },
        valueOptions: {
            type: Object as () => DynamicChartTemplateProps['valueOptions'],
            default: () => ({ ...DEFAULT_VALUE_OPTIONS }),
        },
        nameOptions: {
            type: Object as () => DynamicChartTemplateProps['nameOptions'],
            default: () => ({ ...DEFAULT_NAME_OPTIONS }),
        },
    },
    setup(props) {
        const state = reactive({
            chart: null as null|PieChart,
            chartRef: null as null|HTMLElement,
        });

        const disposeChart = () => {
            if (state.chart) state.chart.dispose();
        };

        const drawChart = () => {
            const ctx = state.chartRef;
            if (!ctx) return;

            const chart = am4core.create(ctx, PieChart);

            // chart settings
            chart.innerRadius = am4core.percent(65);
            if (chart.hasLicense()) chart.logo.disabled = true;

            // get components of chart
            const series = getPieSeries(props.nameOptions, props.valueOptions, !props.data.length);
            const legends = getLegends();

            // put components into charts
            chart.series.push(series);
            chart.legend = legends;

            // put data into charts
            chart.data = props.data;

            state.chart = chart;
        };

        const updateChartData = (data: any[]) => {
            if (state.chart) state.chart.data = data;
        };

        onMounted(() => {
            drawChart();
        });

        const stopDataWatch = watch(() => props.data, (data) => {
            updateChartData(data);
        });

        onUnmounted(() => {
            if (stopDataWatch) stopDataWatch();
            disposeChart();
        });

        return {
            ...toRefs(state),
            disposeChart,
            drawChart,
            updateChartData,
        };
    },
});
</script>

<style lang="postcss">
.p-dynamic-chart-donut {
    width: 100%;
}
</style>
