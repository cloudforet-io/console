<script setup lang="ts">
import {
    defineExpose, reactive, computed, watch, onMounted,
} from 'vue';

import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import dayjs from 'dayjs';
import { orderBy, sortBy } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Query } from '@cloudforet/core-lib/space-connector/type';
import { PTextPagination } from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { Granularity } from '@/schema/dashboard/_types/widget-type';
import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { DATE_FIELD, REFERENCE_FIELD_MAP } from '@/common/modules/widgets/_constants/widget-constant';
import {
    getWidgetBasedOnDate,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { getWidgetDataTable, sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import WidgetDataTable from '@/common/modules/widgets/_widgets/table/_component/WidgetDataTable.vue';
import type { TableWidgetField } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    DateRange, DateFieldType, TableDataItem,
} from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';
import type {
    GroupByValue, TableDataFieldValue, ComparisonValue, TotalValue, ProgressBarValue,
    DateFormatValue,
} from '@/common/modules/widgets/types/widget-field-value-type';
import type { DataInfo } from '@/common/modules/widgets/types/widget-model';


type Data = ListResponse<TableDataItem>;

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
    data: null as Data | null,
    comparisonData: null as Data | null,
    dataTable: undefined as PublicDataTableModel|PrivateDataTableModel|undefined,
    // converted data
    finalConvertedData: computed<Data|null>(() => {
        if (!state.data) return null;
        if (state.tableDataFieldType === 'staticField') return state.staticFieldSlicedData;
        if (isDateField(state.tableDataField)) return state.timeSeriesDynamicFieldSlicedData;
        return state.noneTimeSeriesDynamicFieldSlicedData;
    }),
    staticFieldSlicedData: null as Data | null,
    timeSeriesDynamicFieldSlicedData: null as Data | null,
    noneTimeSeriesDynamicFieldSlicedData: null as Data | null,
    // data fetch options
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    tableDataFieldInfo: computed<TableDataFieldValue>(() => props.widgetOptions?.tableDataField as TableDataFieldValue),
    tableDataFieldType: computed<TableDataFieldValue['fieldType']>(() => state.tableDataFieldInfo?.fieldType),
    tableDataField: computed<string|string[]|undefined>(() => state.tableDataFieldInfo?.value),
    tableDataCriteria: computed<string|undefined>(() => state.tableDataFieldInfo?.criteria),
    tableDataMaxCount: computed<number>(() => state.tableDataFieldInfo?.count),
    groupByField: computed<string[]|undefined>(() => ((props.widgetOptions?.groupBy as GroupByValue)?.value as string[]) ?? []),
    dateRange: computed<DateRange>(() => {
        let subtract = 1;
        if (isDateField(state.tableDataField) || state.groupByField?.some((groupBy) => Object.values(DATE_FIELD).includes(groupBy))) {
            if (state.granularity === GRANULARITY.YEARLY) subtract = 3;
            if (state.granularity === GRANULARITY.MONTHLY) subtract = 12;
            if (state.granularity === GRANULARITY.DAILY) subtract = 30;
        }
        const [start, end] = getWidgetDateRange(state.granularity, state.basedOnDate, subtract);
        return { start, end };
    }),
    comparisonDateRange: computed<DateRange>(() => {
        const [_start] = getWidgetDateRange(state.granularity, state.basedOnDate, 2);
        return { start: _start, end: _start };
    }),
    // data for optional fields
    isComparisonEnabled: computed<boolean>(() => !isDateField(state.tableDataField) && !state.groupByField?.some((groupBy) => Object.values(DATE_FIELD).includes(groupBy))),
    comparisonInfo: computed<ComparisonValue|undefined>(() => props.widgetOptions?.comparison?.[0] as ComparisonValue),
    subTotalInfo: computed<TotalValue|undefined>(() => props.widgetOptions?.subTotal as TotalValue),
    totalInfo: computed<TotalValue|undefined>(() => props.widgetOptions?.total as TotalValue),
    progressBarInfo: computed<ProgressBarValue|undefined>(() => props.widgetOptions?.progressBar as ProgressBarValue),
    dateFormatInfo: computed<DateFormatValue|undefined>(() => props.widgetOptions?.dateFormat as DateFormatValue),
    // table
    tableFields: computed<TableWidgetField[]>(() => {
        const labelFields: TableWidgetField[] = sortWidgetTableFields(state.groupByField)?.map(
            (field) => ({ name: field, label: field, fieldInfo: { type: 'labelField', additionalType: field === 'Date' ? 'dateFormat' : undefined } }),
        ) ?? [];
        let dataFields: TableWidgetField[] = [];
        if (state.tableDataFieldType === 'staticField') {
            state.tableDataField?.forEach((field) => {
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
        } else if (isDateField(state.tableDataField)) dataFields = getWidgetTableDateFields(state.tableDataField, state.granularity, state.dateRange, state.tableDataMaxCount, state.tableDataCriteria);
        else { // None Time Series Dynamic Field Case
            state.finalConvertedData?.results?.[0]?.[state.tableDataCriteria].forEach((d) => {
                if (d[state.tableDataField] === 'sub_total') return;
                const fieldName = `${d[state.tableDataField]}`;
                const isReferenceField = Object.keys(REFERENCE_FIELD_MAP).includes(state.tableDataField);
                if (fieldName && fieldName.startsWith('comparison_')) {
                    if (state.comparisonInfo?.format && state.isComparisonEnabled && d[state.tableDataField] !== 'etc') {
                        dataFields.push({
                            name: fieldName,
                            label: fieldName.split('_')[1],
                            fieldInfo: {
                                type: 'dataField',
                                additionalType: 'comparison',
                                reference: isReferenceField ? REFERENCE_FIELD_MAP[state.tableDataField] : undefined,
                                unit: state.dataInfo?.[state.tableDataCriteria]?.unit,
                            },
                        });
                    }
                } else {
                    dataFields.push({
                        name: d[state.tableDataField],
                        label: d[state.tableDataField],
                        fieldInfo: {
                            type: 'dataField',
                            reference: isReferenceField && d[state.tableDataField] !== 'etc' ? REFERENCE_FIELD_MAP[state.tableDataField] : undefined,
                            unit: state.dataInfo?.[state.tableDataCriteria]?.unit,
                        },
                    });
                }
            });
        }
        const basicFields = [...labelFields, ...dataFields];
        if (state.subTotalInfo?.toggleValue) {
            const subTotalField: TableWidgetField = {
                name: 'sub_total',
                label: 'Sub Total',
                fieldInfo: { type: 'dataField', additionalType: 'subTotal', unit: state.dataInfo?.[state.tableDataCriteria]?.unit },
            };
            return [...basicFields, subTotalField];
        }
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
    dateRange: computed(() => state.dateRange),
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
    noData: computed(() => (state.data ? !state.data.results?.length : false)),
});

/* Helper */
const getWidgetTableDateFields = (
    dateField: DateFieldType,
    granularity: Granularity|undefined,
    dateRange: DateRange,
    limitCount: number,
    criteria: string,
): TableWidgetField[] => {
    if (!granularity || !dateRange?.end) return [];
    const dateFields: TableWidgetField[] = [];
    const start = dayjs.utc(dateRange.start);
    const end = dayjs.utc(dateRange.end);

    let timeUnit: TimeUnit = 'day';
    if (granularity === GRANULARITY.MONTHLY) timeUnit = 'month';
    else if (granularity === GRANULARITY.YEARLY) timeUnit = 'year';

    const isSeparateDate = dateField !== DATE_FIELD.DATE;

    let labelDateFormat = isSeparateDate ? 'DD' : 'YYYY-MM-DD';
    if (timeUnit === 'month') labelDateFormat = isSeparateDate ? 'MM' : 'YYYY-MM';
    else if (timeUnit === 'year') labelDateFormat = 'YYYY';

    let now = start;
    while (now.isSameOrBefore(end, timeUnit)) {
        dateFields.push({
            name: now.format(labelDateFormat),
            label: now.format(labelDateFormat),
            fieldInfo: { type: 'dataField', additionalType: 'dateFormat', unit: state.dataInfo?.[criteria]?.unit },
        });
        now = now.add(1, timeUnit);
    }
    return dateFields.slice(-limitCount);
};

const fetchWidget = async (isComparison?: boolean): Promise<Data|APIErrorToast|undefined> => {
    if (props.widgetState === 'INACTIVE') return undefined;
    try {
        state.loading = true;
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
            : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
        const _fields = {};
        let _groupBy: string[] = [...state.groupByField];
        let _field_group: string[] = [];
        let _sort: Query['sort'] = [];
        if (state.tableDataFieldType === 'staticField') {
            state.tableDataField?.forEach((field) => {
                _fields[field] = { key: field, operator: 'sum' };
            });
            _sort = _groupBy.includes('Date') ? [{ key: 'Date', desc: false }] : state.tableDataField.map((field) => ({ key: field, desc: true }));
        } else {
            _fields[state.tableDataCriteria] = { key: state.tableDataCriteria, operator: 'sum' };
            _field_group = [state.tableDataField];
            _groupBy = [..._groupBy, state.tableDataField];
            _sort = _groupBy.includes('Date') && !_field_group.includes('Date') ? [{ key: 'Date', desc: false }] : [{ key: `_total_${state.tableDataCriteria}`, desc: true }];
        }
        const res = await _fetcher({
            widget_id: props.widgetId,
            query: {
                granularity: state.granularity,
                start: isComparison ? state.comparisonDateRange.start : state.dateRange.start,
                end: isComparison ? state.comparisonDateRange.end : state.dateRange.end,
                group_by: _groupBy,
                field_group: _field_group,
                fields: _fields,
                sort: state.sortBy.length ? state.sortBy : _sort,
                page: {
                    start: (state.pageSize * (state.thisPage - 1)) + 1,
                    limit: state.pageSize,
                },
            },
            vars: props.dashboardVars,
        });
        state.errorMessage = undefined;
        return res;
    } catch (e: any) {
        state.errorMessage = e.message;
        ErrorHandler.handleError(e);
        return ErrorHandler.makeAPIErrorToast(e);
    } finally {
        state.loading = false;
    }
};
const loadWidget = async (manualLoad?: boolean): Promise<Data|APIErrorToast> => {
    if (!manualLoad) {
        state.sortBy = [];
        state.thisPage = 1;
    }
    const res = await fetchWidget();
    const comparisonRes = state.isComparisonEnabled && state.comparisonInfo?.format ? await fetchWidget(true) : null;
    if (typeof res === 'function') return res;
    state.data = res;
    state.comparisonData = comparisonRes;
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
watch(() => state.data, () => {
    if (!state.data) return;
    if (state.tableDataFieldType === 'staticField') {
        const comparisonData = state.comparisonData?.results;
        const hasComparisonInfo = state.comparisonInfo?.format;
        const results = state.data.results.map((d, idx) => {
            const dataItem = { ...d };
            let subTotalValue = 0;

            state.tableDataField?.forEach((field) => {
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

        if (state.totalInfo?.toggleValue) {
            const totalDataItem: TableDataItem = {};
            const _sortedGroupByFields = sortWidgetTableFields(state.groupByField ?? []);
            if (_sortedGroupByFields) totalDataItem[_sortedGroupByFields[0]] = 'Total';
            [...state.tableDataField, 'sub_total'].forEach((field) => {
                totalDataItem[field] = results.reduce((acc, cur) => acc + cur[field], 0);
                if (field !== 'sub_total' && hasComparisonInfo) {
                    const comparisionFieldName = `comparison_${field}`;
                    totalDataItem[comparisionFieldName] = {
                        target: totalDataItem[field],
                        subject: results.reduce((acc, cur) => acc + cur[comparisionFieldName].subject, 0),
                    };
                }
            });
            results.push(totalDataItem);
        }

        state.staticFieldSlicedData = { results };
    } else if (isDateField(state.tableDataField)) {
        const results = state.data.results.map((d) => {
            const subTotal = {
                [state.tableDataField]: 'sub_total',
                value: d[state.tableDataCriteria].slice(-state.tableDataMaxCount).reduce((acc, cur) => acc + cur.value, 0),
            };
            return {
                ...d,
                [state.tableDataCriteria]: [...d[state.tableDataCriteria].slice(-state.tableDataMaxCount), subTotal],
            };
        });

        if (state.totalInfo?.toggleValue) {
            const totalDataItem: TableDataItem = {};
            const _sortedGroupByFields = sortWidgetTableFields(state.groupByField ?? []);
            if (_sortedGroupByFields) totalDataItem[_sortedGroupByFields[0]] = 'Total';
            totalDataItem[state.tableDataCriteria] = [...state.tableFields, 'sub_total']
                .filter((field) => field.fieldInfo?.type === 'dataField')
                .map((field) => {
                    const totalValue = results.reduce((acc, cur) => acc + (cur[state.tableDataCriteria].find((c) => c[state.tableDataField] === field.name)?.value || 0), 0);
                    return { [state.tableDataField]: field.name, value: totalValue };
                });
            results.push(totalDataItem);
        }

        state.timeSeriesDynamicFieldSlicedData = { results };
    } else {
        const availableDataFieldsExceptDateField: string[] = [];
        const originFirstRowData = state.data?.results?.[0]?.[state.tableDataCriteria] ?? [];
        const sortedData = orderBy(originFirstRowData, ['value'], ['desc']);
        sortedData.slice(0, state.tableDataMaxCount - 1).forEach((d) => {
            availableDataFieldsExceptDateField.push(d[state.tableDataField]);
        });

        const comparisonData = [...state.comparisonData?.results ?? []];
        const baseData = [...state.data?.results ?? []];
        const hasComparisonOption = state.comparisonInfo?.format && state.isComparisonEnabled;
        const results = baseData.map((d) => {
            const dynamicFieldData = d[state.tableDataCriteria] ?? [];
            const dynamicFieldDataFilteredByAvailableField = dynamicFieldData.filter((item) => availableDataFieldsExceptDateField.includes(item[state.tableDataField]));
            const sortedAndFilteredData = sortBy(
                dynamicFieldDataFilteredByAvailableField,
                (item) => availableDataFieldsExceptDateField.indexOf(item[state.tableDataField]),
            );
            const dataWithComparison = [] as TableDataItem[];
            sortedAndFilteredData.forEach((item) => {
                dataWithComparison.push(item);
                if (hasComparisonOption) {
                    const comparisonItem = comparisonData.find((c) => (state.groupByField ?? []).every((field) => c[field] === d[field]));
                    const comparisonDynamicFieldData = [...comparisonItem?.[state.tableDataCriteria] || []];
                    const comparisonValue = comparisonDynamicFieldData.find((c) => c[state.tableDataField] === item[state.tableDataField])?.value ?? 0;
                    dataWithComparison.push({
                        [state.tableDataField]: `comparison_${item[state.tableDataField]}`,
                        value: { target: item.value, subject: comparisonValue },
                    });
                }
            });
            const etcValue = d[`_total_${state.tableDataCriteria}`] - sortedAndFilteredData.reduce((acc, cur) => acc + cur.value, 0) ?? 0;
            return {
                ...d,
                [state.tableDataCriteria]: [
                    ...(hasComparisonOption ? dataWithComparison : sortedAndFilteredData),
                    {
                        [state.tableDataField]: 'etc',
                        value: etcValue,
                    },
                    {
                        [state.tableDataField]: 'sub_total',
                        value: d[`_total_${state.tableDataCriteria}`],
                    },
                ],
            };
        });

        if (state.totalInfo?.toggleValue) {
            const totalDataItem: TableDataItem = {};
            const _sortedGroupByFields = sortWidgetTableFields(state.groupByField ?? []);
            if (_sortedGroupByFields) totalDataItem[_sortedGroupByFields[0]] = 'Total';
            const fieldForTotal = results?.[0]?.[state.tableDataCriteria] ?? [];
            totalDataItem[state.tableDataCriteria] = fieldForTotal.map((item) => {
                const fieldName = `${item[state.tableDataField]}`;
                if (fieldName.startsWith('comparison_')) {
                    const targetTotalValue = results.reduce((acc, cur) => acc + (cur[state.tableDataCriteria].find((c) => c[state.tableDataField] === fieldName)?.value?.target || 0), 0);
                    const subjectTotalValue = results.reduce((acc, cur) => acc + (cur[state.tableDataCriteria].find((c) => c[state.tableDataField] === fieldName)?.value?.subject || 0), 0);
                    return {
                        [state.tableDataField]: fieldName,
                        value: {
                            target: targetTotalValue,
                            subject: subjectTotalValue,
                        },
                    };
                }
                const totalValue = results.reduce((acc, cur) => acc + (cur[state.tableDataCriteria].find((c) => c[state.tableDataField] === fieldName)?.value || 0), 0);
                return { [state.tableDataField]: fieldName, value: totalValue };
            });
            results.push(totalDataItem);
        }

        state.noneTimeSeriesDynamicFieldSlicedData = { results };
    }
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
                                   :field-type="state.tableDataFieldType"
                                   :criteria="state.tableDataCriteria"
                                   :data-field="state.tableDataField"
                                   :comparison-info="state.comparisonInfo"
                                   :sub-total-info="state.subTotalInfo"
                                   :total-info="state.totalInfo"
                                   :granularity="state.granularity"
                                   :data-info="state.dataInfo"
                                   :date-format-info="state.dateFormatInfo"
                                   :sort-by.sync="state.sortBy"
                                   :this-page.sync="state.thisPage"
                                   @load="handleManualLoadWidget"
                />
            </div>
            <div class="table-pagination-wrapper">
                <p-text-pagination :this-page="state.thisPage"
                                   :all-page="state.allPage"
                                   @pageChange="handleUpdateThisPage"
                />
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.table-wrapper {
    @apply flex justify-center w-full;
    max-height: calc(100% - 1.5rem);
    height: calc(100% - 1.5rem);

    overflow: hidden;
    .data-table {
        height: 100%;
    }
}
.table-pagination-wrapper {
    @apply flex justify-center items-center;
    height: 1.5rem;
}
</style>
