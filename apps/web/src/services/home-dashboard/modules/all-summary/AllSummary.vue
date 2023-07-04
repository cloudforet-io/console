<template>
    <div class="all-summary">
        <p-balloon-tab v-model="activeTab"
                       :tabs="tabs"
                       tail
                       stretch
                       @change="handleChangeTab"
        >
            <template #tab="{name, label}">
                <div class="tab-box-wrapper"
                     :class="{selected: name === activeTab}"
                >
                    <div class="count">
                        <router-link :to="getAllSummaryTabLocation(name)"
                                     class="anchor"
                        >
                            <span class="number">
                                <span v-if="name === DATA_TYPE.BILLING"
                                      class="dollar-sign"
                                >$</span>
                                <p-skeleton v-if="loading"
                                            width="2rem"
                                            height="2rem"
                                />
                                <span v-else>{{ count[name] }}</span>
                            </span>
                        </router-link>
                        <span v-if="name === DATA_TYPE.STORAGE"
                              class="suffix"
                        >{{ storageBoxSuffix }}</span>
                    </div>
                    <div class="title">
                        {{ label }}
                    </div>
                </div>
            </template>
            <div class="content-wrapper">
                <div class="chart-wrapper col-span-12 lg:col-span-9">
                    <div class="title">
                        <span>{{ $t('COMMON.WIDGETS.ALL_SUMMARY.TREND_TITLE') }}</span>
                        <span v-if="activeTab === 'storage'"
                              class="suffix"
                        >({{ storageTrendSuffix }})</span>
                        <span v-if="activeTab === 'billing'"
                              class="suffix"
                        >(USD)</span>
                    </div>
                    <div class="toggle-button-group">
                        <p-select-button v-for="(d, idx) in dateTypes"
                                         :key="`date-${d.name}-${idx}`"
                                         :class="{'selected': selectedDateType === d.name}"
                                         style-type="gray"
                                         size="sm"
                                         @click="handleChangeDateType(d.name)"
                        >
                            {{ d.label }}
                        </p-select-button>
                    </div>
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
                <all-summary-data-summary :extra-params="extraParams"
                                          :active-tab="activeTab"
                                          :label="tabs.find(d => d.name === activeTab).label"
                                          :count="count[activeTab]"
                                          :selected-date-type="selectedDateType"
                                          :storage-suffix="storageBoxSuffix"
                />
            </div>
        </p-balloon-tab>
    </div>
</template>

<script lang="ts">

import {
    computed, onUnmounted, reactive, toRefs, watch,
} from 'vue';
import type { Location } from 'vue-router';

import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import {
    PBalloonTab, PSelectButton, PDataLoader, PSkeleton,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import dayjs from 'dayjs';
import { forEach, orderBy, range } from 'lodash';

import { byteFormatter, commaFormatter, numberFormatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import config from '@/lib/config';
import { objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray, primary, primary1 } from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { Period } from '@/services/cost-explorer/type';
import AllSummaryDataSummary from '@/services/home-dashboard/modules/all-summary/AllSummaryDataSummary.vue';
import type { DateItem, DateType, DataType } from '@/services/home-dashboard/modules/type';
import {
    DATA_TYPE,
} from '@/services/home-dashboard/modules/type';

export const DAY_COUNT = 14;
export const MONTH_COUNT = 12;

/* type */
type Unit = 'b' | 'gb' | 'kb' | 'mb' | 'pb' | 'tb' | 'B' | 'GB' | 'KB' | 'MB' | 'PB' | 'TB';
interface ChartData {
    date: string;
    count: number | null;
    fillOpacity?: number;
    bulletColor?: string;
    bulletText?: string | number;
    tooltipText?: string | number;
}
interface CountMap {
    [key: string]: number | string;
}

export default {
    name: 'AllSummary',
    components: {
        AllSummaryDataSummary,
        PSkeleton,
        PDataLoader,
        PBalloonTab,
        PSelectButton,
    },
    props: {
        extraParams: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const state = reactive({
            chart: null as any,
            chartRef: null as HTMLElement | null,
            //
            period: computed<Period>(() => {
                if (state.selectedDateType === 'MONTHLY') {
                    return {
                        start: dayjs.utc().subtract(MONTH_COUNT - 1, 'month').format('YYYY-MM'),
                        end: dayjs.utc().format('YYYY-MM'),
                    };
                }
                return {
                    start: dayjs.utc().subtract(DAY_COUNT, 'day').format('YYYY-MM-DD'),
                    end: dayjs.utc().subtract(1, 'day').format('YYYY-MM-DD'),
                };
            }),
            selectedDateType: 'DAILY' as DateType,
            dateTypes: computed<DateItem[]>(() => ([
                { name: 'DAILY', label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.DAY') },
                { name: 'MONTHLY', label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.MONTH') },
            ])),
            //
            loading: true,
            count: {
                [DATA_TYPE.SERVER]: 0,
                [DATA_TYPE.DATABASE]: 0,
                [DATA_TYPE.STORAGE]: 0,
                [DATA_TYPE.BILLING]: 0,
            } as CountMap,
            storageBoxSuffix: 'TB' as Unit,
            storageTrendSuffix: 'TB' as Unit,
            activeTab: DATA_TYPE.SERVER as DataType,
            tabs: computed<TabItem[]>(() => [
                {
                    name: DATA_TYPE.SERVER,
                    label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.SERVER'),
                },
                {
                    name: DATA_TYPE.DATABASE,
                    label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.DATABASE'),
                },
                {
                    name: DATA_TYPE.STORAGE,
                    label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.STORAGE'),
                },
                {
                    name: DATA_TYPE.BILLING,
                    label: i18n.t('COMMON.WIDGETS.ALL_SUMMARY.OVERALL_SPENDINGS'),
                },
            ]),
        });
        const chartState = reactive({
            loading: true,
            registry: {},
            data: [] as ChartData[],
        });

        /* Util */
        const disposeChart = (chartContext) => {
            if (chartState.registry[chartContext]) {
                chartState.registry[chartContext].dispose();
                delete chartState.registry[chartContext];
            }
        };
        const drawChart = (chartContext) => {
            const createChart = () => {
                disposeChart(chartContext);
                chartState.registry[chartContext] = am4core.create(chartContext, am4charts.XYChart);
                return chartState.registry[chartContext];
            };
            const chart = createChart();
            state.chart = chart;

            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.paddingLeft = -5;
            chart.paddingBottom = 0;
            chart.paddingTop = 10;
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
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.labels.template.fill = am4core.color(gray[400]);
            valueAxis.tooltip.disabled = true;
            valueAxis.fontSize = 11;
            valueAxis.extraMax = 0.15;
            if (state.activeTab === DATA_TYPE.BILLING) {
                valueAxis.renderer.labels.template.adapter.add('text', (text, target) => numberFormatter(target.dataItem.value));
            } else {
                valueAxis.min = 0;
            }

            const series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = 'count';
            series.dataFields.categoryX = 'date';
            series.fill = am4core.color(primary1);
            series.columns.template.width = am4core.percent(30);
            series.columns.template.column.cornerRadiusTopLeft = 3;
            series.columns.template.column.cornerRadiusTopRight = 3;
            series.strokeWidth = 0;
            series.columns.template.propertyFields.fillOpacity = 'fillOpacity';

            series.tooltipText = '{tooltipText}';
            series.tooltip.pointerOrientation = 'down';
            series.tooltip.fontSize = 14;
            series.tooltip.strokeWidth = 0;
            series.tooltip.dy = -5;
            series.tooltip.getFillFromObject = false;
            series.tooltip.label.fill = am4core.color(primary);
            series.tooltip.background.stroke = am4core.color(primary);

            const bullet = series.bullets.push(new am4charts.LabelBullet());
            bullet.label.text = '{bulletText}';
            bullet.label.fontSize = 14;
            bullet.label.truncate = false;
            bullet.label.hideOversized = false;
            bullet.label.propertyFields.fill = 'bulletColor';
            bullet.label.dy = -10;
            if (state.activeTab === DATA_TYPE.BILLING) {
                bullet.label.adapter.add('dy', (dy, target) => {
                    if (target.dataItem.valueY < 0) return 10;
                    return dy;
                });
            }

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.lineX.strokeOpacity = 0;
            chart.cursor.lineY.strokeOpacity = 0;
            chart.cursor.behavior = 'none';
        };

        const setChartData = (data) => {
            const chartData: ChartData[] = [];
            const dateType = state.selectedDateType;
            const dateRange = dateType === 'MONTHLY' ? MONTH_COUNT : DAY_COUNT;
            const dateUnit = dateType === 'MONTHLY' ? 'month' : 'day';
            const dateFormat = dateType === 'MONTHLY' ? 'YYYY-MM' : 'YYYY-MM-DD';

            if (state.activeTab === DATA_TYPE.STORAGE) {
                const smallestCount = Math.min(...data.map((d) => d.total));
                const formattedSize = byteFormatter(smallestCount);
                if (formattedSize) state.storageTrendSuffix = formattedSize.split(' ')[1] as Unit;
            }
            const formattedData = data.map((d) => {
                let count = d.total;
                if (state.activeTab === DATA_TYPE.STORAGE) {
                    const formattedSize = byteFormatter(d.total, { unit: state.storageTrendSuffix });
                    if (formattedSize) count = formattedSize.split(' ')[0];
                }
                return {
                    date: d.date,
                    count,
                };
            });

            // fill default value
            forEach(range(0, dateRange), (i) => {
                let date = dayjs.utc().subtract(i, dateUnit);
                if (state.activeTab === DATA_TYPE.BILLING && state.selectedDateType === 'DAILY') {
                    date = date.subtract(1, 'day');
                }
                if (formattedData.find((d) => date.format(dateFormat) === d.date)) {
                    chartData.push(formattedData.find((d) => date.format(dateFormat) === d.date));
                } else {
                    chartData.push({ date: date.format(dateFormat), count: null });
                }
            });

            const orderedData = orderBy(chartData, ['date'], ['asc']);
            chartState.data = orderedData.map((d, idx) => {
                const tooltipText = state.activeTab === DATA_TYPE.BILLING ? numberFormatter(d.count) : d.count || '';
                let bulletText;
                if ((dateType === 'DAILY' && idx % 3 === 1) || (dateType === 'MONTHLY' && idx % 3 === 2)) {
                    bulletText = tooltipText;
                }

                let fillOpacity = 1;
                let bulletColor = primary;
                if (state.activeTab === DATA_TYPE.BILLING && idx === orderedData.length - 1) {
                    fillOpacity = 0.5;
                    bulletColor = primary1;
                }

                const date = dayjs(d.date);
                let dateLabel;
                if (dateType === 'MONTHLY' && (date.format('M') === '1' || date.format('M') === '12')) {
                    dateLabel = date.format('MMM, YY');
                } else {
                    const labelFormat = dateType === 'MONTHLY' ? 'MMM' : 'MM/DD';
                    dateLabel = date.format(labelFormat);
                }

                return {
                    date: dateLabel,
                    count: d.count,
                    fillOpacity,
                    bulletColor,
                    bulletText,
                    tooltipText,
                };
            });
        };
        const getAllSummaryTabLocation = (type: DataType): Location => {
            if (type === DATA_TYPE.BILLING) {
                const _period = {
                    start: dayjs.utc().startOf('month').format('YYYY-MM-DD'),
                    end: dayjs.utc().endOf('month').format('YYYY-MM-DD'),
                };
                return {
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    query: {
                        granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                        period: objectToQueryString(_period),
                    },
                };
            }
            return {
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                query: {
                    service: type,
                },
            };
        };

        /* Api */
        const getBillingCount = async () => {
            try {
                const { results } = await SpaceConnector.client.statistics.topic.billingSummary({
                    ...props.extraParams,
                    granularity: 'MONTHLY',
                    start: dayjs.utc().startOf('month').format('YYYY-MM-DD'),
                    end: dayjs.utc().endOf('month').format('YYYY-MM-DD'),
                });
                if (results.length > 0) {
                    const count = results[0].billing_data[0].cost;
                    state.count[DATA_TYPE.BILLING] = commaFormatter(numberFormatter(count));
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        const getCount = async () => {
            try {
                const { results } = await SpaceConnector.client.statistics.topic.cloudServiceSummary({
                    ...props.extraParams,
                    labels: Object.values(DATA_TYPE),
                });

                results.forEach((result) => {
                    let count;
                    const label: DataType = result.label;
                    if (label === DATA_TYPE.STORAGE) {
                        state.storageBoxSuffix = byteFormatter(result.total).split(' ')[1] as Unit;
                        count = parseFloat(byteFormatter(result.total).split(' ')[0]);
                        count = commaFormatter(count);
                    } else {
                        count = numberFormatter(result.total);
                    }
                    state.count[label] = count;
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        const getTrend = async (type) => {
            try {
                let data;
                if (type === DATA_TYPE.BILLING) {
                    const res = await SpaceConnector.client.statistics.topic.billingSummary({
                        ...props.extraParams,
                        granularity: state.selectedDateType,
                        start: state.period.start,
                        end: state.period.end,
                    });
                    if (res.results.length > 0) {
                        data = res.results[0].billing_data.map((d) => ({
                            date: d.date,
                            total: d.cost,
                        }));
                    } else {
                        data = [];
                    }
                } else {
                    const res = await SpaceConnector.client.statistics.topic.dailyCloudServiceSummary({
                        ...props.extraParams,
                        label: type,
                        granularity: state.selectedDateType,
                    });
                    data = res.results;
                }
                setChartData(data);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        /* Event */
        const handleChangeTab = (name) => {
            if (state.activeTab !== name) disposeChart(state.chartRef);
            state.activeTab = name;
        };
        const handleChangeDateType = (type) => {
            state.selectedDateType = type;
        };

        const init = async () => {
            state.loading = true;
            await Promise.all([
                getCount(),
                getBillingCount(),
            ]);
            state.loading = false;
        };
        const chartInit = async () => {
            await getTrend(DATA_TYPE.SERVER);
            setTimeout(() => {
                chartState.loading = false;
            }, 300);
        };
        init();
        chartInit();

        /* Watcher */
        watch([() => chartState.loading, () => state.chartRef], async ([loading, chartContext]) => {
            if (!loading && chartContext) {
                requestIdleCallback(() => drawChart(chartContext));
            }
        }, { immediate: false });
        watch(() => state.activeTab, async (type) => {
            await getTrend(type);
            drawChart(state.chartRef);
        }, { immediate: false });
        watch(() => state.selectedDateType, async () => {
            await getTrend(state.activeTab);
            drawChart(state.chartRef);
        }, { immediate: false });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            chartState,
            handleChangeTab,
            handleChangeDateType,
            getAllSummaryTabLocation,
            DATA_TYPE,
        };
    },
};
</script>

<style lang="postcss" scoped>
/* custom design-system component - p-balloon-tab */
:deep(.p-balloon-tab) {
    .balloon-group {
        flex-wrap: nowrap;
        justify-content: space-evenly;
        button {
            width: 100%;
            &:not(.active) {
                @apply border-transparent;
            }
        }
    }

    @screen mobile {
        .balloon-group {
            flex-wrap: wrap;
            button {
                width: 40%;
            }
        }
    }
}
.tab-box-wrapper {
    text-align: left;
    padding: 0.5rem 0;
    .count {
        @apply text-indigo-400;
        align-self: flex-end;
        display: inline-flex;
        line-height: 2.5rem;
        &:hover {
            .anchor {
                border-bottom: 2px solid;
                &.billing {
                    border: none;
                }
            }
        }
        .dollar-sign {
            @apply text-gray-500;
            font-size: 1.5rem;
            font-weight: normal;
            padding-right: 0.25rem;
        }
        .number {
            @apply text-indigo-400;
            font-size: 2rem;
            font-weight: bold;
            display: inline-flex;
            align-self: flex-end;
        }
        .suffix {
            @apply text-gray-500;
            font-size: 0.875rem;
            font-weight: normal;
            padding-left: 0.5rem;
        }
    }
    .title {
        @apply text-gray-900;
        font-size: 1rem;
        text-transform: capitalize;
    }
    &.selected {
        .count {
            @apply text-white;
            .number {
                @apply text-white;
            }

            .dollar-sign {
                @apply text-white;
            }

            .suffix {
                @apply text-white;
                opacity: 1;
            }
        }

        .title {
            @apply text-white;
            font-weight: bold;
        }
    }
}

.content-wrapper {
    @apply bg-white rounded-lg grid grid-cols-12;
    position: relative;
    height: 17.5rem;
    grid-gap: 0.5rem;
    margin-top: 0.75rem;
    padding: 1.25rem 1.5rem;

    @screen tablet {
        height: 25rem;
    }

    @screen mobile {
        height: 27.5rem;
    }

    .title {
        font-size: 1rem;
        font-weight: bold;
        margin-bottom: 1rem;
        .suffix {
            font-size: 0.75rem;
            font-weight: normal;
            padding-left: 0.5rem;
        }
    }
    .chart-wrapper {
        position: relative;
        .toggle-button-group {
            position: absolute;
            right: 0.5rem;
            top: 0;
            .p-select-button {
                margin-right: 0.375rem;
                min-width: 2.4375rem;
            }
        }
        .chart {
            height: 13rem;
        }
    }
}
</style>
