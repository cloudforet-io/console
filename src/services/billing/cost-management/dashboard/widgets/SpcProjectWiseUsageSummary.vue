<template>
    <div ref="chartRef" class="chart" />
</template>

<script lang="ts">
import {
    onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { PieChart } from '@amcharts/amcharts4/charts';
import config from '@/lib/config';
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themesAnimated);

const tempChartData = [{
    name: 'Lithuania',
    value: 501.9,
}, {
    name: 'Czechia',
    value: 301.9,
}, {
    name: 'Ireland',
    value: 201.1,
}, {
    name: 'Germany',
    value: 165.8,
}, {
    name: 'Australia',
    value: 139.9,
}, {
    name: 'Austria',
    value: 128.3,
}, {
    name: 'UK',
    value: 99,
},
];

const categoryKey = 'name';
const valueName = 'value';

export default {
    name: 'SpcProjectWiseUsageSummary',
    components: {},

    setup() {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as PieChart | null,
            chartRegistry: {},
        });

        const disposeChart = (chartContext) => {
            if (state.chartRegistry[chartContext]) {
                state.chartRegistry[chartContext].dispose();
                delete state.chartRegistry[chartContext];
            }
        };

        const drawChart = (chartContext) => {
            const createChart = () => {
                disposeChart(chartContext);
                state.chartRegistry[chartContext] = am4core.create(chartContext, am4charts.PieChart);
                return state.chartRegistry[chartContext];
            };
            const chart = createChart();
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.data = tempChartData;

            const pieSeries = chart.series.push(new am4charts.PieSeries());
            pieSeries.dataFields.value = valueName;
            pieSeries.dataFields.category = categoryKey;

            pieSeries.labels.template.disabled = true;
        };

        watch(() => state.chartRef, (chartContext) => {
            if (chartContext) {
                drawChart(chartContext);
            }
        }, { immediate: false });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.chart {
    height: 20rem;
}
</style>
