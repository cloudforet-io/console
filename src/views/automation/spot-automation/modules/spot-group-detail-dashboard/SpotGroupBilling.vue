<template>
    <div class="spot-group-billing">
        <p v-if="showTitle" class="title">
            비용
        </p>
        <div class="widget-wrapper grid gap-4">
            <section class="billing-summary-section widget-layout">
                <div class="summary-wrapper">
                    <div class="summary-row">
                        <span class="title">사용중인 스팟그룹</span>
                        <span class="count">13</span>
                    </div>
                    <div class="summary-row">
                        <span class="title">전체 인스턴스</span>
                        <span class="sub-title">(온디맨드+스팟)</span>
                        <span class="count">159</span>
                    </div>
                    <div class="summary-row">
                        <span class="title">스팟 인스턴스</span>
                        <span class="count">128</span>
                    </div>
                </div>
                <div class="chart-section">
                    <spot-group-composition-chart />
                </div>
            </section>
            <section class="billing-chart-section widget-layout">
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
            </section>
            <section class="billing-figure-section widget-layout">
                <div class="figure-wrapper">
                    <p class="title">
                        <span>지난 달</span>
                        <strong> 절감 비용</strong>
                        <span class="percentage">
                            <p-i name="ic_table_sort_fromA" />
                            52%
                        </span>
                    </p>
                    <p class="cost">
                        ${{ commaFormatter(numberFormatter(lastMonthSavingCost)) }}
                    </p>
                </div>
                <div class="figure-wrapper">
                    <p class="title">
                        <strong>누적 절감 비용</strong>
                    </p>
                    <p class="cost">
                        ${{ commaFormatter(numberFormatter(cumulativeSavingCost)) }}
                    </p>
                </div>
            </section>
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

import {
    PChartLoader, PSkeleton, PI,
} from '@spaceone/design-system';
import SpotGroupCompositionChart
    from '@/views/automation/spot-automation/components/SpotGroupCompositionChart.vue';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    blue, gray, peacock, secondary, primary1,
} from '@/styles/colors';


am4core.useTheme(am4themes_animated);
am4core.options.autoSetClassName = true;
am4core.options.classNamePrefix = 'SpotGroupBilling';

interface ChartData {
    date: string;
    onDemand: number | null;
    spot: number | null;
    instance: number | null;
    bulletText?: string | number;
}

const MONTH_COUNT = 6;

export default {
    name: 'SpotGroupBilling',
    components: {
        SpotGroupCompositionChart,
        PChartLoader,
        PSkeleton,
        PI,
    },
    props: {
        showTitle: {
            type: Boolean,
            default: false,
        },
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
            data: [],
            //
            chartRef: null as HTMLElement | null,
            chart: null as null | any,
            chartRegistry: {},
            chartData: [] as ChartData[],
            //
            lastMonthSavingCost: 1207.36234234,
            cumulativeSavingCost: 5690.23343,
        });

        /* util */
        const numberFormatter = (num) => {
            if (Math.abs(num) < 10000) {
                return Math.round(num * 100) / 100;
            }
            const options = { notation: 'compact', signDisplay: 'auto', maximumFractionDigits: 1 };
            return Intl.NumberFormat('en', options).format(num);
        };
        const commaFormatter = (num) => {
            if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return num;
        };
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
            numberFormatter,
            commaFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.spot-group-billing {
    .title {
        font-size: 1.5rem;
        line-height: 1.6;
        margin: 0.5rem 0;
    }
    .widget-wrapper {
        @apply grid-cols-12;

        @screen lg {
            grid-template-rows: auto;
            grid-template-columns: minmax(14.25rem, 3fr) minmax(auto, 6fr) minmax(14.25rem, 3fr);
            grid-template-areas: "summary chart figure";
        }

        .widget-layout {
            @apply border border-gray-200 bg-white;
            padding: 1rem;
        }
    }

    .billing-summary-section {
        @apply col-span-12 row-start-1;

        @screen md {
            @apply col-span-6;
        }

        @screen lg {
            grid-area: summary;
        }

        .summary-wrapper {
            margin-bottom: 1rem;
            .summary-row {
                font-size: 0.875rem;
                line-height: 1.5;
                margin-bottom: 0.5rem;
                &:last-child {
                    margin-bottom: 0;
                }
                .title {
                    @apply text-gray-600;
                    font-size: 0.875rem;
                    margin: 0;
                }
                .sub-title {
                    @apply text-gray-400;
                    font-size: 0.75rem;
                    margin-left: 0.125rem;
                }
                .count {
                    font-weight: bold;
                    margin-left: 0.5rem;
                }
            }
        }
    }
    .billing-chart-section {
        @apply col-span-12 row-start-3;

        @screen md {
            @apply col-span-12 row-start-2;
        }

        @screen lg {
            @apply row-start-1;
            grid-area: chart;
        }

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
    .billing-figure-section {
        @apply col-span-12 row-start-2;

        @screen md {
            @apply col-span-6 row-start-1;
        }

        @screen lg {
            @apply row-start-1;
            grid-area: figure;
        }

        .figure-wrapper {
            margin-bottom: 1.25rem;
            .title {
                @apply text-gray-500;
                font-size: 0.875rem;
                line-height: 1.5;
                margin: 0;
                strong {
                    @apply text-gray-dark;
                }
                .percentage {
                    margin-left: 0.375rem;
                    .p-i-icon {
                        margin-right: -0.25rem;
                    }
                }
            }
            .cost {
                @apply text-indigo-500;
                font-size: 1.375rem;
                line-height: 1.45;
            }
        }
    }
}
</style>
<style lang="postcss">
.SpotGroupBillingLabel {
    text-shadow: 2px 0 white, -2px 0 white, 0 2px white, 0 -2px white, 1px 1px white, -1px -1px white, -1px 1px white, 1px -1px white;
}
</style>
