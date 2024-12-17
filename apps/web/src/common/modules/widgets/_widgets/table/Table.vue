<script setup lang="ts">
import {
    defineExpose, reactive, computed, watch, onMounted,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import type { CancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { PPagination } from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import {
    getPreviousDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { getWidgetDataTable } from '@/common/modules/widgets/_helpers/widget-helper';
import type { ComparisonValue } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type { CustomTableColumnWidthValue } from '@/common/modules/widgets/_widget-fields/custom-table-column-width/type';
import type { DataFieldHeatmapColorValue } from '@/common/modules/widgets/_widget-fields/data-field-heatmap-color/type';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { _DateFormatValue as DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { _GroupByValue as GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type { _MissingValueValue as MissingValueValue } from '@/common/modules/widgets/_widget-fields/missing-value/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { TableColumnWidthValue } from '@/common/modules/widgets/_widget-fields/table-column-width/type';
import type { TextWrapValue } from '@/common/modules/widgets/_widget-fields/text-wrap/type';
import type { TotalValue } from '@/common/modules/widgets/_widget-fields/total/type';
import WidgetDataTable from '@/common/modules/widgets/_widgets/table/_component/WidgetDataTable.vue';
import type { TableWidgetField } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    DateRange, TableDataItem,
} from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';
import type { DataInfo } from '@/common/modules/widgets/types/widget-model';


type Data = ListResponse<TableDataItem>;

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange?.value as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
});

const state = reactive({
    loading: false,
    isPrivateWidget: computed(() => props.widgetId.startsWith('private')),
    errorMessage: undefined as string|undefined,
    data: null as Data | null,
    fullPageData: null as Data | null,
    comparisonData: null as Data | null,
    fullPageComparisonData: null as Data | null,
    dataTable: undefined as PublicDataTableModel|PrivateDataTableModel|undefined,
    // converted data
    finalConvertedData: computed<Data|null>(() => {
        if (!state.data) return null;
        return state.staticFieldSlicedData;
    }),
    staticFieldSlicedData: null as Data | null,
    timeSeriesDynamicFieldSlicedData: null as Data | null,
    noneTimeSeriesDynamicFieldSlicedData: null as Data | null,
    // data fetch options
    granularityInfo: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
    basedOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    dateRangeField: computed<DateRangeValue|undefined>(() => props.widgetOptions?.dateRange?.value as DateRangeValue),
    dataFieldInfo: computed<DataFieldValue>(() => props.widgetOptions?.dataField?.value as DataFieldValue),
    groupByInfo: computed<GroupByValue>(() => props.widgetOptions?.groupBy?.value as GroupByValue),
    comparisonDateRange: computed<DateRange>(() => getPreviousDateRange(state.granularityInfo?.granularity, dateRange.value)),
    // data for optional fields
    isComparisonEnabled: computed<boolean>(() => !isDateField(state.tableDataField) && !state.groupByInfo?.data?.some((groupBy) => Object.values(DATE_FIELD).includes(groupBy))),
    comparisonInfo: computed<ComparisonValue|undefined>(() => props.widgetOptions?.comparison?.value as ComparisonValue),
    subTotalInfo: computed<TotalValue|undefined>(() => props.widgetOptions?.subTotal?.value as TotalValue),
    totalInfo: computed<TotalValue|undefined>(() => props.widgetOptions?.total?.value as TotalValue),
    dateFormatInfo: computed<DateFormatValue|undefined>(() => props.widgetOptions?.dateFormat?.value as DateFormatValue),
    numberFormatInfo: computed<NumberFormatValue|undefined>(() => props.widgetOptions?.numberFormat?.value as NumberFormatValue),
    dataFieldHeatmapColorInfo: computed<DataFieldHeatmapColorValue|undefined>(() => props.widgetOptions?.dataFieldHeatmapColor?.value as DataFieldHeatmapColorValue),
    textWrapInfo: computed<TextWrapValue>(() => props.widgetOptions?.textWrap?.value as TextWrapValue),
    tableColumnWidthInfo: computed<TableColumnWidthValue|undefined>(() => props.widgetOptions?.tableColumnWidth?.value as TableColumnWidthValue),
    customTableColumnWidthInfo: computed<CustomTableColumnWidthValue|undefined>(() => props.widgetOptions?.customTableColumnWidth?.value as CustomTableColumnWidthValue),
    missingValueInfo: computed<MissingValueValue|undefined>(() => props.widgetOptions?.missingValue?.value as MissingValueValue),
    // table
    tableFields: computed<TableWidgetField[]>(() => {
        const labelFields: TableWidgetField[] = (state.groupByInfo?.data ?? []).map(
            (field) => ({ name: field, label: field, fieldInfo: { type: 'labelField', additionalType: field === 'Date' ? 'dateFormat' : undefined } }),
        ) ?? [];
        const dataFields: TableWidgetField[] = [];

        state.dataFieldInfo?.data?.forEach((field) => {
            dataFields.push({
                name: field,
                label: field,
                fieldInfo: {
                    type: 'dataField',
                    unit: state.dataInfo?.[field]?.unit,
                },
            });
            if (state.comparisonInfo?.format && state.isComparisonEnabled) {
                dataFields.push({
                    name: `comparison_${field}`,
                    label: field,
                    fieldInfo: {
                        type: 'dataField',
                        additionalType: 'comparison',
                        unit: state.dataInfo?.[field]?.unit,
                    },
                });
            }
        });
        const basicFields = [...labelFields, ...dataFields];
        return basicFields;
    }),
    dataInfo: computed<DataInfo|undefined>(() => state.dataTable?.data_info),
    sortBy: [],
    thisPage: 1,
    pageSize: computed<number>(() => (props.size === 'full' ? 30 : 10)),
    allPage: computed(() => {
        const totalCount = state.data?.total_count ?? 0;
        return Math.ceil(totalCount / state.pageSize) || 1;
    }),
});

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
    noData: computed(() => (state.data ? !state.data.results?.length : false)),
});

/* Helper */
const getTotalDataItem = (data: TableDataItem[]): TableDataItem => {
    const hasComparisonInfo = state.comparisonInfo?.format;

    const totalDataItem: TableDataItem = {};
    if ((state.groupByInfo?.data ?? []).length) totalDataItem[(state.groupByInfo?.data ?? [])[0]] = 'Total';
    const _tableDataField = state.dataFieldInfo?.data ?? [];
    [..._tableDataField, 'sub_total'].forEach((field) => {
        totalDataItem[field] = data.reduce((acc, cur) => acc + cur[field], 0);
        if (field !== 'sub_total' && hasComparisonInfo) {
            const comparisionFieldName = `comparison_${field}`;
            totalDataItem[comparisionFieldName] = {
                target: totalDataItem[field],
                subject: data.reduce((acc, cur) => acc + cur[comparisionFieldName].subject, 0),
            };
        }
    });
    return totalDataItem;
};


const fetchWidget = async (
    loadFetcher: CancellableFetcher<PrivateWidgetLoadParameters|PublicWidgetLoadParameters, Data>,
    options: { isComparison?: boolean, fullDataFetch?: boolean },
): Promise<Data|APIErrorToast|undefined> => {
    const { isComparison, fullDataFetch } = options;
    if (props.widgetState === 'INACTIVE') return undefined;
    try {
        state.loading = true;
        const _sort: PublicWidgetLoadParameters['sort'] = [];
        const sortAndPageQuery = fullDataFetch ? {} : {
            sort: state.sortBy.length ? state.sortBy : _sort,
            page: {
                start: (state.pageSize * (state.thisPage - 1)) + 1,
                limit: state.pageSize,
            },
        };

        const { status, response } = await loadFetcher({
            widget_id: props.widgetId,
            granularity: state.granularityInfo?.granularity,
            start: isComparison ? state.comparisonDateRange.start : dateRange.value.start,
            end: isComparison ? state.comparisonDateRange.end : dateRange.value.end,
            ...sortAndPageQuery,
            vars: props.dashboardVars,
        });

        if (status === 'succeed') {
            state.errorMessage = undefined;
            return response;
        }
        return undefined;
    } catch (e: any) {
        state.errorMessage = e.message;
        ErrorHandler.handleError(e);
        return ErrorHandler.makeAPIErrorToast(e);
    } finally {
        state.loading = false;
    }
};

const defaultFetcher = state.isPrivateWidget ? SpaceConnector.clientV2.dashboard.privateWidget.load : SpaceConnector.clientV2.dashboard.publicWidget.load;
const widgetBaseLoadFetcher = getCancellableFetcher<PrivateWidgetLoadParameters|PublicWidgetLoadParameters, Data>(defaultFetcher);
const widgetComparisonLoadFetcher = getCancellableFetcher<PrivateWidgetLoadParameters|PublicWidgetLoadParameters, Data>(defaultFetcher);
const widgetFullDataLoadFetcher = getCancellableFetcher<PrivateWidgetLoadParameters|PublicWidgetLoadParameters, Data>(defaultFetcher);
const widgetFullDataComparisonLoadFetcher = getCancellableFetcher<PrivateWidgetLoadParameters|PublicWidgetLoadParameters, Data>(defaultFetcher);

const loadWidget = async (manualLoad?: boolean): Promise<Data|APIErrorToast> => {
    if (!manualLoad) {
        state.sortBy = [];
        state.thisPage = 1;
    }

    const res = await fetchWidget(widgetBaseLoadFetcher, {});
    if (res === undefined) return state.data;
    const comparisonRes = state.isComparisonEnabled && state.comparisonInfo?.format ? await fetchWidget(widgetComparisonLoadFetcher, { isComparison: true }) : null;
    if (comparisonRes === undefined) return state.data;
    if (typeof res === 'function') return res;
    state.data = res;
    state.comparisonData = comparisonRes;

    if (state.totalInfo?.toggleValue) {
        const fullDataRes = await fetchWidget(widgetFullDataLoadFetcher, { fullDataFetch: true });
        if (fullDataRes === undefined) return state.data;
        const fullDataComparisonRes = state.isComparisonEnabled && state.comparisonInfo?.format
            ? await fetchWidget(widgetFullDataComparisonLoadFetcher, { isComparison: true, fullDataFetch: true })
            : null;
        if (fullDataComparisonRes === undefined) return state.data;
        state.fullPageData = fullDataRes;
        state.fullPageComparisonData = fullDataComparisonRes;
    }

    return state.data;
};

const handleManualLoadWidget = async () => {
    await loadWidget(true);
};
const handleUpdateThisPage = async (_thisPage: number) => {
    state.thisPage = _thisPage;
    await loadWidget(true);
};

watch([() => props.size], async () => {
    await loadWidget(true);
});

// Data Converting
watch([() => state.data, () => state.fullPageData], ([data, fullPageData]) => {
    if (!data) return;
    const _fullPageDataResults = fullPageData?.results ?? [];

    const comparisonData = state.comparisonData?.results;
    const hasComparisonInfo = state.comparisonInfo?.format;
    const results = data.results.map((d, idx) => {
        // Basic Data
        const dataItem = { ...d };

        // Sub Total & Comparison Data
        let subTotalValue = 0;

        state.dataFieldInfo?.data?.forEach((field) => {
            const fieldValue = d[field] ?? 0;
            subTotalValue += fieldValue;

            if (hasComparisonInfo) {
                const comparisonValue = comparisonData?.[idx]?.[field] ?? 0;
                dataItem[`comparison_${field}`] = { target: dataItem[field], subject: comparisonValue };
            }
        });

        dataItem.sub_total = subTotalValue;
        return dataItem;
    });

    // Full Total Data
    if (state.totalInfo?.toggleValue) {
        const fullDataComparison = state.fullPageComparisonData?.results ?? [];
        const fullDataResults = _fullPageDataResults.map((d, idx) => {
            const dataItem = { ...d };
            let subTotalValue = 0;

            state.dataFieldInfo?.data?.forEach((field) => {
                const fieldValue = d[field] ?? 0;
                subTotalValue += fieldValue;

                if (hasComparisonInfo) {
                    const comparisonValue = fullDataComparison?.[idx]?.[field] ?? 0;
                    dataItem[`comparison_${field}`] = { target: dataItem[field], subject: comparisonValue };
                }
            });

            dataItem.sub_total = subTotalValue;
            return dataItem;
        });
        const fullTotalDataItem = getTotalDataItem(fullDataResults);
        results.push(fullTotalDataItem);
    }

    state.staticFieldSlicedData = { results };
}, { immediate: true });


onMounted(async () => {
    if (!props.dataTableId) return;
    state.dataTable = await getWidgetDataTable(props.dataTableId);
});
useWidgetInitAndRefresh({ props, emit, loadWidget });
defineExpose<WidgetExpose<Data>>({
    loadWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <!--Do not delete div element below. It's defense code for redraw-->
        <div class="h-full">
            <div class="table-wrapper">
                <widget-data-table class="data-table"
                                   :widget-id="props.widgetId"
                                   :fields="state.tableFields"
                                   :items="state.finalConvertedData?.results"
                                   :data-field="state.dataFieldInfo?.data"
                                   :comparison-info="state.comparisonInfo"
                                   :sub-total-info="state.subTotalInfo"
                                   :total-info="state.totalInfo"
                                   :granularity="state.granularityInfo?.granularity"
                                   :data-info="state.dataInfo"
                                   :date-format-info="state.dateFormatInfo"
                                   :number-format-info="state.numberFormatInfo"
                                   :data-field-heatmap-color-info="state.dataFieldHeatmapColorInfo"
                                   :text-wrap-info="state.textWrapInfo"
                                   :table-column-width-info="state.tableColumnWidthInfo"
                                   :custom-table-column-width-info="state.customTableColumnWidthInfo"
                                   :missing-value-info="state.missingValueInfo"
                                   :sort-by.sync="state.sortBy"
                                   :this-page.sync="state.thisPage"
                                   @load="handleManualLoadWidget"
                />
            </div>
            <div class="table-pagination-wrapper">
                <p-pagination :this-page="state.thisPage"
                              :page-size="state.pageSize"
                              :total-count="state.data?.total_count ?? 0"
                              size="sm"
                              @change="handleUpdateThisPage"
                />
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.table-wrapper {
    @apply flex justify-center w-full;
    max-height: calc(100% - 2.5rem);
    height: calc(100% - 2.5rem);

    overflow: hidden;
    .data-table {
        height: 100%;
    }
}
.table-pagination-wrapper {
    @apply flex justify-center items-center;
    height: 2.5rem;
    padding: 0.5rem 0;
}
</style>
