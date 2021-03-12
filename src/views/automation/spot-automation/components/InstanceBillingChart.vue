<template>
    <div class="instance-billing-chart">
        <div class="legend-wrapper">
            <div class="left-part">
                <span v-for="legend in legends" :key="legend.label" class="legend">
                    <span class="circle" :style="{ 'background-color': legend.color }" />
                    <span>{{ legend.label }}</span>
                </span>
            </div>
            <div class="right-part">
                <span class="line" />
                <span class="text">인스턴스 개수</span>
            </div>
        </div>
        <div class="chart-wrapper">
            <p-chart-loader :loading="loading">
                <template #loader>
                    <p-skeleton height="100%" />
                </template>
                <div ref="chartRef" class="chart" />
            </p-chart-loader>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { forEach, random, range } from 'lodash';
import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import { computed, reactive, toRefs, watch } from '@vue/composition-api';
import {
    PChartLoader, PSkeleton,
} from '@spaceone/design-system';

import {
    blue, gray, peacock, secondary, primary1,
} from '@/styles/colors';

am4core.useTheme(am4themes_animated);
am4core.options.autoSetClassName = true;
am4core.options.classNamePrefix = 'InstanceBillingChart';


interface ChartData {
    date: string;
    onDemand: number | null;
    spot: number | null;
    instance: number | null;
    bulletText?: string | number;
}

const MONTH_COUNT = 6;

export default {
    name: 'InstanceBillingChart',
    components: {
        PChartLoader,
        PSkeleton,
    },
    setup() {
        const state = reactive({
            loading: false,
            legends: computed(() => ([
                {
                    label: '온디맨드 비용',
                    color: blue[500],
                },
                {
                    label: '스팟 비용',
                    color: peacock[400],
                },
            ])),
            colors: {
                onDemand: secondary,
                spot: peacock[400],
                instance: primary1,
            },
            chartRef: null as HTMLElement | null,
            chart: null as null | any,
            chartRegistry: {},
            chartData: [] as ChartData[],
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
                state.chartRegistry[ctx] = am4core.create(ctx, am4charts.XYChart);
                return state.chartRegistry[ctx];
            };
            const chart = createChart();
            state.chart = chart;

            chart.logo.disabled = true;
            chart.paddingLeft = -8;
            chart.paddingRight = 0;
            chart.paddingBottom = 0;
            chart.paddingTop = 24;
            chart.data = state.chartData;

            const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            dateAxis.dataFields.category = 'date';
            dateAxis.renderer.minGridDistance = 40;
            dateAxis.renderer.grid.template.disabled = true;
            dateAxis.renderer.labels.template.fill = am4core.color(gray[400]);
            dateAxis.tooltip.disabled = true;
            dateAxis.fontSize = 11;

            const setTooltipStyle = (tooltip, field) => {
                tooltip.pointerOrientation = 'down';
                tooltip.fontSize = 14;
                tooltip.strokeWidth = 0;
                tooltip.dy = -5;
                tooltip.getFillFromObject = false;
                tooltip.label.fill = am4core.color(state.colors[field]);
                tooltip.background.stroke = am4core.color(state.colors[field]);
            };
            const createValueAxis = (axisName, opposite = false) => {
                const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
                valueAxis.renderer.minGridDistance = 50;
                valueAxis.renderer.baseGrid.disabled = true;
                valueAxis.renderer.grid.template.strokeOpacity = 1;
                valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
                valueAxis.renderer.labels.template.fill = am4core.color(gray[400]);
                valueAxis.tooltip.disabled = true;
                valueAxis.fontSize = 11;
                valueAxis.extraMax = 0.15;
                valueAxis.min = 0;
                valueAxis.renderer.opposite = opposite;
                valueAxis.renderer.labels.template.adapter.add('text', (label, target) => {
                    if (target.dataItem && (target.dataItem.value === 0)) return axisName;
                    if (axisName === '비용') return `$${label}`;
                    return label;
                });
                return valueAxis;
            };
            const createBarSeries = (field) => {
                const series = chart.series.push(new am4charts.ColumnSeries());
                series.dataFields.categoryX = 'date';
                series.dataFields.valueY = field;
                series.fill = am4core.color(state.colors[field]);
                series.stacked = true;
                series.strokeWidth = 0;
                series.columns.template.width = am4core.percent(10);
                series.columns.template.tooltipText = `\${${field}}`;
                setTooltipStyle(series.tooltip, field);
            };
            createValueAxis('비용');
            createBarSeries('onDemand');
            createBarSeries('spot');

            // create line series
            const lineValueAxis = createValueAxis('인스턴스', true);
            const lineSeries = chart.series.push(new am4charts.LineSeries());
            lineSeries.dataFields.categoryX = 'date';
            lineSeries.dataFields.valueY = 'instance';
            lineSeries.stroke = am4core.color(state.colors.instance);
            lineSeries.fill = am4core.color(state.colors.instance);
            lineSeries.strokeWidth = 2;
            lineSeries.strokeDasharray = '2, 2';
            lineSeries.fillOpacity = 1;
            lineSeries.bulletsContainer.parent = chart.seriesContainer;
            lineSeries.yAxis = lineValueAxis;
            setTooltipStyle(lineSeries.tooltip, 'instance');

            const circleBullet = lineSeries.bullets.push(new am4charts.CircleBullet());
            circleBullet.circle.radius = 3;
            circleBullet.circle.stroke = am4core.color('white');
            circleBullet.circle.strokeWidth = 2;
            circleBullet.tooltipText = '{instance}';

            const labelBullet = lineSeries.bullets.push(new am4charts.LabelBullet());
            labelBullet.label.text = '{bulletText}';
            labelBullet.label.fontSize = 14;
            labelBullet.label.truncate = false;
            labelBullet.label.hideOversized = false;
            labelBullet.label.fill = am4core.color(state.colors.instance);
            labelBullet.label.dy = -12;

            const fillModifier = new am4core.LinearGradientModifier();
            fillModifier.opacities = [0.1, 0];
            fillModifier.offsets = [0, 0.5];
            fillModifier.gradient.rotation = 90;
            lineSeries.segments.template.fillModifier = fillModifier;
        };

        /* api */
        const getChartData = async () => {
            const data = [] as ChartData[];
            let maxInstance = 0;
            forEach(range(0, MONTH_COUNT), (i) => {
                let bulletText;
                const date = dayjs.utc().subtract(i, 'month');
                let formattedDate = date.format('MMM');

                const onDemand = random(50, 100);
                const spot = random(10, 100);
                const instance = random(1, 300);
                if (date.format('M') === '1' || date.format('M') === '12') {
                    formattedDate = date.format('MMM, YY');
                }
                if (i === 0 || i === MONTH_COUNT - 1) {
                    bulletText = instance;
                }
                if (instance > maxInstance) maxInstance = instance;

                data.push({
                    date: formattedDate,
                    onDemand,
                    spot,
                    instance,
                    bulletText,
                });
            });
            data.forEach((d) => {
                if (d.instance === maxInstance) d.bulletText = d.instance;
            });

            state.chartData = data.reverse();
        };

        const init = async () => {
            state.loading = true;
            await getChartData();
            state.loading = false;
        };
        init();

        watch([() => state.loading, () => state.chartRef], ([loading, chartCtx]) => {
            if (!loading && chartCtx) {
                drawChart(chartCtx);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
        }
    },
};
</script>

<style lang="postcss" scoped>
.instance-billing-chart {
    .legend-wrapper {
        .left-part {
            display: inline-block;
            .legend {
                @apply text-gray-500;
                font-size: 0.75rem;
                line-height: 1.5;
                padding-right: 1rem;
            }
            .circle {
                display: inline-block;
                width: 0.5rem;
                height: 0.5rem;
                border-radius: 50%;
                margin-right: 0.25rem;
            }
        }
        .right-part {
            display: inline-block;
            float: right;
            .line {
                @apply text-primary1;
                display: inline-block;
                width: 1.5rem;
                border-top: 0.125rem dotted;
                padding-bottom: 0.25rem;
                margin-right: 0.25rem;
            }
            .text {
                @apply text-primary1;
                font-size: 0.75rem;
                line-height: 1.5;
            }
        }
    }
    .chart-wrapper {
        .chart {
            height: 13rem;
        }
    }
}
</style>
<style lang="postcss">
.InstanceBillingChartLabel {
    text-shadow: 2px 0 white, -2px 0 white, 0 2px white, 0 -2px white, 1px 1px white, -1px -1px white, -1px 1px white, 1px -1px white;
}
</style>
