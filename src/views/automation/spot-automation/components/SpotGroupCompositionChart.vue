<template>
    <div class="spot-group-composition-chart" :class="chartType">
        <div class="wrapper">
            <div class="text-wrapper on-demand">
                <p>온디맨드</p>
                <p><b>60</b>%</p>
                <template v-if="chartType === CHART_TYPE.long">
                    <br>
                    <p>온디맨드 전체 비용</p>
                    <p>$<b>210.89</b></p>
                </template>
            </div>
            <p-chart-loader class="" :loading="loading">
                <div ref="chartRef" class="chart" />
            </p-chart-loader>
            <div class="text-wrapper spot">
                <p>스팟</p>
                <p><b>40</b>%</p>
                <template v-if="chartType === CHART_TYPE.long">
                    <br>
                    <p>실제 스팟 전체 비용</p>
                    <p>$<b>345.00</b></p>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import { reactive, toRefs, watch } from '@vue/composition-api';

import { PChartLoader } from '@spaceone/design-system';
import {
    gray, peacock, secondary, white,
} from '@/styles/colors';


am4core.useTheme(am4themes_animated);

interface ChartData {
    type: string;
    count: number;
    color: string;
}

enum CHART_TYPE {
    long = 'long',
    short = 'short'
}

export default {
    name: 'SpotGroupCompositionChart',
    components: {
        PChartLoader,
    },
    props: {
        chartType: {
            type: String,
            default: 'long',
        },
    },
    setup(props) {
        const state = reactive({
            loading: false,
            chartRef: null as HTMLElement | null,
            chart: null, // as null | any,
            chartRegistry: {},
            data: [] as ChartData[],
            colors: {
                onDemand: secondary,
                spot: peacock[400],
            },
        });

        /* util */
        const disposeChart = (ctx) => {
            if (state.chartRegistry[ctx]) {
                state.chartRegistry[ctx].dispose();
                delete state.chartRegistry[ctx];
            }
        };
        const drawChart = (ctx) => {
            const createChart = () => {
                disposeChart(ctx);
                state.chartRegistry[ctx] = am4core.create(ctx, am4charts.PieChart);
                return state.chartRegistry[ctx];
            };
            const chart = createChart();
            state.chart = chart;
            chart.logo.disabled = true;
            chart.responsive.enabled = true;

            if (props.chartType === CHART_TYPE.long) {
                chart.radius = am4core.percent(70);
                chart.innerRadius = am4core.percent(45);
            } else {
                chart.innerRadius = am4core.percent(55);
            }

            chart.data = state.data;

            const series = chart.series.create();
            series.slices.template.togglable = false;
            series.slices.template.clickable = false;
            series.dataFields.value = 'count';
            series.dataFields.category = 'type';
            series.slices.template.fill = am4core.color(gray[400]);
            series.slices.template.propertyFields.fill = 'color';
            series.slices.template.stroke = am4core.color(white);
            series.slices.template.strokeWidth = 2;
            series.slices.template.strokeOpacity = 1;
            series.slices.template.states.getKey('hover').properties.scale = 1;
            series.tooltip.disabled = true;
            series.ticks.template.disabled = true;
            series.labels.template.text = '';

            state.chart = chart;
        };

        /* api */
        const getData = async () => {
            state.data = [
                {
                    type: 'spot',
                    count: 4,
                    color: state.colors.spot,
                },
                {
                    type: 'onDemand',
                    count: 6,
                    color: state.colors.onDemand,
                },
            ];
        };

        const init = () => {
            getData();
        };
        init();

        watch([() => state.loading, () => state.chartRef], ([loading, chartCtx]) => {
            if (!loading && chartCtx) {
                drawChart(chartCtx);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            CHART_TYPE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.spot-group-composition-chart {
    @apply bg-secondary2;
    display: flex;
    width: 100%;
    height: 5.5rem;
    font-size: 0.875rem;
    border-radius: 0.375rem;

    .wrapper {
        display: flex;
        margin: auto;
        .text-wrapper {
            padding: 0 0.5rem;
            margin: auto 0;
            &.on-demand {
                @apply text-secondary;
                text-align: right;
            }
            &.spot {
                @apply text-peacock-400;
            }
        }
        .p-chart-loader {
            margin: auto 0;
            .chart {
                max-width: 4rem;
                max-height: 4rem;
            }
        }
    }

    &.long {
        height: auto;
        font-size: 0.75rem;
        padding: 1rem 0.5rem;
        .text-wrapper {
            padding: 0 0.25rem;
        }
    }
}
</style>
