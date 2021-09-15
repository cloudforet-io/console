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
import dayjs from 'dayjs';
import { forEach, range } from 'lodash';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { red } from '@/styles/colors';
import config from '@/lib/config';

interface InterruptChartData {
    date: string;
    value: number;
}

export default {
    name: 'SpotInterruptChart',
    components: {
        PChartLoader,
    },
    props: {
        interruptData: {
            type: Array,
            default: () => [],
        },
    },
    setup(props) {
        const state = reactive({
            loading: true,
            loaderRef: null,
            chartRef: null as HTMLElement | null,
            chart: null as null | any,
            chartRegistry: {},
            data: [] as InterruptChartData[],
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
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
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
            const interruptData = props.interruptData;

            try {
                const res = interruptData.map(d => ({
                    date: d.date,
                    value: d.count,
                }));
                forEach(range(0, 7), (i) => {
                    const targetDate = dayjs.utc().subtract(i, 'day');
                    const existData = res.find(d => d.date === targetDate.format('YYYY-MM-DD'));
                    if (existData) {
                        state.data.push({
                            date: existData.date,
                            value: existData.value,
                        });
                    } else {
                        const now = dayjs();
                        state.data.push({
                            date: now.format('YYYY-MM-DD'),
                            value: 0,
                        });
                    }
                });
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
