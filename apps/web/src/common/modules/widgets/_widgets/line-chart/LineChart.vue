<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, onMounted, reactive, ref, watch,
} from 'vue';

import { useQuery } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import type { LineSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import {
    isEmpty, throttle,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { DATE_FIELD, WIDGET_LOAD_STALE_TIME } from '@/common/modules/widgets/_constants/widget-constant';
import { DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import { sortObjectByKeys } from '@/common/modules/widgets/_helpers/widget-data-table-helper';
import {
    getReferenceLabel, getWidgetDateFields, getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { getFormattedNumber, getWidgetDataTable } from '@/common/modules/widgets/_helpers/widget-helper';
import {
    getWidgetLoadApiQueryDateRange, getWidgetLoadApiQuerySort,
} from '@/common/modules/widgets/_helpers/widget-load-helper';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { DisplaySeriesLabelValue } from '@/common/modules/widgets/_widget-fields/display-series-label/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { LegendValue } from '@/common/modules/widgets/_widget-fields/legend/type';
import type { MissingValueValue } from '@/common/modules/widgets/_widget-fields/missing-value/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { TooltipNumberFormatValue } from '@/common/modules/widgets/_widget-fields/tooltip-number-format/type';
import type { XAxisValue } from '@/common/modules/widgets/_widget-fields/x-axis/type';
import type { DateRange, DynamicFieldData, StaticFieldData } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';


type Data = StaticFieldData|DynamicFieldData;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange?.value as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
});
const chartContext = ref<HTMLElement|null>(null);
const state = reactive({
    runQueries: false,
    isPrivateWidget: computed<boolean>(() => props.widgetId.startsWith('private')),
    dataTable: undefined as PublicDataTableModel|PrivateDataTableModel|undefined,

    data: computed<Data | null>(() => queryResult?.data?.value || null),
    chart: null as EChartsType | null,
    xAxisData: computed<string[]>(() => {
        if (!state.data?.results?.length) return [];
        if (isDateField(widgetOptionsState.xAxisInfo?.data)) {
            const _isSeparatedDate = widgetOptionsState.xAxisInfo?.data !== DATE_FIELD.DATE;
            return getWidgetDateFields(widgetOptionsState.granularityInfo?.granularity, state.widgetDateRange.start, state.widgetDateRange.end, _isSeparatedDate);
        }
        const _xAxisData = state.data.results.map((d) => d[widgetOptionsState.xAxisInfo?.data as string] as string) || [];
        return Array.from(new Set(_xAxisData));
    }),
    chartData: [],
    isAreaChart: computed<boolean>(() => props.widgetName === 'stackedAreaChart'),
    unitMap: computed<Record<string, string>>(() => widgetFrameProps.value.unitMap || {}),
    chartOptions: computed<LineSeriesOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        grid: {
            left: 10,
            right: 10,
            containLabel: true,
        },
        legend: {
            type: 'scroll',
            show: widgetOptionsState.legendInfo?.toggleValue,
            bottom: 0,
            left: 0,
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
            formatter: (val) => val,
        },
        tooltip: {
            trigger: 'axis',
            confine: true,
            formatter: (params) => {
                const _params = params as any[];
                let _axisValue = getReferenceLabel(props.allReferenceTypeInfo, widgetOptionsState.xAxisInfo?.data, _params[0].axisValue);
                if (widgetOptionsState.xAxisInfo?.data === DATE_FIELD.DATE) {
                    _axisValue = dayjs.utc(_axisValue).format(state.dateFormat);
                }
                const _values = _params.map((p) => {
                    const _unit: string|undefined = state.unitMap[p.seriesName];
                    let _seriesName = getReferenceLabel(props.allReferenceTypeInfo, widgetOptionsState.dataFieldInfo?.data, p.seriesName);
                    let _value = p.value ? numberFormatter(p.value) : undefined;
                    if (!_value) return undefined;
                    if (_unit) _seriesName = `${_seriesName} (${_unit})`;
                    if (widgetOptionsState.tooltipNumberFormatInfo?.toggleValue) {
                        _value = getFormattedNumber(p.value, p.seriesName, widgetOptionsState.numberFormatInfo, _unit);
                    }
                    return `${p.marker} ${_seriesName}: <b>${_value}</b>`;
                });
                return [_axisValue, ..._values].filter((d) => !!d).join('<br/>');
            },
        },
        xAxis: {
            type: 'category',
            data: state.xAxisData,
            axisLabel: {
                formatter: (val) => {
                    if (widgetOptionsState.xAxisInfo?.data === DATE_FIELD.DATE) {
                        return dayjs.utc(val).format(state.dateFormat);
                    }
                    return getReferenceLabel(props.allReferenceTypeInfo, widgetOptionsState.xAxisInfo?.data, val);
                },
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (val) => numberFormatter(val, { notation: 'compact' }),
            },
        },
        series: state.chartData,
    })),
    widgetDateRange: computed<DateRange>(() => {
        let _start = dateRange.value.start;
        let _end = dateRange.value.end;
        if (isDateField(widgetOptionsState.xAxisInfo?.data)) {
            [_start, _end] = getWidgetDateRange(widgetOptionsState.granularityInfo?.granularity, _end, widgetOptionsState.xAxisInfo?.count);
        }
        return { start: _start, end: _end };
    }),
    dateFormat: computed<string|undefined>(() => DATE_FORMAT?.[widgetOptionsState.dateFormatInfo?.format]?.[widgetOptionsState.granularityInfo?.granularity]),
});

const widgetOptionsState = reactive({
    granularityInfo: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
    xAxisInfo: computed<XAxisValue>(() => props.widgetOptions?.xAxis?.value as XAxisValue),
    dataFieldInfo: computed<DataFieldValue>(() => props.widgetOptions?.dataField?.value as DataFieldValue),
    dateFormatInfo: computed<DateFormatValue>(() => props.widgetOptions?.dateFormat?.value as DateFormatValue),
    numberFormatInfo: computed<NumberFormatValue>(() => props.widgetOptions?.numberFormat?.value as NumberFormatValue),
    legendInfo: computed<LegendValue>(() => props.widgetOptions?.legend?.value as LegendValue),
    tooltipNumberFormatInfo: computed<TooltipNumberFormatValue>(() => props.widgetOptions?.tooltipNumberFormat?.value as TooltipNumberFormatValue),
    displaySeriesLabelInfo: computed<DisplaySeriesLabelValue>(() => props.widgetOptions?.displaySeriesLabel?.value as DisplaySeriesLabelValue),
    missingValueInfo: computed<MissingValueValue>(() => props.widgetOptions?.missingValue?.value as MissingValueValue),
});



/* Api */
const fetchWidgetData = async (params: PrivateWidgetLoadParameters|PublicWidgetLoadParameters): Promise<Data> => {
    const defaultFetcher = state.isPrivateWidget
        ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
        : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
    const res = await defaultFetcher(params);
    return res;
};

const queryKey = computed(() => [
    state.isAreaChart ? 'widget-load-area-chart' : 'widget-load-line-chart',
    props.widgetId,
    {
        start: dateRange.value.start,
        end: dateRange.value.end,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        dataTableId: state.dataTable?.data_table_id,
        dataTableOptions: JSON.stringify(sortObjectByKeys(state.dataTable?.options) ?? {}),
        groupBy: widgetOptionsState.xAxisInfo?.data,
        count: widgetOptionsState.xAxisInfo?.count,
    },
]);

const queryResult = useQuery({
    queryKey,
    queryFn: () => fetchWidgetData({
        widget_id: props.widgetId,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        group_by: widgetOptionsState.xAxisInfo?.data ? [widgetOptionsState.xAxisInfo?.data] : [],
        sort: getWidgetLoadApiQuerySort(widgetOptionsState.xAxisInfo?.data as string, widgetOptionsState.dataFieldInfo?.data as string[]),
        page: { start: 0, limit: widgetOptionsState.xAxisInfo?.count },
        vars: props.dashboardVars,
        ...getWidgetLoadApiQueryDateRange(widgetOptionsState.granularityInfo?.granularity, dateRange.value),
    }),
    enabled: computed(() => props.widgetState !== 'INACTIVE' && !!state.dataTable && state.runQueries),
    staleTime: WIDGET_LOAD_STALE_TIME,
});

const loading = computed(() => queryResult.isLoading);
const errorMessage = computed(() => queryResult.error?.value?.message);

/* Util */
const drawChart = (rawData: Data|null) => {
    if (isEmpty(rawData)) return;

    const _seriesData: any[] = [];
    const _defaultValue = widgetOptionsState.missingValueInfo?.type === 'lineToZero' ? 0 : undefined;
    (widgetOptionsState.dataFieldInfo?.data as string[] ?? []).forEach((_dataField) => {
        const _unit: string|undefined = state.unitMap[_dataField];
        _seriesData.push({
            name: _dataField,
            type: 'line',
            stack: state.isAreaChart,
            areaStyle: state.isAreaChart ? {} : undefined,
            data: state.xAxisData.map((d) => {
                const _data = rawData.results?.find((v) => v[widgetOptionsState.xAxisInfo?.data as string] === d);
                return _data?.[_dataField] || _defaultValue;
            }),
            label: {
                show: !!widgetOptionsState.displaySeriesLabelInfo?.toggleValue,
                position: widgetOptionsState.displaySeriesLabelInfo?.position,
                rotate: widgetOptionsState.displaySeriesLabelInfo?.rotate,
                fontSize: 10,
                formatter: (p) => getFormattedNumber(p.value, _dataField, widgetOptionsState.numberFormatInfo, _unit),
            },
        });
    });
    state.chartData = _seriesData;
};

const loadWidget = () => {
    state.runQueries = true;
};

/* Watcher */
watch([() => state.chartData, () => chartContext.value], ([, chartCtx]) => {
    if (chartCtx) {
        state.chart = init(chartContext.value);
        state.chart.setOption(state.chartOptions, true);
    }
});
watch(() => state.data, (newData) => {
    drawChart(newData);
});

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage: errorMessage.value,
    widgetLoading: loading.value,
    noData: computed(() => (state.data ? !state.data.results?.length : false)),
});

useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
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
            <div ref="chartContext"
                 class="h-full"
            />
        </div>
    </widget-frame>
</template>
