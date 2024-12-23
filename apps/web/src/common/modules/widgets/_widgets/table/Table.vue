<script setup lang="ts">
import {
    defineExpose, reactive, computed, onMounted,
} from 'vue';

import { useQueries } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Sort } from '@cloudforet/core-lib/space-connector/type';
import { PPagination } from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PrivateWidgetLoadSumParameters } from '@/schema/dashboard/private-widget/api-verbs/load-sum';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';
import type { PublicWidgetLoadSumParameters } from '@/schema/dashboard/public-widget/api-verbs/load-sum';

import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { WIDGET_LOAD_STALE_TIME } from '@/common/modules/widgets/_constants/widget-constant';
import { sortObjectByKeys } from '@/common/modules/widgets/_helpers/widget-data-table-helper';
import {
    getPreviousDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { getWidgetDataTable } from '@/common/modules/widgets/_helpers/widget-helper';
import type { ComparisonValue } from '@/common/modules/widgets/_widget-fields/comparison/type';
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
    runQueries: false,
    isPrivateWidget: computed<boolean>(() => props.widgetId.startsWith('private')),
    pageSize: computed<number>(() => (props.size === 'full' ? 30 : 10)),
    thisPage: 1 as number,
    sortBy: [] as Sort[],
    dataTable: undefined as PublicDataTableModel|PrivateDataTableModel|undefined,
    comparisonDateRange: computed<DateRange>(() => getPreviousDateRange(widgetOptionsState.granularityInfo?.granularity, dateRange.value)),
    isComparisonEnabled: computed<boolean>(() => !!(widgetOptionsState.comparisonInfo?.toggleValue)),
    dataInfo: computed<DataInfo|undefined>(() => state.dataTable?.data_info),
    tableFields: computed<TableWidgetField[]>(() => {
        const labelFields: TableWidgetField[] = (widgetOptionsState.groupByInfo?.data ?? []).map(
            (field) => ({ name: field, label: field, fieldInfo: { type: 'labelField', additionalType: field === 'Date' ? 'dateFormat' : undefined } }),
        ) ?? [];
        const dataFields: TableWidgetField[] = [];

        widgetOptionsState.dataFieldInfo?.data?.forEach((field) => {
            dataFields.push({
                name: field,
                label: field,
                fieldInfo: {
                    type: 'dataField',
                    unit: state.dataInfo?.[field]?.unit,
                },
            });
            if (widgetOptionsState.comparisonInfo?.format && state.isComparisonEnabled) {
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
});

const widgetOptionsState = reactive({
    comparisonInfo: computed<ComparisonValue>(() => props.widgetOptions?.comparison?.value as ComparisonValue),
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



const fetchWidgetData = async (params: PrivateWidgetLoadParameters|PublicWidgetLoadParameters): Promise<Data> => {
    const defaultFetcher = state.isPrivateWidget
        ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
        : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
    const res = await defaultFetcher(params);
    return res;
};

const fetchWidgetSumData = async (params: PrivateWidgetLoadSumParameters|PublicWidgetLoadSumParameters): Promise<Data> => {
    const defaultFetcher = state.isPrivateWidget
        ? SpaceConnector.clientV2.dashboard.privateWidget.loadSum<PrivateWidgetLoadSumParameters, Data>
        : SpaceConnector.clientV2.dashboard.publicWidget.loadSum<PublicWidgetLoadSumParameters, Data>;
    const res = await defaultFetcher(params);
    return res;
};

const baseQueryKey = computed(() => [
    'widget-load-table',
    props.widgetId,
    {
        start: dateRange.value.start,
        end: dateRange.value.end,
        sort: state.sortBy,
        page: state.thisPage,
        pageSize: state.pageSize,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        dataTableId: state.dataTable?.data_table_id,
        dataTableOptions: JSON.stringify(sortObjectByKeys(state.dataTable?.options) ?? {}),
        enabledLoad: state.runQueries,
    },
]);

const fullDataQueryKey = computed(() => [
    'widget-load-table-sum',
    props.widgetId,
    {
        start: dateRange.value.start,
        end: dateRange.value.end,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        dataTableId: state.dataTable?.data_table_id,
        dataTableOptions: JSON.stringify(sortObjectByKeys(state.dataTable?.options) ?? {}),
        enabledTotal: !!widgetOptionsState.totalInfo?.toggleValue,
        enabledLoad: state.runQueries,
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
                sort: state.sortBy,
                page: {
                    start: (state.pageSize * (state.thisPage - 1)) + 1,
                    limit: state.pageSize,
                },
                vars: props.dashboardVars,
                granularity: widgetOptionsState.granularityInfo?.granularity,
            }),
            enabled: computed<boolean>(() => {
                const loadEnabled = state.runQueries;
                const widgetActive = props.widgetState !== 'INACTIVE';
                const dataTableReady = !!state.dataTable;
                return loadEnabled && widgetActive && dataTableReady;
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
                const loadEnabled = state.runQueries;
                const widgetActive = props.widgetState !== 'INACTIVE';
                const dataTableReady = !!state.dataTable;
                const totalEnabled = !!widgetOptionsState.totalInfo?.toggleValue;
                return loadEnabled && widgetActive && dataTableReady && totalEnabled;
            }),
            staleTime: WIDGET_LOAD_STALE_TIME,
        },
    ],
});

const loading = computed(() => queryResults.value?.[0].isLoading);
const errorMessage = computed(() => queryResults.value?.[0].error?.message);


const refinedData = computed<Data>(() => {
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
        };
        [...(totalData?.results ?? [])].forEach((d) => {
            const fieldKey = Object.keys(d)[0];
            totalRowItem[fieldKey] = d[fieldKey];
        });
        refinedResults = [...refinedResults, totalRowItem];
    }

    return { ...data, results: refinedResults };
});

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage: errorMessage.value,
    widgetLoading: loading.value,
    noData: computed(() => (refinedData.value ? !(refinedData.value.results?.length) : false)),
});

const handleUpdateThisPage = async (newPage: number) => {
    state.thisPage = newPage;
};

const loadWidget = async () => {
    state.runQueries = true;
};

useWidgetInitAndRefresh({ props, emit, loadWidget });

onMounted(async () => {
    if (!props.dataTableId) return;
    state.dataTable = await getWidgetDataTable(props.dataTableId);
});
defineExpose<WidgetExpose>({
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
                                   :items="refinedData?.results"
                                   :data-field="widgetOptionsState.dataFieldInfo?.data"
                                   :comparison-info="widgetOptionsState.comparisonInfo"
                                   :sub-total-info="widgetOptionsState.subTotalInfo"
                                   :total-info="widgetOptionsState.totalInfo"
                                   :granularity="widgetOptionsState.granularityInfo?.granularity"
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
