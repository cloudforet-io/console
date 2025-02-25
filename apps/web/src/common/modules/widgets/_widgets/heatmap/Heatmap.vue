<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import {
    computed, defineExpose, onMounted, reactive, ref, watch,
} from 'vue';

import { useQuery } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import type { HeatmapSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import { isEmpty, max, throttle } from 'lodash';

import { numberFormatter } from '@cloudforet/utils';

import type { WidgetLoadParams, WidgetLoadResponse } from '@/api-clients/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFormQuery } from '@/common/modules/widgets/_composables/use-widget-form-query';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import { DATE_FIELD, WIDGET_LOAD_STALE_TIME } from '@/common/modules/widgets/_constants/widget-constant';
import { SUB_TOTAL_NAME } from '@/common/modules/widgets/_constants/widget-field-constant';
import {
    normalizeAndSerializeVars,
} from '@/common/modules/widgets/_helpers/global-variable-helper';
import {
    getReferenceLabel,
    getWidgetDateFields,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import {
    getWidgetLoadApiQueryDateRange,
} from '@/common/modules/widgets/_helpers/widget-load-helper';
import type { ColorSchemaValue } from '@/common/modules/widgets/_widget-fields/color-schema/type';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { LegendValue } from '@/common/modules/widgets/_widget-fields/legend/type';
import type { XAxisValue } from '@/common/modules/widgets/_widget-fields/x-axis/type';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetEmit, WidgetExpose, WidgetProps } from '@/common/modules/widgets/types/widget-display-type';




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
const chartContext = ref<HTMLElement|null>(null);

const state = reactive({
    isPrivateWidget: computed<boolean>(() => props.widgetId.startsWith('private')),
    dataTable: undefined as DataTableModel|undefined,
    isPivotDataTable: computed<boolean>(() => state.dataTable?.operator === DATA_TABLE_OPERATOR.PIVOT),

    data: computed<WidgetLoadResponse | null>(() => queryResult.data?.value ?? null),
    dataField: computed<string>(() => widgetOptionsState.dataFieldInfo?.data?.[0] || ''),
    chart: null as EChartsType | null,
    xAxisData: computed<string[]>(() => {
        if (!state.data?.results?.length) return [];
        if (isDateField(widgetOptionsState.xAxisInfo?.data)) {
            const _isSeparatedDate = widgetOptionsState.xAxisInfo.data !== DATE_FIELD.DATE;
            return getWidgetDateFields(widgetOptionsState.granularityInfo?.granularity, state.widgetDateRange.start, state.widgetDateRange.end, _isSeparatedDate);
        }
        return state.data.results.map((d) => d[widgetOptionsState.xAxisInfo?.data as string] as string) || [];
    }),
    yAxisData: computed<string[]>(() => {
        if (!state.data?.results?.length) return [];
        if (state.isPivotDataTable) {
            const _excludeFields = [...Object.keys(state.data?.labels_info ?? {}), SUB_TOTAL_NAME];
            return state.data.order?.filter((v) => !_excludeFields.includes(v)) || [];
        }
        return (widgetOptionsState.dataFieldInfo?.data ?? []) as string[];
    }),
    chartData: [],
    heatmapMaxValue: computed(() => max(state.chartData.map((d) => d?.[2] || 0)) ?? 1),
    // unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[state.dataField]),
    chartOptions: computed<HeatmapSeriesOption>(() => ({
        grid: {
            left: 0,
            right: '3%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: state.xAxisData,
            axisLabel: {
                formatter: (val) => {
                    if (widgetOptionsState.xAxisInfo.data === DATE_FIELD.DATE) {
                        return dayjs.utc(val).format(widgetOptionsState.dateFormatInfo?.format);
                    }
                    return getReferenceLabel(props.allReferenceTypeInfo, widgetOptionsState.xAxisInfo?.data, val);
                },
            },
        },
        yAxis: {
            type: 'category',
            data: state.yAxisData,
            splitArea: {
                show: true,
            },
            axisLabel: {
                formatter: (val) => {
                    if (state.isPivotDataTable) return getReferenceLabel(props.allReferenceTypeInfo, state.dataField, val);
                    return val;
                },
            },
        },
        tooltip: {
            position: 'top',
            confine: true,
            formatter: (params) => {
                let _name = getReferenceLabel(props.allReferenceTypeInfo, widgetOptionsState.xAxisInfo?.data, params.name);
                if (widgetOptionsState.xAxisInfo?.data === DATE_FIELD.DATE) _name = dayjs.utc(_name).format(widgetOptionsState.dateFormatInfo?.format);
                // if (state.unit) _name = `${_name} (${state.unit})`;
                const _value = numberFormatter(params.value[2]) || '';
                return `${params.marker} ${_name}: <b>${_value}</b>`;
            },
        },
        visualMap: {
            show: widgetOptionsState.legendInfo?.toggleValue,
            calculable: true,
            orient: 'horizontal',
            left: 'left',
            bottom: 0,
            max: state.heatmapMaxValue,
            inRange: {
                color: widgetOptionsState.colorSchemaInfo?.colorValue,
            },
            outOfRange: {
                color: '#999',
            },
        },
        series: [
            {
                type: 'heatmap',
                data: state.chartData,
            },
        ],
        itemStyle: {
            borderWidth: 2,
            borderColor: 'white',
            borderType: 'solid',
        },
    })),
    // required fields
    widgetDateRange: computed<DateRange>(() => {
        let _start = dateRange.value.start;
        let _end = dateRange.value.end;
        if (isDateField(widgetOptionsState.xAxisInfo?.data)) {
            [_start, _end] = getWidgetDateRange(widgetOptionsState.granularityInfo?.granularity, _end, widgetOptionsState.xAxisInfo?.count);
        }
        return { start: _start, end: _end };
    }),
    dataTableLoading: false,
});

const widgetOptionsState = reactive({
    granularityInfo: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
    dataFieldInfo: computed<DataFieldValue>(() => props.widgetOptions?.dataField?.value as DataFieldValue),
    xAxisInfo: computed<XAxisValue>(() => props.widgetOptions?.xAxis?.value as XAxisValue),
    colorSchemaInfo: computed<ColorSchemaValue>(() => props.widgetOptions?.colorSchema?.value as ColorSchemaValue),
    legendInfo: computed<LegendValue>(() => props.widgetOptions?.legend?.value as LegendValue),
    dateFormatInfo: computed<DateFormatValue>(() => props.widgetOptions?.dateFormat?.value as DateFormatValue),
});

/* Api */
const fetchWidgetData = async (params: WidgetLoadParams): Promise<WidgetLoadResponse> => {
    const defaultFetcher = state.isPrivateWidget
        ? api.privateWidgetAPI.load
        : api.publicWidgetAPI.load;
    const res = await defaultFetcher(params);
    return res;
};
const queryKey = computed(() => [
    ...(state.isPrivateWidget ? keys.privateWidgetLoadQueryKey.value : keys.publicWidgetLoadQueryKey.value),
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
        groupBy: widgetOptionsState.xAxisInfo?.data,
        count: widgetOptionsState.xAxisInfo?.count,
        vars: normalizeAndSerializeVars(props.dashboardVars),
    },
]);

const queryResult = useQuery({
    queryKey,
    queryFn: () => fetchWidgetData({
        widget_id: props.widgetId,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        group_by: widgetOptionsState.xAxisInfo?.data ? [widgetOptionsState.xAxisInfo?.data] : [],
        ...getWidgetLoadApiQueryDateRange(widgetOptionsState.granularityInfo?.granularity, dateRange.value),
        ...(!isDateField(widgetOptionsState.xAxisInfo.data) && { page: { start: 0, limit: widgetOptionsState.xAxisInfo?.count } }),
        vars: props.dashboardVars,
    }),
    enabled: computed(() => props.widgetState !== 'INACTIVE' && !!state.dataTable && !props.loadDisabled),
    staleTime: WIDGET_LOAD_STALE_TIME,
});

const widgetLoading = computed<boolean>(() => queryResult.isFetching.value || state.dataTableLoading);
const errorMessage = computed<string>(() => {
    if (!state.dataTable) return i18n.t('COMMON.WIDGETS.NO_DATA_TABLE_ERROR_MESSAGE');
    return queryResult.error?.value?.message;
});


/* Util */
const getFieldData = (rawData: WidgetLoadResponse): any[] => {
    const _seriesData: any[] = [];
    state.xAxisData.forEach((x, xIdx) => {
        state.yAxisData.forEach((y, yIdx) => {
            const _data = rawData.results?.find((v) => v[widgetOptionsState.xAxisInfo?.data as string] === x);
            _seriesData.push([xIdx, yIdx, _data ? _data[y] : 0]);
        });
    });
    return _seriesData;
};
const drawChart = (rawData: WidgetLoadResponse|null) => {
    if (isEmpty(rawData)) return;
    state.chartData = getFieldData(rawData);
};

/* Watcher */
watch([() => state.chartData, () => chartContext.value], ([, chartCtx]) => {
    if (chartCtx) {
        state.chart = init(chartContext.value);
        state.chart.setOption(state.chartOptions, true);
    }
});

watch([() => state.data, () => props.widgetOptions, () => state.dataTable], ([newData,, _dataTable]) => {
    if (!_dataTable) return;
    drawChart(newData);
}, { immediate: true });

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage,
    widgetLoading,
    noData: computed(() => (state.data ? !state.data.results?.length : false)),
});

useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));

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
        queryResult.refetch();
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
            <div ref="chartContext"
                 class="h-full"
            />
        </div>
    </widget-frame>
</template>
