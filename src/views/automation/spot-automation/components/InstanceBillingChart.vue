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
                <span class="text">{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.INSTANCE_COUNT') }}</span>
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
import {
    find,
    forEach, range, debounce,
} from 'lodash';
import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import {
    computed, reactive, toRefs, watch, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import {
    PChartLoader, PSkeleton,
} from '@spaceone/design-system';

import {
    gray, peacock, secondary, primary1,
} from '@/styles/colors';
import { SpaceConnector } from '@/lib/space-connector';

am4core.useTheme(am4themes_animated);
am4core.options.autoSetClassName = true;
am4core.options.classNamePrefix = 'InstanceBillingChart';


interface ChartData {
    date: string;
    normalCost: number | null;
    savingResult: number | null;
    instance: number | null;
    lineBulletText?: string | number;
    barBulletText?: string | number;
}

const PERIOD = 6;
const COLORS = {
    normalCost: secondary,
    savingResult: peacock[300],
    instance: primary1,
};

export default {
    name: 'InstanceBillingChart',
    components: {
        PChartLoader,
        PSkeleton,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: true,
            legends: computed(() => ([
                {
                    label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.ON_DEMAND_ESTIMATED_COST'),
                    color: COLORS.normalCost,
                },
                {
                    label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.SPOT_SAVINGS_COST'),
                    color: COLORS.savingResult,
                },
            ])),
            chartRef: null as HTMLElement | null,
            chart: null as null | any,
            chartRegistry: {},
            data: [] as ChartData[],
        });

        /* util */
        const disposeChart = (ctx) => {
            if (state.chartRegistry[ctx]) {
                state.chartRegistry[ctx].dispose();
                delete state.chartRegistry[ctx];
            }
        };
        const drawChart = debounce((ctx) => {
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
            chart.data = state.data;

            const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            dateAxis.dataFields.category = 'date';
            dateAxis.renderer.minGridDistance = 40;
            dateAxis.renderer.grid.template.disabled = true;
            dateAxis.renderer.labels.template.fill = am4core.color(gray[400]);
            dateAxis.tooltip.disabled = true;
            dateAxis.fontSize = 11;

            const setTooltipStyle = (tooltip, color) => {
                tooltip.pointerOrientation = 'down';
                tooltip.fontSize = 14;
                tooltip.strokeWidth = 0;
                tooltip.dy = -5;
                tooltip.getFillFromObject = false;
                tooltip.label.fill = am4core.color(color);
                tooltip.background.stroke = am4core.color(color);
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
                    return label;
                });
                return valueAxis;
            };
            const createBarSeries = (field) => {
                const series = chart.series.push(new am4charts.ColumnSeries());
                series.dataFields.categoryX = 'date';
                series.dataFields.valueY = field;
                series.fill = am4core.color(COLORS[field]);
                series.stacked = true;
                series.strokeWidth = 0;
                series.columns.template.width = am4core.percent(10);
                series.columns.template.tooltipHTML = '{barBulletText}';
                series.stroke = am4core.color(COLORS.normalCost);
                series.strokeWidth = 2;
                setTooltipStyle(series.tooltip, COLORS.savingResult);
            };
            const costAxisName = vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.COST');
            const instanceAxisName = vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.INSTANCE');
            createValueAxis(costAxisName);
            createBarSeries('normalCost');
            createBarSeries('savingResult');

            // create line series
            const lineValueAxis = createValueAxis(instanceAxisName, true);
            const lineSeries = chart.series.push(new am4charts.LineSeries());
            lineSeries.dataFields.categoryX = 'date';
            lineSeries.dataFields.valueY = 'instance';
            lineSeries.stroke = am4core.color(COLORS.instance);
            lineSeries.fill = am4core.color(COLORS.instance);
            lineSeries.strokeWidth = 2;
            lineSeries.strokeDasharray = '2, 2';
            lineSeries.fillOpacity = 1;
            lineSeries.bulletsContainer.parent = chart.seriesContainer;
            lineSeries.yAxis = lineValueAxis;
            setTooltipStyle(lineSeries.tooltip, COLORS.instance);

            const circleBullet = lineSeries.bullets.push(new am4charts.CircleBullet());
            circleBullet.circle.radius = 3;
            circleBullet.circle.stroke = am4core.color('white');
            circleBullet.circle.strokeWidth = 2;
            circleBullet.tooltipText = '{instance}';

            const labelBullet = lineSeries.bullets.push(new am4charts.LabelBullet());
            labelBullet.label.text = '{lineBulletText}';
            labelBullet.label.fontSize = 14;
            labelBullet.label.truncate = false;
            labelBullet.label.hideOversized = false;
            labelBullet.label.fill = am4core.color(COLORS.instance);
            labelBullet.label.dy = -12;

            const fillModifier = new am4core.LinearGradientModifier();
            fillModifier.opacities = [0.1, 0];
            fillModifier.offsets = [0, 0.5];
            fillModifier.gradient.rotation = 90;
            lineSeries.segments.template.fillModifier = fillModifier;
        }, 300);
        const setChartData = (rawData) => {
            const data = [] as ChartData[];
            let maxInstance = 0;

            forEach(range(0, PERIOD), (i) => {
                const currentDate = dayjs.utc().subtract(i, 'month');
                const currentData = find(rawData, { date: currentDate.format('YYYY-MM') });
                let formattedDate = currentDate.format('MMM');
                if (['1', '12'].includes(currentDate.format('M'))) {
                    formattedDate = currentDate.format('MMM, YY');
                }

                if (currentData) {
                    const normalCost = currentData.normal_cost;
                    const savingResult = currentData.saving_result;
                    const instance = currentData.instance_count;
                    const savingPercentage = Math.round((savingResult / normalCost) * 100);

                    //
                    const totalCost = normalCost - savingResult;

                    let lineBulletText;
                    if (i === 0 || i === PERIOD - 1) lineBulletText = instance;
                    if (instance > maxInstance) maxInstance = instance;
                    const barBulletText = `
<span style="color: ${COLORS.normalCost}; line-height: 1.5">
${vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.TOOLTIP_ON_DEMAND_ESTIMATED_COST')}: <strong>$${normalCost}</strong>
</span>
<br>
<span style="color: ${peacock[400]}; line-height: 1.5">
${vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.BILLING.TOOLTIP_SAVING_COST')}: <strong>$${savingResult} (${savingPercentage}%)</strong>
</span>
`;

                    data.push({
                        date: formattedDate,
                        normalCost: totalCost,
                        savingResult,
                        instance,
                        lineBulletText,
                        barBulletText,
                    });
                } else {
                    data.push({
                        date: currentDate.format('MMM, YY'),
                        normalCost: null,
                        savingResult: null,
                        instance: null,
                    });
                }
            });
            data.forEach((d) => {
                if (d.instance === maxInstance) d.lineBulletText = d.instance;
            });

            state.data = data.reverse();
        };

        /* api */
        const getBillingHistory = debounce(async () => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupSavingCostHistory({
                    start: dayjs.utc().subtract(PERIOD - 1, 'month').format('YYYY-MM'),
                    end: dayjs.utc().format('YYYY-MM'),
                });
                setChartData(res.results);
            } catch (e) {
                console.error(e);
            }
        }, 300);


        (async () => {
            state.loading = true;
            await getBillingHistory();
            state.loading = false;
        })();

        watch([() => state.data, () => state.chartRef], ([chartData, chartCtx]) => {
            if (state.data.length > 0 && chartCtx) {
                drawChart(chartCtx);
            }
        }, { immediate: false });

        return {
            ...toRefs(state),
        };
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
        .p-chart-loader {
            height: 13rem;
        }
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
