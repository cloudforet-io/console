<template>
    <div class="project-billing">
        <div class="title">
            <span>{{ $t('COMMON.WIDGETS.BILLING.TITLE') }}</span>
        </div>
        <div class="content-wrapper grid grid-cols-12 gap-2">
            <div class="col-span-12 title">
                <span>{{ $t('COMMON.WIDGETS.BILLING.TREND_TITLE') }}</span>
                <div class="date-button-group">
                    <p-select-button v-for="(d, idx) in dateTypes"
                                     :key="`date-${d.name}-${idx}`"
                                     :class="{'selected': selectedDateType === d.name}"
                                     style-type="gray"
                                     size="sm"
                                     @click="selectedDateType = d.name"
                    >
                        {{ d.label }}
                    </p-select-button>
                </div>
            </div>
            <div class="col-span-12 md:col-span-9">
                <div class="chart-wrapper">
                    <p-data-loader :loading="chartState.loading">
                        <template #loader>
                            <p-skeleton width="100%"
                                        height="100%"
                            />
                        </template>
                        <div ref="chartRef"
                             class="chart"
                        />
                    </p-data-loader>
                </div>
            </div>
            <div class="col-span-12 md:col-span-3 grid grid-cols-12 summary-group">
                <div class="summary-wrapper col-span-6 md:col-span-12">
                    <span class="label">{{ summaryState.pastDateText }}</span>
                    <span class="date">({{ summaryState.pastDate }})</span>
                    <span class="cost">
                        <span v-if="summaryState.pastCost !== 0">${{ summaryState.pastCost }}</span>
                        <span v-else
                              class="empty"
                        />
                    </span>
                </div>
                <div class="summary-wrapper col-span-6 md:col-span-12">
                    <span class="label">{{ summaryState.currentDateText }}</span>
                    <span class="date">({{ summaryState.currentDate }})</span>
                    <div class="cost in-process">
                        <template v-if="summaryState.currentCost !== 0">
                            <span>${{ summaryState.currentCost }}</span>
                            <span class="in-process-text">({{ $t('COMMON.WIDGETS.BILLING.IN_PROCESS') }})</span>
                            <div class="help">
                                <p-i v-tooltip.top="$t('COMMON.WIDGETS.BILLING.TOOLTIP_TEXT')"
                                     name="ic_question-mark-circle-filled"
                                     width="1rem"
                                     height="1rem"
                                     color="inherit transparent"
                                />
                            </div>
                        </template>
                        <template v-else>
                            <span class="empty" />
                        </template>
                    </div>
                </div>
            </div>
            <div class="col-span-12 detail-wrapper">
                <div class="table-button-wrapper">
                    <p-icon-button class="text"
                                   name="ic_chevron-left"
                                   color="inherit transparent"
                                   @click="handleClickDateButton('prev')"
                    />
                    <p-icon-button class="text"
                                   name="ic_chevron-right"
                                   color="inherit transparent"
                                   :disabled="tableState.nextButtonDisabled"
                                   @click="handleClickDateButton('next')"
                    />
                </div>
                <p-data-table
                    :loading="tableState.loading"
                    :fields="tableState.fields"
                    :items="tableState.isCollapsed ? tableState.data.slice(0, 5) : tableState.data"
                    :bordered="false"
                >
                    <template #th-service-format>
                        <span />
                    </template>
                    <template v-for="field in tableState.fields"
                              #[`col-${field.name}-format`]="{value}"
                    >
                        <template v-if="field.name !== 'service'">
                            <span v-if="value"
                                  :key="field.name"
                                  :style="{ 'color': value.color }"
                            >{{ value.cost }}</span>
                            <span v-else
                                  :key="field.name"
                            >-</span>
                        </template>
                        <span v-else
                              :key="field.name"
                              class="col-service"
                              :class="{'link-text': !!value.to.name }"
                        >
                            <router-link v-if="!!value.to.name"
                                         :to="value.to"
                            >{{ value.name }}</router-link>
                            <span v-else>{{ value.name }}</span>
                        </span>
                    </template>
                </p-data-table>
                <div v-if="tableState.data.length > 5"
                     class="toggle-button-wrapper"
                >
                    <p-collapsible-toggle :is-collapsed.sync="tableState.isCollapsed">
                        {{ tableState.isCollapsed ? $t('COMMON.WIDGETS.BILLING.SHOW_ALL') : $t('COMMON.WIDGETS.BILLING.HIDE') }}
                    </p-collapsible-toggle>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import {
    computed, getCurrentInstance, onUnmounted, reactive, toRefs, watch,
} from 'vue';
import type { NumberFormatOptions } from 'vue-i18n';
import type { Vue } from 'vue/types/vue';

import type { XYChart } from '@amcharts/amcharts4/charts';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import {
    PSelectButton,
    PDataLoader,
    PCollapsibleToggle,
    PDataTable,
    PI,
    PIconButton,
    PSkeleton,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { orderBy, range } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { CURRENCY } from '@/store/modules/settings/config';

import config from '@/lib/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    gray, safe, secondary, secondary1, green, blue,
} from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

interface ChartData {
    date: string;
    value: number;
    color?: string;
    dash?: string;
    tooltipTextColor?: string;
    tooltipBorderColor?: string;
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
        PDataLoader,
        PSkeleton,
        PSelectButton,
        PDataTable,
        PCollapsibleToggle,
        PIconButton,
        PI,
    },
    props: {
        projectId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const queryHelper = new QueryHelper();
        const state = reactive({
            loading: false,
            chart: null as XYChart | null,
            chartRef: null as any, // HTMLElement | null,
            skeletons: range(4),
            dateTypes: computed(() => ([
                { name: DATE_TYPE.daily, label: vm.$t('COMMON.WIDGETS.BILLING.DAY') },
                { name: DATE_TYPE.monthly, label: vm.$t('COMMON.WIDGETS.BILLING.MONTH') },
            ])),
            data: [],
            selectedDateType: DATE_TYPE.monthly,
        });
        const summaryState = reactive({
            pastDateText: computed(() => {
                if (state.selectedDateType === DATE_TYPE.monthly) return vm.$t('COMMON.WIDGETS.BILLING.LAST_MONTH');
                return vm.$t('COMMON.WIDGETS.BILLING.TWO_DAYS_AGO');
            }),
            currentDateText: computed(() => {
                if (state.selectedDateType === DATE_TYPE.monthly) return vm.$t('COMMON.WIDGETS.BILLING.THIS_MONTH');
                return vm.$t('COMMON.WIDGETS.BILLING.YESTERDAY');
            }),
            pastDate: computed(() => {
                if (state.selectedDateType === DATE_TYPE.monthly) {
                    return dayjs.utc().subtract(1, 'month').format('MMM/YYYY');
                }
                return dayjs.utc().subtract(2, 'day').format('DD/MM/YYYY');
            }),
            currentDate: computed(() => {
                if (state.selectedDateType === DATE_TYPE.monthly) {
                    return dayjs.utc().format('MMM/YYYY');
                }
                return dayjs.utc().subtract(1, 'day').format('DD/MM/YYYY');
            }),
            pastCost: 0,
            currentCost: 0,
        });
        const tableState = reactive({
            loading: false,
            isCollapsed: true,
            fields: [] as any,
            data: [],
            endDate: dayjs.utc(),
            nextButtonDisabled: computed(() => {
                const now = dayjs.utc();
                if (state.selectedDateType === DATE_TYPE.monthly) {
                    return now.isSame(tableState.endDate, 'month');
                }
                return now.isSame(tableState.endDate, 'day');
            }),
        });
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
            const options: NumberFormatOptions = {
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
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.paddingLeft = -5;
            chart.paddingBottom = -10;
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
            valueAxis.renderer.labels.template.fill = am4core.color(secondary1);
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

            series.adapter.add('tooltipText', (text, target) => {
                if (target.tooltipDataItem && target.tooltipDataItem.dataContext) {
                    return `[bold]$${commaFormatter(numberFormatter(target.tooltipDataItem.dataContext.value))}`;
                }
                return text;
            });
            series.tooltip.fontSize = 14;
            series.tooltip.strokeWidth = 0;
            series.tooltip.dy = -5;
            series.tooltip.getFillFromObject = false;
            series.tooltip.pointerOrientation = 'down';
            series.tooltip.label.propertyFields.fill = 'tooltipTextColor';
            series.tooltip.background.propertyFields.stroke = 'tooltipBorderColor';

            const fillModifier = new am4core.LinearGradientModifier();
            fillModifier.opacities = [0.3, 0];
            fillModifier.offsets = [0, 0.5];
            fillModifier.gradient.rotation = 90;
            series.segments.template.fillModifier = fillModifier;

            const circleBullet = series.bullets.push(new am4charts.CircleBullet());
            circleBullet.circle.strokeWidth = 0;
            circleBullet.fillOpacity = 0;
            circleBullet.circle.fill = am4core.color(secondary);
            circleBullet.circle.propertyFields.fill = 'tooltipTextColor';
            circleBullet.circle.propertyFields.stroke = 'tooltipTextColor';
            const circleBulletState = circleBullet.states.create('hover');
            circleBulletState.properties.fillOpacity = 1;
            circleBulletState.properties.strokeOpacity = 1;

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.lineX.strokeOpacity = 0;
            chart.cursor.lineY.strokeOpacity = 0;
            chart.cursor.behavior = 'none';

            state.chart = chart;
        };
        const getLink = (data) => ({
            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
            query: {
                provider: primitiveToQueryString(data.provider),
                filters: queryHelper.setFilters([
                    { k: 'project_id', v: props.projectId, o: '=' },
                    { k: 'cloud_service_group', v: data.cloud_service_group, o: '=' },
                ]).rawQueryStrings,
            },
        });

        /* api */
        const getCount = async () => {
            const utcToday = dayjs.utc();
            let start;
            let end;
            if (state.selectedDateType === DATE_TYPE.monthly) {
                start = utcToday.subtract(1, 'month').format('YYYY-MM');
                end = utcToday.format('YYYY-MM');
            } else {
                start = utcToday.subtract(2, 'day').format('YYYY-MM-DD');
                end = utcToday.subtract(1, 'day').format('YYYY-MM-DD');
            }
            try {
                const res = await SpaceConnector.client.statistics.topic.billingSummary({
                    granularity: state.selectedDateType,
                    project_id: props.projectId,
                    start,
                    end,
                });
                if (res.results.length > 0) {
                    const billingData = res.results[0].billing_data;
                    summaryState.pastCost = commaFormatter(numberFormatter(billingData.find((d) => d.date === start)?.cost || 0));
                    summaryState.currentCost = commaFormatter(numberFormatter(billingData.find((d) => d.date === end)?.cost || 0));
                } else {
                    summaryState.pastCost = 0;
                    summaryState.currentCost = 0;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        const getTrend = async () => {
            const utcToday = dayjs.utc();
            const dateType = state.selectedDateType;
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
                    data = res.results[0].billing_data.map((d) => ({
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
                        chartData.tooltipTextColor = safe;
                        chartData.tooltipBorderColor = green[300];
                    } else {
                        chartData.tooltipTextColor = secondary;
                        chartData.tooltipBorderColor = blue[300];
                    }
                    return chartData;
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                chartState.loading = false;
            }
        };
        const setTableFields = () => {
            const fields: any = [];
            let now = tableState.endDate.clone();
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
                now = tableState.endDate.clone().subtract(1, 'day');
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
            tableState.fields = fields;
        };
        const getTableData = async () => {
            tableState.loading = true;

            const today = tableState.endDate;
            let start;
            let end;
            if (state.selectedDateType === DATE_TYPE.monthly) {
                start = today.subtract(DATA_TABLE_COLUMN, 'month').format('YYYY-MM');
                end = today.format('YYYY-MM');
            } else {
                start = today.subtract(DATA_TABLE_COLUMN + 1, 'day').format('YYYY-MM-DD');
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

                const data: any = [];
                res.results.forEach((result) => {
                    const billingData = {};
                    result.billing_data.forEach((d) => {
                        const dateUnit = state.selectedDateType === DATE_TYPE.monthly ? 'month' : 'day';
                        const dateFormat = state.selectedDateType === DATE_TYPE.monthly ? 'YYYY-MM' : 'YYYY-MM-DD';
                        const pastDate = dayjs.utc(d.date).subtract(1, dateUnit).format(dateFormat);
                        const pastCost = result.billing_data.find((bd) => bd.date === pastDate)?.cost || 0;
                        billingData[d.date] = {
                            cost: currencyMoneyFormatter(d.cost, CURRENCY.USD),
                        };
                        if (pastCost && pastCost < d.cost && (d.cost - pastCost) / Math.abs(pastCost) > 0.5) {
                            billingData[d.date].color = 'red';
                        }
                    });

                    let to = {};
                    if (result.cloud_service_group && result.cloud_service_type) {
                        to = getLink(result);
                    }

                    data.push({
                        service: {
                            name: result.cloud_service_group || result.service_code,
                            to,
                        },
                        ...billingData,
                    });
                });
                tableState.data = data;
            } catch (e) {
                ErrorHandler.handleError(e);
                tableState.data = [];
            } finally {
                setTableFields();
                tableState.loading = false;
            }
        };

        /* Event */
        const handleClickDateButton = (type) => {
            let dateUnit = 'month';
            if (state.selectedDateType === DATE_TYPE.daily) dateUnit = 'day';
            if (type === 'prev') {
                tableState.endDate = tableState.endDate.subtract(DATA_TABLE_COLUMN, dateUnit);
            } else {
                tableState.endDate = tableState.endDate.add(DATA_TABLE_COLUMN, dateUnit);
            }
            getTableData();
        };

        /* Init */
        (async () => {
            await Promise.allSettled([getTrend(), getTableData(), getCount()]);
        })();

        /* Watcher */
        watch([() => chartState.loading, () => state.chartRef], async ([loading, chartContext]) => {
            if (!loading && chartContext) {
                drawChart();
            }
        }, { immediate: false });
        watch(() => state.selectedDateType, async () => {
            await Promise.all([getTrend(), getTableData(), getCount()]);
            drawChart();
        }, { immediate: false });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            tableState,
            summaryState,
            chartState,
            handleClickDateButton,
        };
    },
};
</script>

<style lang="postcss" scoped>
.title {
    font-size: 1.5rem;
    line-height: 1.6;
    padding-top: 0.5rem;
    margin-bottom: 0.75rem;
}
.content-wrapper {
    @apply border border-gray-200 rounded-md;
    padding: 1rem;
    .title {
        position: relative;
        font-size: 0.875rem;
        font-weight: bold;
        margin-bottom: 1rem;
        .date-button-group {
            position: absolute;
            right: 0.5rem;
            top: 0;
            .p-select-button {
                margin-right: 0.375rem;
                min-width: 2.4375rem;
            }
        }
    }
    .summary-group {
        grid-auto-rows: max-content;
        .summary-wrapper {
            line-height: 1.5;
            padding-bottom: 0.5rem;
            .label {
                @apply text-gray-700;
                font-size: 0.875rem;
            }
            .date {
                @apply text-gray-500;
                font-size: 0.75rem;
                padding-left: 0.375rem;
            }
            .cost {
                @apply text-secondary;
                display: block;
                font-size: 1.375rem;
                line-height: 1.55;
                &.in-process {
                    @apply text-safe;
                    .in-process-text {
                        font-size: 0.75rem;
                        padding-left: 0.375rem;
                    }
                }
                .help {
                    @apply text-gray-300;
                    display: inline-block;
                    padding-left: 0.25rem;
                    .p-i-icon {
                        cursor: help;
                    }
                }
                .empty {
                    display: block;
                    width: 1rem;
                    height: 1rem;
                    border-bottom: 2px solid;
                    margin-bottom: 1rem;
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
        }

        /* custom design-system component - p-data-table */
        :deep(.p-data-table) {
            @apply rounded-xs;
            height: auto;
            text-align: right;
            margin-top: 0.5rem;
            .table-container {
                min-height: 5rem;
                max-height: 17.5rem;
            }
            th {
                @apply bg-gray-100 text-gray-400;
                height: 1.5rem;
                text-align: right;
                border: none;
                font-size: 0.75rem;
                &:first-child {
                    @apply bg-white;
                    width: 10rem;
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
                        &:last-child {
                            @apply bg-green-100;
                        }
                        &:first-child {
                            @apply bg-white;
                        }
                    }
                }
                &:hover {
                    @apply bg-white;
                }
            }
            td {
                width: auto;
                height: 1.75rem;
                .col-service {
                    @apply text-gray-700;
                    cursor: default;
                    &.link-text {
                        @apply text-secondary;
                        cursor: pointer;
                        &:hover {
                            text-decoration: underline;
                        }
                    }
                }
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
