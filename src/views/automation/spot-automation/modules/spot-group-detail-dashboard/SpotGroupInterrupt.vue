<template>
    <div class="spot-group-interrupt">
        <!-- interrupt count-->
        <section class="title-section">
            <span class="title">인터럽트 개수</span>
            <span class="sub-title">(2021년 2월 9일, 지난 14일)</span>
            <div class="title-right">
                <p-button v-for="(d, idx) in dateTypes"
                          :key="idx"
                          class="date-button sm"
                          :class="{'selected': selectedDateType === d.name}"
                          @click="onClickDateTypeButton(d.name)"
                >
                    <span>{{ d.label }}</span>
                </p-button>
            </div>
        </section>
        <section class="chart-section">
            <div class="legend-wrapper">
                <div class="left-part">
                    <span v-for="legend in legends" :key="legend.label" class="legend">
                        <span class="circle" :style="{ 'background-color': legend.color }" />
                        <span>{{ legend.label }}</span>
                    </span>
                </div>
                <div class="right-part">
                    <span class="line" />
                    <span class="text">인터럽트 개수</span>
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
        <!-- interrupt list-->
        <section class="title-section mt-4">
            <span class="title">인터럽트 내역</span>
            <span class="sub-title">(최근날짜)</span>
            <div class="title-right">
                <p-icon-button name="ic_refresh" class="refresh-btn"
                               @click="onClickRefresh"
                />
            </div>
        </section>
        <section class="table-section">
            <p-data-table
                :loading="tableLoading"
                :fields="fields"
                :items="tableData"
                :bordered="false"
            />
        </section>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import {
    PButton, PChartLoader, PSkeleton, PIconButton, PDataTable,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    secondary, peacock, gray, alert, blue,
} from '@/styles/colors';
import { range, random, forEach } from 'lodash';


dayjs.extend(utc);
am4core.useTheme(am4themes_animated);

interface ChartData {
    date: string;
    onDemand: number;
    spot: number;
    interrupt: number;
    bulletText?: string | number;
}

enum DATE_TYPE {
    daily = 'DAILY',
    monthly = 'MONTHLY',
}

const DAY_COUNT = 14;
const MONTH_COUNT = 12;

export default {
    name: 'SpotGroupInterrupt',
    components: {
        PButton,
        PChartLoader,
        PSkeleton,
        PIconButton,
        PDataTable,
    },
    setup() {
        const state = reactive({
            loading: false,
            legends: computed(() => ([
                {
                    label: '온디맨드',
                    color: blue[500],
                },
                {
                    label: '스팟',
                    color: peacock[400],
                },
            ])),
            colors: {
                onDemand: secondary,
                spot: peacock[400],
                interrupt: alert,
            },
            dateTypes: computed(() => ([
                { name: DATE_TYPE.daily, label: '일' },
                { name: DATE_TYPE.monthly, label: '월' },
            ])),
            selectedDateType: DATE_TYPE.daily,
            //
            chartRef: null as HTMLElement | null,
            chart: null as null | any,
            chartRegistry: {},
            chartData: [] as ChartData[],
            //
            tableLoading: false,
            fields: computed(() => [
                { name: 'affected_instance', label: '영향받은 인스턴스' },
                { name: 'date', label: '날짜' },
                { name: 'transition_time', label: '전환 시간' },
            ]),
            tableData: [],
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
            chart.paddingBottom = 0;
            chart.paddingTop = 16;
            chart.data = state.chartData;

            const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            dateAxis.dataFields.category = 'date';
            dateAxis.renderer.minGridDistance = 40;
            dateAxis.renderer.grid.template.disabled = true;
            dateAxis.renderer.labels.template.fill = am4core.color(gray[400]);
            dateAxis.tooltip.disabled = true;
            dateAxis.fontSize = 11;

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.minGridDistance = 30;
            valueAxis.renderer.baseGrid.disabled = true;
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.labels.template.fill = am4core.color(gray[400]);
            valueAxis.tooltip.disabled = true;
            valueAxis.fontSize = 11;
            valueAxis.extraMax = 0.15;
            valueAxis.min = 0;

            const setTooltipStyle = (tooltip, field) => {
                tooltip.pointerOrientation = 'down';
                tooltip.fontSize = 14;
                tooltip.strokeWidth = 0;
                tooltip.dy = -5;
                tooltip.getFillFromObject = false;
                tooltip.label.fill = am4core.color(state.colors[field]);
                tooltip.background.stroke = am4core.color(state.colors[field]);
            };
            const createBarSeries = (field) => {
                const series = chart.series.push(new am4charts.ColumnSeries());
                series.dataFields.categoryX = 'date';
                series.dataFields.valueY = field;
                series.fill = am4core.color(state.colors[field]);
                series.stacked = true;
                series.strokeWidth = 0;
                series.columns.template.width = am4core.percent(15);
                series.columns.template.tooltipText = `\${${field}}`;
                setTooltipStyle(series.tooltip, field);
            };
            createBarSeries('onDemand');
            createBarSeries('spot');

            // create line series
            const lineSeries = chart.series.push(new am4charts.LineSeries());
            lineSeries.dataFields.categoryX = 'date';
            lineSeries.dataFields.valueY = 'interrupt';
            lineSeries.stroke = am4core.color(state.colors.interrupt);
            lineSeries.fill = am4core.color(state.colors.interrupt);
            lineSeries.strokeWidth = 2;
            lineSeries.strokeDasharray = '2, 2';
            lineSeries.fillOpacity = 1;
            lineSeries.bulletsContainer.parent = chart.seriesContainer;
            setTooltipStyle(lineSeries.tooltip, 'interrupt');

            const circleBullet = lineSeries.bullets.push(new am4charts.CircleBullet());
            circleBullet.circle.radius = 3;
            circleBullet.circle.stroke = am4core.color('white');
            circleBullet.circle.strokeWidth = 2;
            circleBullet.tooltipText = '{interrupt}';

            const labelBullet = lineSeries.bullets.push(new am4charts.LabelBullet());
            labelBullet.label.text = '{bulletText}';
            labelBullet.label.fontSize = 14;
            labelBullet.label.truncate = false;
            labelBullet.label.hideOversized = false;
            labelBullet.label.fill = am4core.color(state.colors.interrupt);
            labelBullet.label.dy = -12;

            const fillModifier = new am4core.LinearGradientModifier();
            fillModifier.opacities = [0.3, 0];
            fillModifier.offsets = [0, 0.5];
            fillModifier.gradient.rotation = 90;
            lineSeries.segments.template.fillModifier = fillModifier;
        };

        /* api */
        const getChartData = async () => {
            const dateUnit = state.selectedDateType === DATE_TYPE.monthly ? 'month' : 'day';
            const dateCount = state.selectedDateType === DATE_TYPE.monthly ? MONTH_COUNT : DAY_COUNT;
            const dateFormat = state.selectedDateType === DATE_TYPE.monthly ? 'MMM' : 'MM/DD';
            const data = [] as ChartData[];
            let maxInterrupt = 0;
            // api 값 가져오고 비어있으면 더미데이터
            forEach(range(0, dateCount), (i) => {
                let bulletText;
                const date = dayjs.utc().subtract(i, dateUnit);
                let formattedDate = date.format(dateFormat);
                const onDemand = random(50, 100);
                const spot = random(10, 100);
                const interrupt = random(1, 10);

                if (state.selectedDateType === DATE_TYPE.monthly && (date.format('M') === '1' || date.format('M') === '12')) {
                    formattedDate = date.format('MMM, YY');
                }
                if (i === 0 || i === dateCount - 1) {
                    bulletText = interrupt;
                }
                if (interrupt > maxInterrupt) maxInterrupt = interrupt;

                data.push({
                    date: formattedDate,
                    onDemand,
                    spot,
                    interrupt,
                    bulletText,
                });
            });
            data.forEach((d) => {
                if (d.interrupt === maxInterrupt) d.bulletText = d.interrupt;
            });

            state.chartData = data.reverse();
        };

        /* event */
        const onClickDateTypeButton = (type) => {
            state.selectedDateType = type;
        };
        const onClickRefresh = () => {
            console.log('refresh!');
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
        watch(() => state.selectedDateType, async () => {
            await getChartData();
            drawChart(state.chartRef);
        }, { immediate: false });

        return {
            ...toRefs(state),
            onClickDateTypeButton,
            onClickRefresh,
        };
    },
};
</script>

<style lang="postcss" scoped>
.spot-group-interrupt {
    @apply border border-gray-200;
    padding: 1rem;
    .title-section {
        position: relative;
        display: inline-block;
        width: 100%;
        margin-bottom: 0.5rem;
        .title {
            @apply text-gray-900;
            font-size: 1rem;
            font-weight: bold;
            line-height: 1.6;
        }
        .sub-title {
            @apply text-gray-500;
            font-size: 0.75rem;
            line-height: 1.5;
            margin-left: 0.25rem;
        }
        .title-right {
            position: absolute;
            right: 0;
            top: 0;
            margin-top: 0.125rem;
            .date-button {
                @apply border border-gray-200 text-gray-300;
                min-width: auto;
                height: 1.25rem;
                line-height: 1.6;
                font-size: 0.75rem;
                font-weight: normal;
                border-radius: 0.125rem;
                padding: 0 0.5rem;
                margin-left: 0.375rem;
                &.selected {
                    @apply bg-gray-600 border-gray-600 text-white;
                }
            }
        }
    }
    .chart-section {
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
                    @apply text-alert;
                    display: inline-block;
                    width: 1.5rem;
                    border-top: 0.125rem dotted;
                    padding-bottom: 0.25rem;
                    margin-right: 0.25rem;
                }
                .text {
                    @apply text-alert;
                    font-size: 0.75rem;
                    line-height: 1.5;
                }
            }
        }
        .chart-wrapper {
            .chart {
                height: 10rem;
            }
        }
    }
    .table-section {
        .p-data-table::v-deep {
            min-height: 6.25rem;
            border-radius: 0.125rem;
            th {
                @apply bg-gray-100 text-gray-400;
                height: 1.5rem;
                border: none;
                font-size: 0.75rem;
            }
            td {
                height: 2rem;
            }
        }
    }
}
</style>
