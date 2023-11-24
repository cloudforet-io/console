<script setup lang="ts">
import {
    computed, onUnmounted, reactive, ref, watch,
} from 'vue';

import {
    XYChart, CategoryAxis, ValueAxis, LineSeries, CircleBullet, XYCursor,
} from '@amcharts/amcharts4/charts';
import { create, color, LinearGradientModifier } from '@amcharts/amcharts4/core';
import {
    PSelectButton, PDataLoader, PCollapsibleToggle, PDataTable, PI, PIconButton, PSkeleton, PSelectDropdown, PLazyImg,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import dayjs from 'dayjs';
import { orderBy, range } from 'lodash';

import { numberFormatter } from '@cloudforet/core-lib';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';
import { CURRENCY } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import config from '@/lib/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    gray, safe, secondary, secondary1, green, blue,
} from '@/styles/colors';

import { GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';


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

interface Props {
    projectId: string;
}
const props = defineProps<Props>();

const allReferenceStore = useAllReferenceStore();
const chartContext = ref<HTMLElement | null>(null);
const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => allReferenceStore.getters.plugin),
    dataSourceMap: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource ?? {}),
});
const state = reactive({
    loading: true,
    chart: null as XYChart | null,
    skeletons: range(4),
    dateTypes: computed(() => ([
        { name: DATE_TYPE.daily, label: i18n.t('COMMON.WIDGETS.BILLING.DAY') },
        { name: DATE_TYPE.monthly, label: i18n.t('COMMON.WIDGETS.BILLING.MONTH') },
    ])),
    data: [],
    selectedDateType: DATE_TYPE.monthly,
    dataSourceMenuItems: computed<MenuItem[]>(() => Object.entries(storeState.dataSourceMap).map(([key, value]) => ({
        name: key,
        label: value?.name,
        imageUrl: storeState.plugins[value.data.plugin_info?.plugin_id]?.icon ? storeState.plugins[value.data.plugin_info?.plugin_id]?.icon : 'error',
    }))),
    selectedDataSourceId: undefined as undefined|string,
    currency: computed<Currency>(() => {
        const targetDataSource = allReferenceStore.getters.costDataSource[state.selectedDataSourceId ?? ''];
        if (!targetDataSource) return CURRENCY.USD;
        const currentCurrency = targetDataSource.data.plugin_info.metadata.currency;
        return currentCurrency ?? CURRENCY.USD;
    }),
});
const summaryState = reactive({
    pastDateText: computed(() => {
        if (state.selectedDateType === DATE_TYPE.monthly) return i18n.t('COMMON.WIDGETS.BILLING.LAST_MONTH');
        return i18n.t('COMMON.WIDGETS.BILLING.TWO_DAYS_AGO');
    }),
    currentDateText: computed(() => {
        if (state.selectedDateType === DATE_TYPE.monthly) return i18n.t('COMMON.WIDGETS.BILLING.THIS_MONTH');
        return i18n.t('COMMON.WIDGETS.BILLING.YESTERDAY');
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
    isCollapsed: true,
    loading: true,
    fields: computed(() => {
        const fields: any = [];
        const timeUnit = state.selectedDateType === DATE_TYPE.monthly ? 'month' : 'day';
        const dateNameFormat = state.selectedDateType === DATE_TYPE.monthly ? 'YYYY-MM' : 'YYYY-MM-DD';
        const dateLabelFormat = state.selectedDateType === DATE_TYPE.monthly ? 'MMM/YYYY' : 'MM/DD/YYYY';
        let now = tableState.endDate.clone();

        const start = now.subtract(DATA_TABLE_COLUMN, timeUnit);
        while (now.isAfter(start, timeUnit)) {
            fields.unshift({
                name: now.format(dateNameFormat),
                label: now.format(dateLabelFormat),
            });
            now = now.subtract(1, timeUnit);
        }
        fields.unshift({ name: 'service', label: '' });
        return fields;
    }),
    data: [],
    refinedData: computed(() => {
        if (!tableState.data.length) return [];
        const data: any = [];
        tableState.data.forEach((d) => {
            const costData: Record<string, string> = {};
            // const timeUnit = state.selectedDateType === DATE_TYPE.monthly ? 'month' : 'day';
            // const dateFormat = state.selectedDateType === DATE_TYPE.monthly ? 'YYYY-MM' : 'YYYY-MM-DD';
            // const pastDate = dayjs.utc(d.date).subtract(1, timeUnit).format(dateFormat);
            // const pastCost = results.find((bd) => bd.date === pastDate)?.value_sum || 0;
            // costData[d.date] = {
            //     cost: currencyMoneyFormatter(d.value, { currency: state.currency }),
            // };
            // if (pastCost && pastCost < d.value_sum && (d.value_sum - pastCost) / Math.abs(pastCost) > 0.5) {
            //     costData[d.date].color = 'red';
            // }
            d.value_sum.forEach((cost) => {
                costData[cost.date] = currencyMoneyFormatter(cost.value, { currency: state.currency });
            });

            data.push({
                service: d.product,
                ...costData,
            });
        });
        return data;
    }),
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
    registry: {},
    data: computed(() => getRefinedChartData(state.data)),
});

/* util */
const disposeChart = (_chartContext) => {
    if (chartState.registry[_chartContext]) {
        chartState.registry[_chartContext].dispose();
        delete chartState.registry[_chartContext];
    }
};
const drawChart = (_chartContext) => {
    const createChart = () => {
        disposeChart(_chartContext);
        chartState.registry[_chartContext] = create(_chartContext, XYChart);
        return chartState.registry[_chartContext];
    };
    const chart = createChart();
    if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
    chart.paddingLeft = -5;
    chart.paddingBottom = -10;
    chart.paddingTop = 10;
    chart.data = chartState.data;

    const dateAxis = chart.xAxes.push(new CategoryAxis());
    dateAxis.dataFields.category = 'date';
    dateAxis.tooltip.disabled = true;
    dateAxis.renderer.minGridDistance = 40;
    dateAxis.renderer.labels.template.fill = color(gray[600]);
    dateAxis.fontSize = 11;

    const valueAxis = chart.yAxes.push(new ValueAxis());
    valueAxis.tooltip.disabled = true;
    valueAxis.renderer.minGridDistance = 30;
    valueAxis.renderer.labels.template.fill = color(secondary1);
    valueAxis.renderer.labels.template.adapter.add('text', (text, target) => numberFormatter(target.dataItem.value));
    valueAxis.fontSize = 11;
    valueAxis.extraMax = 0.25;

    const series = chart.series.push(new LineSeries());
    series.dataFields.categoryX = 'date';
    series.dataFields.valueY = 'value';
    series.stroke = color(secondary1);
    series.fill = color(secondary1);
    series.strokeWidth = 2;
    series.fillOpacity = 1;
    series.propertyFields.fill = 'color';
    series.propertyFields.stroke = 'color';
    series.propertyFields.strokeDasharray = 'dash';

    series.adapter.add('tooltipText', (text, target) => {
        if (target.tooltipDataItem && target.tooltipDataItem.dataContext) {
            return `[bold]${currencyMoneyFormatter(target.tooltipDataItem.dataContext.value, { notation: 'standard' })}`;
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

    const fillModifier = new LinearGradientModifier();
    fillModifier.opacities = [0.3, 0];
    fillModifier.offsets = [0, 0.5];
    fillModifier.gradient.rotation = 90;
    series.segments.template.fillModifier = fillModifier;

    const circleBullet = series.bullets.push(new CircleBullet());
    circleBullet.circle.strokeWidth = 0;
    circleBullet.fillOpacity = 0;
    circleBullet.circle.fill = color(secondary);
    circleBullet.circle.propertyFields.fill = 'tooltipTextColor';
    circleBullet.circle.propertyFields.stroke = 'tooltipTextColor';
    const circleBulletState = circleBullet.states.create('hover');
    circleBulletState.properties.fillOpacity = 1;
    circleBulletState.properties.strokeOpacity = 1;

    chart.cursor = new XYCursor();
    chart.cursor.lineX.strokeOpacity = 0;
    chart.cursor.lineY.strokeOpacity = 0;
    chart.cursor.behavior = 'none';

    state.chart = chart;
};

/* Api */
const costAnalyzeQueryHelper = new QueryHelper();
const fetchTrendData = async (dataSourceId: string) => {
    try {
        state.loading = true;
        let start = dayjs.utc().subtract(DAY_COUNT - 1, 'day').format('YYYY-MM-DD');
        let end = dayjs.utc().format('YYYY-MM-DD');
        if (state.selectedDateType === 'MONTHLY') {
            start = dayjs.utc().subtract(MONTH_COUNT - 1, 'month').format('YYYY-MM');
            end = dayjs.utc().format('YYYY-MM');
        }
        costAnalyzeQueryHelper.setFilters([{ k: 'project_id', v: props.projectId, o: '=' }]);
        const { results } = await SpaceConnector.clientV2.costAnalysis.cost.analyze({
            data_source_id: dataSourceId,
            query: {
                granularity: state.selectedDateType,
                fields: {
                    value_sum: {
                        key: 'cost',
                        operator: 'sum',
                    },
                },
                sort: [{ key: 'date', desc: false }],
                filter: costAnalyzeQueryHelper.apiQuery.filter,
                start,
                end,
            },
        });
        state.data = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.data = [];
    } finally {
        state.loading = false;
    }
};
const fetchTableData = async (dataSourceId: string) => {
    try {
        tableState.loading = true;
        const today = tableState.endDate;
        let start;
        let end;
        if (state.selectedDateType === DATE_TYPE.monthly) {
            start = today.subtract(MONTH_COUNT - 1, 'month').format('YYYY-MM');
            end = today.format('YYYY-MM');
        } else {
            start = today.subtract(DAY_COUNT - 1, 'day').format('YYYY-MM-DD');
            end = today.format('YYYY-MM-DD');
        }
        costAnalyzeQueryHelper.setFilters([{ k: 'project_id', v: props.projectId, o: '=' }]);
        const { results } = await SpaceConnector.clientV2.costAnalysis.cost.analyze({
            data_source_id: dataSourceId,
            query: {
                granularity: state.selectedDateType,
                group_by: [GROUP_BY.PRODUCT],
                fields: {
                    value_sum: {
                        key: 'cost',
                        operator: 'sum',
                    },
                },
                sort: [{ key: '_total_value_sum', desc: true }],
                field_group: ['date'],
                filter: costAnalyzeQueryHelper.apiQuery.filter,
                start,
                end,
            },
        });
        tableState.data = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        tableState.data = [];
    } finally {
        tableState.loading = false;
    }
};

/* Util */
const setCountData = (results) => {
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
    summaryState.pastCost = results.find((d) => d.date === start)?.value_sum || 0;
    summaryState.currentCost = results.find((d) => d.date === end)?.value_sum || 0;
};
const getRefinedChartData = (results): ChartData[] => {
    const dateFormat = state.selectedDateType === DATE_TYPE.monthly ? 'MMM' : 'MM/DD';
    let data;
    if (results.length > 0) {
        data = results.map((d) => ({
            date: dayjs(d.date),
            value: d.value_sum,
        }));
    } else {
        data = [];
    }

    const orderedData = orderBy(data, ['date'], ['asc']);
    return orderedData.map((d, index) => {
        let date;
        if (state.selectedDateType === DATE_TYPE.monthly && (d.date.format('M') === '1' || d.date.format('M') === '12')) {
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
    fetchTableData(state.selectedDataSourceId);
};
const handleChangeSelectedDataSourceId = (id: string) => {
    state.selectedDataSourceId = id;
};

/* Watcher */
watch(() => storeState.dataSourceMap, (dataSourceMap) => {
    if (dataSourceMap) {
        state.selectedDataSourceId = Object.keys(dataSourceMap)[0];
    }
}, { immediate: true });
watch([() => state.selectedDateType, () => state.selectedDataSourceId], async ([, dataSourceId]) => {
    if (dataSourceId) {
        await Promise.all([
            fetchTrendData(dataSourceId),
            fetchTableData(dataSourceId),
        ]);
        setCountData(state.data);
    }
}, { immediate: true });
watch([() => chartState.data, () => chartContext.value], async ([, _chartContext]) => {
    if (_chartContext) drawChart(_chartContext);
});

onUnmounted(() => {
    if (state.chart) state.chart.dispose();
});
</script>

<template>
    <div>
        <div class="title">
            <span>{{ $t('COMMON.WIDGETS.BILLING.TITLE') }}</span>
        </div>
        <div class="content-wrapper grid grid-cols-12 gap-2">
            <div class="col-span-12 title-wrapper">
                <div class="left-part">
                    <span class="title">{{ $t('COMMON.WIDGETS.BILLING.TREND_TITLE') }}</span>
                    <p-select-dropdown :menu="state.dataSourceMenuItems"
                                       :selected="state.selectedDataSourceId"
                                       style-type="transparent"
                                       size="sm"
                                       class="data-source-dropdown"
                                       @update:selected="handleChangeSelectedDataSourceId"
                    >
                        <template #dropdown-button="item">
                            <div class="selected-wrapper">
                                <p-lazy-img v-if="item && item.imageUrl"
                                            class="selected-icon"
                                            :src="item.imageUrl"
                                            width="1rem"
                                            height="1rem"
                                />
                                {{ item?.label }}
                            </div>
                        </template>
                    </p-select-dropdown>
                </div>
                <div class="right-part">
                    <p-select-button v-for="(d, idx) in state.dateTypes"
                                     :key="`date-${d.name}-${idx}`"
                                     :class="{'selected': state.selectedDateType === d.name}"
                                     style-type="gray"
                                     size="sm"
                                     @click="state.selectedDateType = d.name"
                    >
                        {{ d.label }}
                    </p-select-button>
                </div>
            </div>
            <div class="col-span-12 md:col-span-9">
                <div class="chart-wrapper">
                    <p-data-loader :loading="state.loading"
                                   :data="chartState.data"
                    >
                        <template #loader>
                            <p-skeleton width="100%"
                                        height="100%"
                            />
                        </template>
                        <div ref="chartContext"
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
                        <span v-if="summaryState.pastCost !== 0">{{ currencyMoneyFormatter(summaryState.pastCost, { currency: state.currency }) }}</span>
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
                            <span>{{ currencyMoneyFormatter(summaryState.currentCost, { currency: state.currency }) }}</span>
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
                    :items="tableState.isCollapsed ? tableState.refinedData.slice(0, 5) : tableState.refinedData"
                    :bordered="false"
                >
                    <template #th-service-format>
                        <span />
                    </template>
                    <!--                    <template v-for="field in tableState.fields"-->
                    <!--                              #[`col-${field.name}-format`]="{value}"-->
                    <!--                    >-->
                    <!--                        <template v-if="field.name !== 'service'">-->
                    <!--                            <span v-if="value"-->
                    <!--                                  :key="field.name"-->
                    <!--                                  :style="{ 'color': value.color }"-->
                    <!--                            >{{ value.cost }}</span>-->
                    <!--                            <span v-else-->
                    <!--                                  :key="field.name"-->
                    <!--                            >-</span>-->
                    <!--                        </template>-->
                    <!--                        <span v-else-->
                    <!--                              :key="field.name"-->
                    <!--                              class="col-service"-->
                    <!--                              :class="{'link-text': !!value.to.name }"-->
                    <!--                        >-->
                    <!--                            <span>{{ value.name }}</span>-->
                    <!--                        </span>-->
                    <!--                    </template>-->
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
    .title-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        .title {
            font-weight: bold;
            font-size: 0.875rem;
        }
        .right-part {
            .p-select-button {
                margin-right: 0.375rem;
                min-width: 2.4375rem;
            }
        }
    }
    .data-source-dropdown {
        margin-left: 1rem;
        .selected-wrapper {
            @apply flex items-center;

            .selected-icon {
                margin-right: 0.25rem;
                margin-top: 0.125rem;
                flex-shrink: 0;
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

        /* custom design-system component - p-data-loader */
        :deep(.p-data-loader) {
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
