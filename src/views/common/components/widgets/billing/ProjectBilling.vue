<template>
    <div class="project-billing">
        <div class="title">
            <span>{{ $t('COMMON.WIDGETS.BILLING.TITLE') }}</span>
        </div>
        <div class="content-wrapper grid grid-cols-12 gap-2">
            <div class="col-span-12 title">
                <span>{{ $t('COMMON.WIDGETS.BILLING.TREND_TITLE') }}</span>
                <div class="date-button-group">
                    <p-button v-for="(d, idx) in dateTypes"
                              :key="idx"
                              class="date-button"
                              :class="{'selected': selectedDateType === d.name}"
                              @click="selectedDateType = d.name"
                    >
                        {{ d.label }}
                    </p-button>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-9">
                <div class="chart-wrapper">
                    <p-chart-loader :loading="chartState.loading">
                        <template #loader>
                            <p-skeleton width="100%" height="100%" />
                        </template>
                        <div ref="chartRef" class="chart" />
                    </p-chart-loader>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-3">
                <span class="label">Last Month</span>
                <span class="label">Last Month</span>
            </div>
            <div class="col-span-12 detail-wrapper">
                <div class="table-button-wrapper">
                    <span class="text">6 {{ selectedDateType === 'MONTHLY' ? 'months' : 'days' }}</span>
                    <p-icon-button class="text"
                                   name="ic_arrow_left"
                                   color="inherit transparent"
                                   @click="onClickDateButton('prev')"
                    />
                    <p-icon-button class="text"
                                   name="ic_arrow_right"
                                   color="inherit transparent"
                                   :disabled="nextButtonDisabled"
                                   @click="onClickDateButton('next')"
                    />
                </div>
                <p-data-table
                    :loading="tableState.loading"
                    :fields="fields"
                    :items="isCollapsed ? tableData.slice(0, 5) : tableData"
                    :bordered="false"
                >
                    <template #th-service-format>
                        <span />
                    </template>
                    <template #col-service-format="{value}">
                        <span class="col-service">{{ value }}</span>
                    </template>
                </p-data-table>
                <div class="toggle-button-wrapper">
                    <p-collapsible-toggle :is-collapsed.sync="isCollapsed">
                        {{ isCollapsed ? 'show all' : 'hide' }}
                    </p-collapsible-toggle>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    find, forEach, orderBy, range,
} from 'lodash';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PChartLoader, PSkeleton, PButton, PDataTable, PCollapsibleToggle, PIconButton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@/lib/space-connector';
import {
    gray, secondary, secondary1, safe,
} from '@/styles/colors';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
am4core.useTheme(am4themes_animated);


interface ChartData {
    date: string;
    value: number;
    color?: string;
    dash?: string;
}

enum DATE_TYPE {
    daily = 'DAILY',
    monthly = 'MONTHLY',
}
const DAY_COUNT = 14;
const MONTH_COUNT = 12;
const DATA_TABLE_COLUMN = 6;

export default {
    name: 'ProjectBilling',
    components: {
        PChartLoader,
        PSkeleton,
        PButton,
        PDataTable,
        PCollapsibleToggle,
        PIconButton,
    },
    props: {
        projectId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: false,
            chart: null,
            chartRef: null as any, // HTMLElement | null,
            skeletons: range(4),
            dateTypes: computed(() => ([
                { name: DATE_TYPE.daily, label: vm.$t('COMMON.WIDGETS.BILLING.DAY') },
                { name: DATE_TYPE.monthly, label: vm.$t('COMMON.WIDGETS.BILLING.MONTH') },
            ])),
            data: [],
            selectedDateType: DATE_TYPE.monthly,
            // data table
            fields: [] as any,
            tableData: [],
            isCollapsed: true,
            endDate: dayjs().utc(),
            nextButtonDisabled: computed(() => {
                const now = dayjs().utc();
                if (state.selectedDateType === DATE_TYPE.monthly) {
                    return now.isSame(state.endDate, 'month');
                }
                return now.isSame(state.endDate, 'day');
            }),
        });
        const tableState = reactive({
            loading: false,
        })
        const chartState = reactive({
            loading: true,
            registry: {},
            data: [] as ChartData[],
        });

        /* util */
        const commaFormatter = (num) => {
            if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return num;
        };
        const numberFormatter = (num) => {
            if (Math.abs(num) < 10000) {
                return Math.round(num * 10) / 10;
            }
            const options = {
                notation: 'compact',
                signDisplay: 'auto',
                maximumFractionDigits: 1,
            };
            return Intl.NumberFormat('en', options).format(num);
        };
        const disposeChart = () => {
            if (chartState.registry[state.chartRef]) {
                chartState.registry[state.chartRef].dispose();
                delete chartState.registry[state.chartRef];
            }
        };
        const drawChart = () => {
            const createChart = () => {
                disposeChart();
                chartState.registry[state.chartRef] = am4core.create(state.chartRef, am4charts.XYChart);
                return chartState.registry[state.chartRef];
            };
            const chart = createChart();
            chart.logo.disabled = true;
            chart.paddingLeft = -5;
            chart.paddingBottom = 0;
            chart.paddingTop = 10;
            chart.data = chartState.data;

            const dateAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            dateAxis.dataFields.category = 'date';
            dateAxis.tooltip.disabled = true;
            dateAxis.renderer.minGridDistance = 40;
            dateAxis.renderer.labels.template.fill = am4core.color(gray[600]);
            dateAxis.fontSize = 11;

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;
            valueAxis.renderer.minGridDistance = 30;
            valueAxis.renderer.labels.template.fill = am4core.color(secondary);
            valueAxis.renderer.labels.template.adapter.add('text', (text, target) => numberFormatter(target.dataItem.value));
            valueAxis.fontSize = 11;
            valueAxis.extraMax = 0.25;

            const series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.categoryX = 'date';
            series.dataFields.valueY = 'value';
            series.stroke = am4core.color(secondary1);
            series.fill = am4core.color(secondary1);
            series.strokeWidth = 2;
            series.fillOpacity = 1;

            series.propertyFields.fill = 'color';
            series.propertyFields.stroke = 'color';
            series.propertyFields.strokeDasharray = 'dash';

            const fillModifier = new am4core.LinearGradientModifier();
            fillModifier.opacities = [0.3, 0];
            fillModifier.offsets = [0, 0.5];
            fillModifier.gradient.rotation = 90;
            series.segments.template.fillModifier = fillModifier;

            const bullet = series.bullets.push(new am4charts.LabelBullet());
            bullet.label.text = '[bold]{value}';
            bullet.label.fontSize = 12;
            bullet.label.adapter.add('text', (text, target) => `$${numberFormatter(target.dataItem.valueY)}`);
            bullet.label.fill = am4core.color(secondary);
            bullet.label.dy = -15;
            bullet.fillOpacity = 0;
            bullet.strokeOpacity = 0;
            bullet.label.propertyFields.fill = 'bulletColor';
            bullet.label.propertyFields.stroke = 'bulletColor';
            const bulletState = bullet.states.create('hover');
            bulletState.properties.fillOpacity = 1;

            const circleBullet = series.bullets.push(new am4charts.CircleBullet());
            circleBullet.circle.strokeWidth = 0;
            circleBullet.fillOpacity = 0;
            circleBullet.circle.fill = am4core.color(secondary);
            circleBullet.circle.propertyFields.fill = 'bulletColor';
            circleBullet.circle.propertyFields.stroke = 'bulletColor';
            const circleBulletState = circleBullet.states.create('hover');
            circleBulletState.properties.fillOpacity = 1;
            circleBulletState.properties.strokeOpacity = 1;

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.lineX.strokeOpacity = 0;
            chart.cursor.lineY.strokeOpacity = 0;

            state.chart = chart;
        };

        /* api */
        const getCount = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.billingSummary({
                    granularity: DATE_TYPE.monthly,
                    period: 1,
                    project_id: props.projectId,
                });
                // if (res.results.length > 0) state.count.spendings = res.results[0].billing_data[0].cost;
            } catch (e) {
                console.error(e);
            }
        };
        const getTrend = async () => {
            const utcToday = dayjs().utc();
            const dateType = state.selectedDateType;
            // const dateUnit = dateType === DATE_TYPE.monthly ? 'month' : 'day';
            const dateFormat = dateType === DATE_TYPE.monthly ? 'MMM' : 'MM/DD';
            let start;
            let end;
            if (dateType === DATE_TYPE.monthly) {
                start = utcToday.subtract(MONTH_COUNT - 1, 'month').format('YYYY-MM');
                end = utcToday.format('YYYY-MM');
            } else {
                start = utcToday.subtract(DAY_COUNT - 1, 'day').format('YYYY-MM-DD');
                end = utcToday.format('YYYY-MM-DD');
            }

            chartState.loading = true;
            try {
                let data;
                const res = await SpaceConnector.client.statistics.topic.billingSummary({
                    granularity: state.selectedDateType,
                    project_id: props.projectId,
                    start,
                    end,
                });

                if (res.results.length > 0) {
                    data = res.results[0].billing_data.map(d => ({
                        date: dayjs(d.date),
                        value: d.cost,
                    }));
                } else {
                    data = [];
                }

                const orderedData = orderBy(data, ['date'], ['asc']);
                chartState.data = orderedData.map((d, index) => {
                    let date;
                    if (dateType === DATE_TYPE.monthly && (d.date.format('M') === '1' || d.date.format('M') === '12')) {
                        date = d.date.format('MMM, YY');
                    } else {
                        date = d.date.format(dateFormat);
                    }

                    const chartData: ChartData = {
                        date,
                        value: d.value,
                    };
                    if (index === orderedData.length - 2) {
                        chartData.color = safe;
                        chartData.dash = '2, 2';
                    }
                    if (index === orderedData.length - 1) {
                        chartData.bulletColor = safe;
                    }
                    return chartData;
                });
            } catch (e) {
                console.error(e);
            } finally {
                chartState.loading = false;
            }
        };
        const setTableFields = () => {
            const fields: any = [];
            let now = state.endDate.clone();
            if (state.selectedDateType === DATE_TYPE.monthly) {
                const start = now.subtract(DATA_TABLE_COLUMN, 'month');
                while (now.isAfter(start, 'month')) {
                    fields.unshift({
                        name: now.format('YYYY-MM'),
                        label: now.format('MMM/YYYY'),
                    });
                    now = now.subtract(1, 'month');
                }
            } else {
                now = state.endDate.clone().subtract(1, 'day');
                const start = now.subtract(DATA_TABLE_COLUMN, 'day');
                while (now.isAfter(start, 'day')) {
                    fields.unshift({
                        name: now.format('YYYY-MM-DD'),
                        label: now.format('MM/DD/YYYY'),
                    });
                    now = now.subtract(1, 'day');
                }
            }
            fields.unshift({ name: 'service', label: '' });
            state.fields = fields;
        };
        const setTableData = (res) => {
            const data: any = [];
            res.results.forEach((d) => {
                const billingData = {};
                d.billing_data.forEach((b) => {
                    billingData[b.date] = `$${commaFormatter(numberFormatter(b.cost))}`;
                });
                data.push({
                    service: d.cloud_service_group || d.service_code,
                    ...billingData,
                });
            });
            state.tableData = data;
        };
        const getTableData = async () => {
            tableState.loading = true;

            const today = state.endDate;
            let start;
            let end;
            if (state.selectedDateType === DATE_TYPE.monthly) {
                start = today.subtract(DATA_TABLE_COLUMN - 1, 'month').format('YYYY-MM');
                end = today.format('YYYY-MM');
            } else {
                start = today.subtract(DATA_TABLE_COLUMN, 'day').format('YYYY-MM-DD');
                end = today.subtract(1, 'day').format('YYYY-MM-DD');
            }

            try {
                const res = await SpaceConnector.client.statistics.topic.billingSummary({
                    granularity: state.selectedDateType,
                    aggregation: 'inventory.CloudServiceType',
                    project_id: props.projectId,
                    start,
                    end,
                });
                console.log(res);

                setTableData(res);
            } catch (e) {
                console.error(e);
            } finally {
                setTableFields();
                tableState.loading = false;
            }
        };

        /* event */
        const onClickDateButton = (type) => {
            let dateUnit = 'month';
            if (state.selectedDateType === DATE_TYPE.daily) dateUnit = 'day';
            if (type === 'prev') {
                state.endDate = state.endDate.subtract(DATA_TABLE_COLUMN, dateUnit);
            } else {
                state.endDate = state.endDate.add(DATA_TABLE_COLUMN, dateUnit);
            }
            getTableData();
        };

        const init = async () => {
            // await getCount();
            await Promise.all([getTrend(), getTableData()]);
        };
        init();

        watch([() => chartState.loading, () => state.chartRef], async ([loading, chartContext]) => {
            if (!loading && chartContext) {
                drawChart();
            }
        }, { immediate: false });
        watch(() => state.selectedDateType, async () => {
            await Promise.all([getTrend(), getTableData()]);
            drawChart();
        }, { immediate: false });

        return {
            ...toRefs(state),
            tableState,
            chartState,
            onClickDateButton,
        };
    },
};
</script>

<style lang="postcss" scoped>
.title {
    font-size: 1.5rem;
    line-height: 1.6;
    margin-bottom: 0.75rem;
}
.content-wrapper {
    @apply border border-gray-200;
    border-radius: 0.125rem;
    padding: 1rem;
    .title {
        position: relative;
        font-size: 1rem;
        font-weight: bold;
        margin-bottom: 1rem;
        .date-button-group {
            position: absolute;
            right: 0.5rem;
            top: 0;
            .date-button {
                @apply border border-gray-200 text-gray-300;
                height: 1.25rem;
                min-width: 2rem;
                font-size: 0.75rem;
                font-weight: normal;
                border-radius: 0.125rem;
                padding: 0.25rem;
                margin-left: 0.25rem;
                &.selected {
                    @apply bg-gray-600 border-gray-600 text-white;
                }
            }
        }
    }
    .chart-wrapper {
        min-height: 13rem;
        margin-bottom: 1rem;
        .chart {
            height: 13rem;
        }
    }
    .detail-wrapper {
        .table-button-wrapper {
            text-align: right;
            .text {
                font-size: 0.75rem;
                vertical-align: middle;
                line-height: 1.2;
            }
        }
        .p-data-table::v-deep {
            height: auto;
            max-height: 17.5rem;
            text-align: right;
            border-radius: 0.125rem;
            margin-top: 0.5rem;
            th {
                @apply bg-gray-100 text-gray-400;
                height: 1.5rem;
                text-align: right;
                border: none;
                font-size: 0.75rem;
                &:first-child {
                    @apply bg-white;
                }
                .th-contents {
                    display: block;
                    padding-right: 1rem;
                }
            }
            tr {
                &:nth-child(even) {
                    td {
                        @apply bg-primary4;
                    }
                }
            }
            td {
                height: 1.75rem;
                .col-service {
                    @apply text-gray-700;
                }
            }
            .table-container {
                height: auto;
            }
        }
        .toggle-button-wrapper {
            text-align: center;
            .p-collapsible-toggle {
                display: block;
                padding-top: 0.5rem;
            }
        }
    }
}
</style>
