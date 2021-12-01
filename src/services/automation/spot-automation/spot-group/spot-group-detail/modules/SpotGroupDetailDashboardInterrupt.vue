<template>
    <div class="spot-group-detail-dashboard-interrupt">
        <section class="chart-section">
            <div class="title-wrapper">
                <span class="title">{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.INTERRUPT.INTERRUPT_COUNT') }}</span>
                <span class="sub-title">({{ today }}, {{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.INTERRUPT.LAST_TWO_WEEKS') }})</span>
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
            </div>
            <div class="legend-wrapper">
                <div class="left-part">
                    <span v-for="legend in legends" :key="legend.label" class="legend">
                        <span class="circle" :style="{ 'background-color': legend.color }" />
                        <span>{{ legend.label }}</span>
                    </span>
                </div>
                <div class="right-part">
                    <span class="line" />
                    <span class="text">{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.INTERRUPT.INTERRUPT_COUNT') }}</span>
                </div>
            </div>
            <div class="chart-wrapper">
                <p-chart-loader :loading="chartState.loading">
                    <template #loader>
                        <p-skeleton height="100%" />
                    </template>
                    <div ref="chartRef" class="chart" />
                </p-chart-loader>
            </div>
        </section>
        <section class="table-section">
            <div class="title-wrapper mt-4">
                <span class="title">{{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.INTERRUPT.INTERRUPT_DETAIL') }}</span>
                <span class="sub-title">({{ $t('AUTOMATION.SPOT_AUTOMATION.DETAIL.INTERRUPT.LATEST_DATE') }})</span>
                <div class="title-right">
                    <p-icon-button name="ic_refresh" class="refresh-btn"
                                   @click="onClickRefresh"
                    />
                </div>
            </div>
            <p-data-table
                :loading="tableState.loading"
                :fields="tableState.fields"
                :items="tableState.data"
                :bordered="false"
            />
        </section>
    </div>
</template>

<script lang="ts">
import {
    get, range, forEach, find,
} from 'lodash';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import dayjs from 'dayjs';

import {
    PButton, PChartLoader, PSkeleton, PIconButton, PDataTable,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    secondary, peacock, gray, alert, blue,
} from '@/styles/colors';
import { store } from '@/store';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import config from '@/lib/config';


interface ChartData {
    date: string;
    onDemand: number | null;
    spot: number | null;
    interrupt: number | null;
    bulletText?: string | number;
}
interface TableData {
    type: string;
    availability_zone: string;
    count: number;
}

enum DATE_TYPE {
    DAILY = 'DAILY',
    MONTHLY = 'MONTHLY',
}

const PERIOD = {
    DAILY: 14,
    MONTHLY: 12,
};
const COLORS = {
    onDemand: secondary,
    spot: peacock[400],
    interrupt: alert,
};

export default {
    name: 'SpotGroupDetailDashboardInterrupt',
    components: {
        PButton,
        PChartLoader,
        PSkeleton,
        PIconButton,
        PDataTable,
    },
    props: {
        spotGroupId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            chartRef: null as HTMLElement | null,
            today: dayjs().tz(store.state.user.timezone).format('YYYY-MM-DD'),
            legends: computed(() => ([
                {
                    label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.INTERRUPT.ON_DEMAND'),
                    color: blue[500],
                },
                {
                    label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.INTERRUPT.SPOT'),
                    color: peacock[400],
                },
            ])),
            dateTypes: computed(() => ([
                { name: DATE_TYPE.DAILY, label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.INTERRUPT.DAY') },
                { name: DATE_TYPE.MONTHLY, label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.INTERRUPT.MONTH') },
            ])),
            selectedDateType: DATE_TYPE.DAILY,
        });
        const chartState = reactive({
            loading: true,
            chart: null as null | any,
            registry: {},
            data: [] as ChartData[],
        });
        const tableState = reactive({
            loading: true,
            data: [] as TableData[],
            fields: computed(() => [
                { name: 'type', label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.INTERRUPT.INSTANCE_TYPE') },
                { name: 'availability_zone', label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.INTERRUPT.AZ') },
                { name: 'count', label: vm.$t('AUTOMATION.SPOT_AUTOMATION.DETAIL.INTERRUPT.INTERRUPT_COUNT') },
            ]),
        });

        /* util */
        const disposeChart = (ctx) => {
            if (chartState.registry[ctx]) {
                chartState.registry[ctx].dispose();
                delete chartState.registry[ctx];
            }
        };
        const drawChart = (ctx) => {
            const createChart = () => {
                disposeChart(ctx);
                chartState.registry[ctx] = am4core.create(ctx, am4charts.XYChart);
                return chartState.registry[ctx];
            };
            const chart = createChart();
            chartState.chart = chart;

            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.paddingLeft = -8;
            chart.paddingBottom = 0;
            chart.paddingTop = 16;
            chart.data = chartState.data;

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
                tooltip.label.fill = am4core.color(COLORS[field]);
                tooltip.background.stroke = am4core.color(COLORS[field]);
            };
            const createBarSeries = (field) => {
                const series = chart.series.push(new am4charts.ColumnSeries());
                series.dataFields.categoryX = 'date';
                series.dataFields.valueY = field;
                series.fill = am4core.color(COLORS[field]);
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
            lineSeries.stroke = am4core.color(COLORS.interrupt);
            lineSeries.fill = am4core.color(COLORS.interrupt);
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
            labelBullet.label.fill = am4core.color(COLORS.interrupt);
            labelBullet.label.dy = -12;

            const fillModifier = new am4core.LinearGradientModifier();
            fillModifier.opacities = [0.3, 0];
            fillModifier.offsets = [0, 0.5];
            fillModifier.gradient.rotation = 90;
            lineSeries.segments.template.fillModifier = fillModifier;
        };
        const convertChartData = (interruptData, instanceData) => {
            const rawData = interruptData.map((data, i) => Object.assign({}, data, instanceData[i]));

            const dateUnit = state.selectedDateType === DATE_TYPE.MONTHLY ? 'month' : 'day';
            const dateFormat = state.selectedDateType === DATE_TYPE.MONTHLY ? 'MMM' : 'MM/DD';
            const dateCount = PERIOD[state.selectedDateType];

            const data = [] as ChartData[];
            let maxInterrupt = 0;

            forEach(range(0, dateCount), (i) => {
                const date = dayjs.utc().subtract(i, dateUnit);
                const todayData = find(rawData, { date: date.format(dateUnit === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD') });
                let formattedDate = date.format(dateFormat);
                if (state.selectedDateType === DATE_TYPE.MONTHLY && (date.format('M') === '1' || date.format('M') === '12')) {
                    formattedDate = date.format('MMM, YY');
                }

                if (todayData) {
                    const onDemand = todayData.ondemand;
                    const spot = todayData.spot;
                    const interrupt = todayData.count;

                    let bulletText;
                    if (i === 0 || i === dateCount - 1) bulletText = interrupt;
                    if (interrupt > maxInterrupt) maxInterrupt = interrupt;

                    data.push({
                        date: formattedDate,
                        onDemand,
                        spot,
                        interrupt,
                        bulletText,
                    });
                } else {
                    data.push({
                        date: formattedDate,
                        onDemand: null,
                        spot: null,
                        interrupt: null,
                    });
                }
            });
            data.forEach((d) => {
                if (d.interrupt === maxInterrupt) d.bulletText = d.interrupt;
            });

            chartState.data = data.reverse();
        };

        /* api */
        const getInterruptHistory = async () => {
            try {
                let res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInterruptHistory({
                    spot_groups: [props.spotGroupId],
                    granularity: state.selectedDateType,
                    period: PERIOD[state.selectedDateType],
                });
                res = get(res, `spot_groups.${props.spotGroupId}`);
                return res;
            } catch (e) {
                console.error(e);
                return null;
            }
        };
        const getInstanceHistory = async () => {
            try {
                let res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInstanceCountHistory({
                    spot_groups: [props.spotGroupId],
                    granularity: state.selectedDateType,
                    period: PERIOD[state.selectedDateType],
                });
                res = get(res, `spot_groups.${props.spotGroupId}`);
                return res;
            } catch (e) {
                console.error(e);
                return null;
            }
        };
        const getInterruptSummary = async () => {
            try {
                tableState.loading = true;
                const res = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupInterruptSummary({
                    spot_group_id: props.spotGroupId,
                });
                tableState.data = res.results;
            } catch (e) {
                console.error(e);
            } finally {
                tableState.loading = false;
            }
        };

        /* event */
        const onClickDateTypeButton = (type) => {
            state.selectedDateType = type;
        };
        const onClickRefresh = () => {
            getInterruptSummary();
        };


        watch(() => props.spotGroupId, () => {
            if (props.spotGroupId) {
                getInterruptSummary();
            }
        });
        watch(() => [props.spotGroupId, state.selectedDateType], async () => {
            if (props.spotGroupId) {
                chartState.loading = true;
                await Promise.all([getInterruptHistory(), getInstanceHistory()]).then((values) => {
                    convertChartData(values[0], values[1]);
                });
                chartState.loading = false;
            }
        }, { immediate: false });
        watch([() => chartState.loading, () => state.chartRef], ([loading, chartCtx]) => {
            if (!loading && chartCtx) {
                drawChart(chartCtx);
            }
        }, { immediate: false });

        return {
            ...toRefs(state),
            chartState,
            tableState,
            onClickDateTypeButton,
            onClickRefresh,
        };
    },
};
</script>

<style lang="postcss" scoped>
.spot-group-detail-dashboard-interrupt {
    @apply border border-gray-200;
    padding: 1rem;
    .title-wrapper {
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
                @apply border border-gray-200 text-gray-300 rounded-sm;
                min-width: auto;
                height: 1.25rem;
                line-height: 1.6;
                font-size: 0.75rem;
                font-weight: normal;
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
            .p-chart-loader {
                height: 10rem;
            }
            .chart {
                height: 10rem;
            }
        }
    }
    .table-section {
        .p-data-table::v-deep {
            @apply rounded-sm;
            min-height: 6.25rem;
            th {
                @apply bg-gray-100 text-gray-400;
                height: 1.5rem;
                border: none;
                font-size: 0.75rem;
            }
            td {
                height: 2rem;
            }
            tr {
                &:hover {
                    @apply bg-transparent;
                }
                &:nth-child(even) {
                    td {
                        @apply bg-gray-100;
                    }
                }
            }
            .table-container {
                max-height: 7rem;
            }
        }
    }
}
</style>
