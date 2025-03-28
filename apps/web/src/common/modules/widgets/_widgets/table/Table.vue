<script setup lang="ts">
import {
    defineExpose, reactive, computed, watch, onMounted,
} from 'vue';

import { useQueries } from '@tanstack/vue-query';
import { sortBy } from 'lodash';

import type { Sort } from '@cloudforet/core-lib/space-connector/type';
import { PPagination } from '@cloudforet/mirinae';

import type { WidgetLoadParams, WidgetLoadResponse, WidgetLoadSumParams } from '@/api-clients/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFormQuery } from '@/common/modules/widgets/_composables/use-widget-form-query';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import { WIDGET_LOAD_STALE_TIME } from '@/common/modules/widgets/_constants/widget-constant';
import { SUB_TOTAL_NAME } from '@/common/modules/widgets/_constants/widget-field-constant';
import {
    normalizeAndSerializeVars,
} from '@/common/modules/widgets/_helpers/global-variable-helper';
import type { CustomTableColumnWidthValue } from '@/common/modules/widgets/_widget-fields/custom-table-column-width/type';
import type { DataFieldHeatmapColorValue } from '@/common/modules/widgets/_widget-fields/data-field-heatmap-color/type';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type { MissingValueValue } from '@/common/modules/widgets/_widget-fields/missing-value/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { SubTotalValue } from '@/common/modules/widgets/_widget-fields/sub-total/type';
import type { TableColumnComparisonValue } from '@/common/modules/widgets/_widget-fields/table-column-comparison/type';
import type { TableColumnWidthValue } from '@/common/modules/widgets/_widget-fields/table-column-width/type';
import type { TextWrapValue } from '@/common/modules/widgets/_widget-fields/text-wrap/type';
import type { TotalValue } from '@/common/modules/widgets/_widget-fields/total/type';
import WidgetDataTable from '@/common/modules/widgets/_widgets/table/_component/WidgetDataTable.vue';
import type { DataTableModel, TableWidgetField } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    TableDataItem,
} from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';
import type { DataInfo } from '@/common/modules/widgets/types/widget-model';


const REFERENCE_FIELDS = ['Project', 'Workspace', 'Region', 'Service Account'];

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { keys, api } = useWidgetFormQuery({
    widgetId: computed(() => props.widgetId),
    preventLoad: true,
});

const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange?.value as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
});

const state = reactive({
    isPrivateWidget: computed<boolean>(() => props.widgetId.startsWith('private')),
    pageSize: computed<number>(() => (props.size === 'full' ? 30 : 10)),
    thisPage: 1 as number,
    sortBy: [] as Sort[],
    dataTable: undefined as DataTableModel|undefined,
    dataInfo: computed<DataInfo|undefined>(() => state.dataTable?.data_info),
    tableFields: computed<TableWidgetField[]>(() => {
        const labelFields: TableWidgetField[] = (widgetOptionsState.groupByInfo?.data as string[] ?? []).map(
            (field) => ({ name: field, label: field, fieldInfo: { type: 'labelField', additionalType: field === 'Date' ? 'dateFormat' : undefined } }),
        ) ?? [];
        const dataFields: TableWidgetField[] = [];
        if (state.isPivotDataTable && refinedData.value) {
            const headers = refinedData.value?.order ?? [];
            const _dataFields: string[] = Object.keys(refinedData.value.data_info ?? {});
            const columnFieldName = state.dataTable?.options?.PIVOT?.fields?.column;
            sortBy(_dataFields, (field) => {
                const index = headers.indexOf(field);
                return index === -1 ? Infinity : index;
            })
                .filter((field) => (widgetOptionsState.subTotalInfo?.toggleValue ? true : field !== SUB_TOTAL_NAME))
                .forEach((field) => {
                    dataFields.push({
                        name: field,
                        label: field,
                        fieldInfo: {
                            type: 'dataField',
                            unit: state.dataInfo?.[field]?.unit,
                            reference: (columnFieldName && REFERENCE_FIELDS.includes(columnFieldName)) ? columnFieldName : undefined,
                        },
                    });
                });
        } else {
            const comparisonFields = widgetOptionsState.tableColumnComparisonInfo?.fields ?? [];

            (widgetOptionsState.dataFieldInfo?.data as string[] || [])
                .forEach((field) => {
                    dataFields.push({
                        name: field,
                        label: field,
                        fieldInfo: {
                            type: 'dataField',
                            additionalType: comparisonFields.includes(field) ? 'comparison' : undefined,
                            unit: state.dataInfo?.[field]?.unit,
                        },
                    });
                });
        }
        const basicFields = [...labelFields, ...dataFields];
        return basicFields;
    }),
    isPivotDataTable: computed<boolean>(() => state.dataTable?.operator === DATA_TABLE_OPERATOR.PIVOT),
    dataTableLoading: false,
});

const widgetOptionsState = reactive({
    tableColumnComparisonInfo: computed<TableColumnComparisonValue>(() => props.widgetOptions?.tableColumnComparison?.value as TableColumnComparisonValue),
    totalInfo: computed<TotalValue>(() => props.widgetOptions?.total?.value as TotalValue),
    subTotalInfo: computed<SubTotalValue|undefined>(() => props.widgetOptions?.subTotal?.value as SubTotalValue),
    needFullDataFetch: computed<boolean>(() => state.totalInfo?.toggleValue),
    granularityInfo: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
    groupByInfo: computed<GroupByValue>(() => props.widgetOptions?.groupBy?.value as GroupByValue),
    dataFieldInfo: computed<DataFieldValue>(() => props.widgetOptions?.dataField?.value as DataFieldValue),
    dateFormatInfo: computed<DateFormatValue|undefined>(() => props.widgetOptions?.dateFormat?.value as DateFormatValue),
    numberFormatInfo: computed<NumberFormatValue|undefined>(() => props.widgetOptions?.numberFormat?.value as NumberFormatValue),
    dataFieldHeatmapColorInfo: computed<DataFieldHeatmapColorValue|undefined>(() => props.widgetOptions?.dataFieldHeatmapColor?.value as DataFieldHeatmapColorValue),
    textWrapInfo: computed<TextWrapValue>(() => props.widgetOptions?.textWrap?.value as TextWrapValue),
    tableColumnWidthInfo: computed<TableColumnWidthValue|undefined>(() => props.widgetOptions?.tableColumnWidth?.value as TableColumnWidthValue),
    customTableColumnWidthInfo: computed<CustomTableColumnWidthValue|undefined>(() => props.widgetOptions?.customTableColumnWidth?.value as CustomTableColumnWidthValue),
    missingValueInfo: computed<MissingValueValue|undefined>(() => props.widgetOptions?.missingValue?.value as MissingValueValue),
});

const getTableDefaultSortBy = (_sortBy: Sort[]) => {
    if (!!_sortBy.length || !widgetOptionsState.dataFieldInfo?.data?.length) return _sortBy;
    if (state.isPivotDataTable) return [{ key: 'Sub Total', desc: true }];
    const defaultSortBy = [{ key: (widgetOptionsState.dataFieldInfo?.data as string[])?.[0], desc: true }];
    return defaultSortBy;
};
const fetchWidgetData = async (params: WidgetLoadParams): Promise<WidgetLoadResponse> => {
    const defaultFetcher = state.isPrivateWidget
        ? api.privateWidgetAPI.load
        : api.publicWidgetAPI.load;
    const res = await defaultFetcher(params);
    return res;
};

const fetchWidgetSumData = async (params: WidgetLoadSumParams): Promise<WidgetLoadResponse> => {
    const defaultFetcher = state.isPrivateWidget
        ? api.privateWidgetAPI.loadSum
        : api.publicWidgetAPI.loadSum;
    const res = await defaultFetcher(params);
    return res;
};

const baseQueryKey = computed(() => [
    ...(state.isPrivateWidget ? keys.privateWidgetLoadQueryKey.value : keys.publicWidgetLoadQueryKey.value),
    props.dashboardId,
    props.widgetId,
    props.widgetName,
    {
        start: dateRange.value.start,
        end: dateRange.value.end,
        sort: state.sortBy,
        page: state.thisPage,
        pageSize: state.pageSize,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        groupBy: widgetOptionsState.groupByInfo?.data,
        dataTableId: props.dataTableId,
        // dataTableOptions: normalizeAndSerializeDataTableOptions(state.dataTable?.options || {}),
        // dataTables: normalizeAndSerializeDataTableOptions((props.dataTables || []).map((d) => d?.options || {})),
        vars: normalizeAndSerializeVars(props.dashboardVars),
    },
]);

const fullDataQueryKey = computed(() => [
    ...(state.isPrivateWidget ? keys.privateWidgetLoadSumQueryKey.value : keys.publicWidgetLoadSumQueryKey.value),
    props.dashboardId,
    props.widgetId,
    props.widgetName,
    {
        start: dateRange.value.start,
        end: dateRange.value.end,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        dataTableId: props.dataTableId,
        // dataTableOptions: normalizeAndSerializeDataTableOptions(state.dataTable?.options || {}),
        // dataTables: normalizeAndSerializeDataTableOptions((props.dataTables || []).map((d) => d?.options || {})),
        enabledTotal: !!widgetOptionsState.totalInfo?.toggleValue,
        vars: normalizeAndSerializeVars(props.dashboardVars),
    },
]);

const queryResults = useQueries({
    queries: [
        {
            queryKey: baseQueryKey,
            queryFn: () => fetchWidgetData({
                widget_id: props.widgetId,
                start: dateRange.value.start,
                end: dateRange.value.end,
                sort: getTableDefaultSortBy(state.sortBy),
                page: {
                    start: (state.pageSize * (state.thisPage - 1)) + 1,
                    limit: state.pageSize,
                },
                group_by: (widgetOptionsState.groupByInfo?.data as string[]) ?? [],
                vars: props.dashboardVars,
                granularity: widgetOptionsState.granularityInfo?.granularity,
            }),
            enabled: computed<boolean>(() => {
                const widgetActive = props.widgetState !== 'INACTIVE';
                const dataTableReady = !!state.dataTable;
                const loadDisabled = props.loadDisabled;
                return widgetActive && dataTableReady && !loadDisabled;
            }),
            staleTime: WIDGET_LOAD_STALE_TIME,
        },
        {
            queryKey: fullDataQueryKey,
            queryFn: () => fetchWidgetSumData({
                widget_id: props.widgetId,
                start: dateRange.value.start,
                end: dateRange.value.end,
                vars: props.dashboardVars,
                granularity: widgetOptionsState.granularityInfo?.granularity,
            }),
            enabled: computed<boolean>(() => {
                const widgetActive = props.widgetState !== 'INACTIVE';
                const dataTableReady = !!state.dataTable;
                const totalEnabled = !!widgetOptionsState.totalInfo?.toggleValue;
                const loadDisabled = props.loadDisabled;

                return widgetActive && dataTableReady && totalEnabled && !loadDisabled;
            }),
            staleTime: WIDGET_LOAD_STALE_TIME,
        },
    ],
});

const widgetLoading = computed<boolean>(() => queryResults.value?.[0].isFetching || queryResults.value?.[1].isFetching || state.dataTableLoading);
const errorMessage = computed<string>(() => {
    if (!state.dataTable) return i18n.t('COMMON.WIDGETS.NO_DATA_TABLE_ERROR_MESSAGE');
    return queryResults.value?.[0].error?.message as string || queryResults.value?.[1].error?.message as string;
});


const refinedData = computed<WidgetLoadResponse|null>(() => {
    const data = queryResults.value?.[0].data;
    const totalData = queryResults.value?.[1].data;

    if (!data) return null;

    let refinedResults: TableDataItem[] = [];
    (data.results ?? []).forEach((d) => {
        // Basic Data
        const dataItem = { ...d };

        refinedResults = [
            ...refinedResults,
            dataItem,
        ];
        return dataItem;
    });
    if (widgetOptionsState.totalInfo?.toggleValue) {
        const totalRowItem: TableDataItem = {
            [widgetOptionsState.groupByInfo?.data?.[0] ?? '']: 'Total',
            ...(totalData?.results?.length ? totalData?.results[0] : {}),
        };
        refinedResults = [...refinedResults, totalRowItem];
    }

    return { ...data, results: refinedResults };
});

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage,
    widgetLoading,
    noData: computed(() => (queryResults.value?.[0].data ? !(queryResults.value?.[0].data?.results?.length) : false)),
});

const handleUpdateThisPage = async (newPage: number) => {
    state.thisPage = newPage;
};

watch(() => props.dataTableId, async (newDataTableId) => {
    if (!newDataTableId) return;
    state.dataTableLoading = true;
    const fetcher = state.isPrivateWidget
        ? api.privateDataTableAPI.get
        : api.publicDataTableAPI.get;
    try {
        state.dataTable = await fetcher({ data_table_id: newDataTableId });
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.dataTableLoading = false;
    }
}, { immediate: true });
defineExpose<WidgetExpose>({
    loadWidget: () => {
        queryResults.value?.[0].refetch();
        queryResults.value?.[1].refetch();
    },
});
onMounted(() => {
    emit('mounted', props.widgetName);
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
                                   :items="refinedData?.results"
                                   :data-field="widgetOptionsState.dataFieldInfo?.data"
                                   :table-column-comparison-info="widgetOptionsState.tableColumnComparisonInfo"
                                   :sub-total-info="widgetOptionsState.subTotalInfo"
                                   :total-info="widgetOptionsState.totalInfo"
                                   :granularity="widgetOptionsState.granularityInfo?.granularity"
                                   :is-pivot-data-table="state.isPivotDataTable"
                                   :data-table="state.dataTable"
                                   :data-info="state.dataInfo"
                                   :date-format-info="widgetOptionsState.dateFormatInfo"
                                   :number-format-info="widgetOptionsState.numberFormatInfo"
                                   :data-field-heatmap-color-info="widgetOptionsState.dataFieldHeatmapColorInfo"
                                   :text-wrap-info="widgetOptionsState.textWrapInfo"
                                   :table-column-width-info="widgetOptionsState.tableColumnWidthInfo"
                                   :custom-table-column-width-info="widgetOptionsState.customTableColumnWidthInfo"
                                   :missing-value-info="widgetOptionsState.missingValueInfo"
                                   :sort-by.sync="state.sortBy"
                                   :this-page.sync="state.thisPage"
                />
            </div>
            <div class="table-pagination-wrapper">
                <p-pagination :this-page="state.thisPage"
                              :page-size="state.pageSize"
                              :total-count="refinedData?.total_count ?? 0"
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
