<template>
    <section class="spot-interrupt-chart">
        <p-chart-loader :loading="loading" class="chart-wrapper">
            <div ref="chartRef" class="chart" />
        </p-chart-loader>
    </section>
</template>

<script lang="ts">
import { PChartLoader } from '@spaceone/design-system';
import {
    onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { red } from '@/styles/colors';

export default {
    name: 'SpotInterruptChart',
    components: {
        PChartLoader,
    },
    setup(props) {
        const state = reactive({
            loading: true,
            loaderRef: null,
            chartRef: null as HTMLElement | null,
            chart: null as null | any,
            chartRegistry: {},
            data: [] as unknown,
        });

        const disposeChart = (ctx) => {
            if (state.chartRegistry[ctx]) {
                state.chartRegistry[ctx].dispose();
                delete state.chartRegistry[ctx];
            }
        };

        const drawChart = (ctx) => {
            const createChart = () => {
                disposeChart(ctx);
                state.chartRegistry[ctx] = am4core.create(ctx, am4charts.XYChart);
                return state.chartRegistry[ctx];
            };
            const chart = createChart();
            state.chart = chart;
            chart.responsive.enabled = true;
            chart.logo.disabled = true;
            chart.data = state.data;

            // Create axes
            const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.labels.template.adapter.add('text', () => '');

            // Create value axis
            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.labels.template.adapter.add('text', () => '');

            // Create series
            const lineSeries = chart.series.push(new am4charts.LineSeries());
            lineSeries.dataFields.valueY = 'value';
            lineSeries.dataFields.dateX = 'date';
            lineSeries.name = 'Spot interrupt';
            lineSeries.stroke = am4core.color(red[500]);
            lineSeries.strokeWidth = 1.5;
            lineSeries.strokeDasharray = '2,2';
            lineSeries.fillOpacity = 0.2;
            lineSeries.fill = am4core.color(red[500]);

            const fillModifier = new am4core.LinearGradientModifier();
            fillModifier.opacities = [1, 0];
            fillModifier.offsets = [0, 1];
            fillModifier.gradient.rotation = 90;
            lineSeries.segments.template.fillModifier = fillModifier;

            state.chart = chart;
        };

        const getData = async () => {
            state.loading = true;
            state.data = [];
            try {
                const res = [{
                    date: new Date(2018, 3, 20),
                    value: 90,
                }, {
                    date: new Date(2018, 3, 21),
                    value: 102,
                }, {
                    date: new Date(2018, 3, 22),
                    value: 65,
                }, {
                    date: new Date(2018, 3, 23),
                    value: 62,
                }, {
                    date: new Date(2018, 3, 24),
                    value: 55,
                }, {
                    date: new Date(2018, 3, 25),
                    value: 81,
                    disabled: false,
                }];
                state.data = res;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const init = async () => {
            await getData();
        };
        init();

        // draw loader chart or data chart
        watch([() => state.loading, () => state.chartRef], ([loading, chartCtx]) => {
            if (!loading && chartCtx) {
                drawChart(chartCtx);
            }
        }, { immediate: true });

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
    max-width: 10rem;
    max-height: 3.5rem;
}
</style>
