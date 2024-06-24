<script setup lang="ts">
import {
    defineExpose, reactive, computed,
} from 'vue';

import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import dayjs from 'dayjs';
import { orderBy, sortBy } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { Granularity } from '@/schema/dashboard/_types/widget-type';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import { getWidgetBasedOnDate, getWidgetDateRange } from '@/common/modules/widgets/_helpers/widget-date-helper';
import WidgetDataTable from '@/common/modules/widgets/_widgets/table/_component/WidgetDataTable.vue';
import type { TableWidgetField } from '@/common/modules/widgets/types/widget-data-table-type';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';
import type {
    GroupByValue, TableDataFieldValue, ComparisonValue, TotalValue, ProgressBarValue,
} from '@/common/modules/widgets/types/widget-field-value-type';


type Data = ListResponse<{
    [key: string]: string|number;
}>;

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
    data: null as Data | null,
    comparisonData: null as Data | null,
    finalConvertedData: computed<Data|null>(() => {
        if (!state.data) return null;
        if (state.tableDataFieldType === 'staticField') return state.staticFieldSlicedData;
        if (state.tableDataField === DATE_FIELD) return state.timeSeriesDynamicFieldSlicedData;
        return state.noneTimeSeriedsDynamicFieldSlicedData;
    }),
    staticFieldSlicedData: computed(() => {
        if (state.tableDataFieldType === 'staticField') {
            const comparisonData = state.comparisonData?.results;

            if (state.comparisonInfo?.format) {
                return {
                    results: state.data.results.map((d, idx) => {
                        const results = d;
                        state.tableDataField.forEach((field) => {
                            const comparisonValue = comparisonData?.[idx]?.[field] ?? 0;
                            results[`comparison_${field}`] = comparisonValue;
                        });
                        return results;
                    }),
                };
            }
            return state.data;
        }
        return { results: [] };
    }),
    timeSeriesDynamicFieldSlicedData: computed(() => {
        if (state.tableDataField === DATE_FIELD) {
            return {
                results: state.data.results.map((d) => {
                    const subTotal = {
                        [state.tableDataField]: 'sub_total',
                        value: d[state.tableDataCriteria].slice(-state.tableDataMaxCount).reduce((acc, cur) => acc + cur.value, 0),
                    };
                    return {
                        ...d,
                        [state.tableDataCriteria]: [...d[state.tableDataCriteria].slice(-state.tableDataMaxCount), subTotal],
                    };
                }),
            };
        }
        return { results: [] };
    }),
    noneTimeSeriedsDynamicFieldSlicedData: computed(() => {
        const comparisonData = state.comparisonData?.results ?? [];
        return {
            results: state.data.results.map((d) => {
                const hasComparisonOption = state.comparisonInfo?.format && state.isComparisonEnabled;
                const sortedAndFilteredData = sortBy(
                    d[state.tableDataCriteria].filter((item) => state.availableDataFieldsWhenDynamicFieldIsNotDate.includes(item[state.tableDataField])),
                    (item) => state.availableDataFieldsWhenDynamicFieldIsNotDate.indexOf(item[state.tableDataField]),
                );
                const dataWithComparison = [] as { [key: string]: string|number }[];
                sortedAndFilteredData.forEach((item) => {
                    dataWithComparison.push(item);
                    if (hasComparisonOption) {
                        const comparisonItem = comparisonData.find((c) => state.groupByField.every((field) => c[field] === d[field]));
                        const comparisonValue = comparisonItem?.[state.tableDataCriteria].find((c) => c[state.tableDataField] === item[state.tableDataField])?.value ?? 0;
                        dataWithComparison.push({
                            [state.tableDataField]: `comparison_${item[state.tableDataField]}`,
                            value: comparisonValue,
                        });
                    }
                });
                const etcValue = d[`_total_${state.tableDataCriteria}`] - sortedAndFilteredData.reduce((acc, cur) => acc + cur.value, 0) ?? 0;
                return {
                    ...d,
                    [state.tableDataCriteria]: [
                        ...(hasComparisonOption ? dataWithComparison : sortedAndFilteredData),
                        {
                            [state.tableDataField]: 'Etc',
                            value: etcValue,
                        },
                        {
                            [state.tableDataField]: 'sub_total',
                            value: d[`_total_${state.tableDataCriteria}`],
                        },
                    ],
                };
            }),
        };
    }),
    availableDataFieldsWhenDynamicFieldIsNotDate: computed(() => {
        if (state.tableDataFieldType === 'staticField') return [];
        const originFirstRowData = state.data?.results?.[0][state.tableDataCriteria];
        const sortedData = orderBy(originFirstRowData, ['value'], ['desc']);
        return sortedData.map((d) => d[state.tableDataField]).slice(0, state.tableDataMaxCount - 1);
    }),
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
        if (state.tableDataField === DATE_FIELD || state.groupByField?.includes(DATE_FIELD)) {
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
    isComparisonEnabled: computed<boolean>(() => state.tableDataField !== DATE_FIELD && !state.groupByField?.includes(DATE_FIELD)),
    comparisonInfo: computed<ComparisonValue|undefined>(() => props.widgetOptions?.comparison?.[0] as ComparisonValue),
    subTotalInfo: computed<TotalValue|undefined>(() => props.widgetOptions?.subTotal as TotalValue),
    totlaInfo: computed<TotalValue|undefined>(() => props.widgetOptions?.total as TotalValue),
    progressBarInfo: computed<ProgressBarValue|undefined>(() => props.widgetOptions?.progressBar as ProgressBarValue),
    // table
    tableFields: computed<TableWidgetField[]>(() => {
        const labelFields: TableWidgetField[] = state.groupByField?.map((field) => ({ name: field, label: field, fieldInfo: { type: 'labelField' } })) ?? [];
        let dataFields: TableWidgetField[] = [];
        if (state.tableDataFieldType === 'staticField') {
            state.tableDataField.forEach((field) => {
                dataFields.push({
                    name: field,
                    label: field,
                    fieldInfo: { type: 'dataField' },
                });
                if (state.comparisonInfo?.format && state.isComparisonEnabled) {
                    dataFields.push({
                        name: `comparison_${field}`,
                        label: 'Comparison',
                        fieldInfo: { type: 'dataField', additionalType: 'comparison' },
                    });
                }
            });
        } else if (state.tableDataField === DATE_FIELD) dataFields = getWidgetTableDateFields(state.granularity, state.dateRange, state.tableDataMaxCount);
        else {
            state.slicedData?.results?.[0][state.tableDataCriteria].forEach((d) => {
                dataFields.push({
                    name: d[state.tableDataField],
                    label: d[state.tableDataField],
                    fieldInfo: { type: 'dataField' },
                });
                if (state.comparisonInfo?.format && state.isComparisonEnabled) {
                    dataFields.push({
                        name: `comparison_${d[state.tableDataField]}`,
                        label: 'Comparison',
                        fieldInfo: { type: 'dataField', additionalType: 'comparison' },
                    });
                }
            });
        }
        const basicFields = [...labelFields, ...dataFields];
        if (state.subTotalInfo?.toggleValue) {
            const subTotalField: TableWidgetField = { name: 'sub_total', label: 'Sub Total', fieldInfo: { type: 'dataField', additionalType: 'subTotal' } };
            return [...basicFields, subTotalField];
        }
        return basicFields;
    }),
});

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange: computed(() => state.dateRange),
    errorMessage: computed(() => state.errorMessage),
});

/* Helper */
const getWidgetTableDateFields = (
    granularity: Granularity|undefined,
    dateRange: DateRange,
    limitCount: number,
): TableWidgetField[] => {
    if (!granularity || !dateRange?.end) return [];
    const dateFields: TableWidgetField[] = [];
    const start = dayjs.utc(dateRange.start);
    const end = dayjs.utc(dateRange.end);

    let timeUnit: TimeUnit = 'day';
    if (granularity === GRANULARITY.MONTHLY) timeUnit = 'month';
    else if (granularity === GRANULARITY.YEARLY) timeUnit = 'year';

    let labelDateFormat = 'YYYY-MM-DD';
    if (timeUnit === 'month') labelDateFormat = 'YYYY-MM';
    else if (timeUnit === 'year') labelDateFormat = 'YYYY';

    let now = start;
    while (now.isSameOrBefore(end, timeUnit)) {
        dateFields.push({
            name: now.format(labelDateFormat),
            label: now.format(labelDateFormat),
            fieldInfo: { type: 'dataField' },
        });
        now = now.add(1, timeUnit);
    }
    return dateFields.slice(-limitCount);
};

const fetchWidget = async (isComparison?: boolean): Promise<Data|APIErrorToast> => {
    try {
        state.loading = true;
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
            : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
        const _fields = {};
        let _groupBy: string[] = [...state.groupByField];
        let _field_group: string[] = [];
        if (state.tableDataFieldType === 'staticField') {
            state.tableDataField?.forEach((field) => {
                _fields[field] = { key: field, operator: 'sum' };
            });
        } else {
            _fields[state.tableDataCriteria] = { key: state.tableDataCriteria, operator: 'sum' };
            _field_group = [state.tableDataField];
            _groupBy = [..._groupBy, state.tableDataField];
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
            },
            vars: props.dashboardVariables,
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
const loadWidget = async (data?: Data): Promise<Data|APIErrorToast> => {
    const res = data ?? await fetchWidget();
    const comparisonRes = state.isComparisonEnabled && state.comparisonInfo?.format ? await fetchWidget(true) : null;
    if (typeof res === 'function') return res;
    state.data = res;
    state.comparisonData = comparisonRes;
    return state.data;
};

useWidgetInitAndRefresh({ props, emit, loadWidget });
defineExpose<WidgetExpose<Data>>({
    loadWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <!--        <p-data-loader class="chart-loader"-->
        <!--                       :loading="state.loading"-->
        <!--                       loader-type="skeleton"-->
        <!--                       disable-empty-case-->
        <!--                       :loader-backdrop-opacity="1"-->
        <!--                       show-data-from-scratch-->
        <!--        >-->
        <!--            <div class="chart">-->
        <!--                {{ state.data }}-->
        <!--            </div>-->
        <!--        </p-data-loader>-->
        <widget-data-table :widget-id="props.widgetId"
                           :loading="false"
                           :fields="state.tableFields"
                           :items="state.finalConvertedData?.results"
        />
    </widget-frame>
</template>

<style lang="postcss" scoped>
.chart-loader {
    height: 100%;
    .chart {
        height: 100%;
    }
}
</style>
