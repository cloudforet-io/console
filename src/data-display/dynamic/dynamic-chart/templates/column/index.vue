<template>
    <div ref="chartRef" class="p-dynamic-chart-column" />
</template>

<script lang="ts">
import {
    defineComponent,
    onMounted, onUnmounted,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import * as am4core from '@amcharts/amcharts4/core';
import { XYChart } from '@amcharts/amcharts4/charts';

import {
    DEFAULT_NAME_OPTIONS,
    DEFAULT_VALUE_OPTIONS,
} from '@/data-display/dynamic/dynamic-chart/config';
import {
    getCategoryAxis,
    getColumnSeries,
    getValueAxis,
} from '@/data-display/dynamic/dynamic-chart/templates/column/helper';
import { DynamicChartTemplateProps } from '@/data-display/dynamic/dynamic-chart/type';


export default defineComponent<DynamicChartTemplateProps>({
    name: 'PDynamicChartColumn',
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
            chart: null as null|XYChart,
            chartRef: null as null|HTMLElement,
        });

        const disposeChart = () => {
            if (state.chart) state.chart.dispose();
        };

        const drawChart = () => {
            const ctx = state.chartRef;
            if (!ctx) return;

            const chart = am4core.create(ctx, XYChart);

            // chart settings
            chart.padding(40, 40, 40, 40);
            if (chart.hasLicense()) chart.logo.disabled = true;

            // get components of chart
            const categoryAxis = getCategoryAxis(props.nameOptions);
            const valueAxis = getValueAxis();
            const series = getColumnSeries(chart, props.nameOptions, props.valueOptions);

            // related tasks among components
            categoryAxis.sortBySeries = series;

            // put components into charts
            chart.yAxes.push(categoryAxis);
            chart.xAxes.push(valueAxis);
            chart.series.push(series);

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
.p-dynamic-chart-column {
    width: 100%;
}
</style>
