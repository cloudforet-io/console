<script setup lang="ts">
import {
    computed, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { LineSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import { range } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PSelectButton, PCollapsibleToggle, PDataTable, PI, PIconButton, PSkeleton, PSelectDropdown, PLazyImg,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import { numberFormatter } from '@cloudforet/utils';

import { i18n } from '@/translations';

import { CURRENCY } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { getWidgetDateFields } from '@/common/modules/widgets/_helpers/widget-date-helper';

import { GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';


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
        const targetDataSource = storeState.dataSourceMap[state.selectedDataSourceId ?? ''];
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
    chart: null as EChartsType | null,
    chartData: [],
    xAxisData: [],
    chartOptions: computed<LineSeriesOption>(() => ({
        legend: {
            show: false,
        },
        tooltip: {
            trigger: 'axis',
            valueFormatter: (val) => numberFormatter(val) || '',
        },
        grid: {
            top: 10,
            bottom: 20,
        },
        xAxis: {
            type: 'category',
            data: chartState.xAxisData,
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (val) => numberFormatter(val, { notation: 'compact' }),
            },
        },
        series: chartState.chartData,
    })),
    dateRange: computed(() => {
        let start = dayjs.utc().subtract(DAY_COUNT - 1, 'day').format('YYYY-MM-DD');
        let end = dayjs.utc().format('YYYY-MM-DD');
        if (state.selectedDateType === 'MONTHLY') {
            start = dayjs.utc().subtract(MONTH_COUNT - 1, 'month').format('YYYY-MM');
            end = dayjs.utc().format('YYYY-MM');
        }
        return { start, end };
    }),
});

/* Api */
const costAnalyzeQueryHelper = new QueryHelper();
const fetchTrendData = async (dataSourceId: string) => {
    try {
        state.loading = true;
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
                start: chartState.dateRange.start,
                end: chartState.dateRange.end,
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
const drawChart = (rawData) => {
    if (!rawData.length) return;
    chartState.xAxisData = getWidgetDateFields(state.selectedDateType, chartState.dateRange.start, chartState.dateRange.end);
    const _seriesData: number[] = [];
    chartState.xAxisData.forEach((date) => {
        const data = rawData.find((d) => d.date === date);
        _seriesData.push(data?.value_sum || 0);
    });
    chartState.chartData = {
        name: 'Cost',
        type: 'line',
        data: _seriesData,
    };
    chartState.chart = init(chartContext.value);
    chartState.chart.setOption(chartState.chartOptions, true);
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
watch([() => state.data, () => chartContext.value], async ([data, _chartContext]) => {
    if (_chartContext) drawChart(data);
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
                    <p-skeleton v-if="state.loading"
                                width="100%"
                                height="100%"
                    />
                    <div v-else
                         ref="chartContext"
                         class="chart"
                    />
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
            width: 100%;
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
