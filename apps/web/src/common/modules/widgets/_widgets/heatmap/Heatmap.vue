<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import {
    computed, defineExpose, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { HeatmapSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import { isEmpty, max, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import { DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import {
    getReferenceLabel,
    getRefinedHeatmapDynamicFieldData,
    getWidgetBasedOnDate,
    getWidgetDateFields,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import {
    getWidgetLoadApiQuery,
    getWidgetLoadApiQueryDateRange,
} from '@/common/modules/widgets/_helpers/widget-load-helper';
import type { ColorSchemaValue, ColorValue } from '@/common/modules/widgets/_widget-fields/color-schema/type';
import type { DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { LegendValue } from '@/common/modules/widgets/_widget-fields/legend/type';
import type { TableDataFieldValue } from '@/common/modules/widgets/_widget-fields/table-data-field/type';
import type { XAxisValue } from '@/common/modules/widgets/_widget-fields/x-axis/type';
import type { DateRange, DynamicFieldData, StaticFieldData } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetEmit, WidgetExpose, WidgetProps } from '@/common/modules/widgets/types/widget-display-type';


type Data = ListResponse<{
    [key: string]: string|number;
}>;

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
    data: null as Data | null,
    chart: null as EChartsType | null,
    xAxisData: computed<string[]>(() => {
        if (!state.data?.results?.length) return [];
        if (isDateField(state.xAxisField)) {
            const _isSeparatedDate = state.xAxisField !== DATE_FIELD.DATE;
            return getWidgetDateFields(state.granularity, state.dateRange.start, state.dateRange.end, _isSeparatedDate);
        }
        return state.data.results.map((d) => d[state.xAxisField] as string) || [];
    }),
    yAxisData: computed<string[]>(() => {
        if (!state.data?.results?.length) return [];
        if (state.dataFieldInfo?.fieldType === 'staticField') {
            return state.dataField;
        }
        return getRefinedHeatmapDynamicFieldData(state.data, state.dynamicFieldInfo);
    }),
    chartData: [],
    heatmapMaxValue: computed(() => max(state.chartData.map((d) => d?.[2] || 0)) ?? 1),
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[state.dataField]),
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
                    if (state.xAxisField === DATE_FIELD.DATE) {
                        return dayjs.utc(val).format(state.dateFormat);
                    }
                    return getReferenceLabel(props.allReferenceTypeInfo, state.xAxisField, val);
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
                    if (state.dataFieldInfo.fieldType === 'staticField') {
                        return val;
                    }
                    if (state.dynamicFieldInfo?.fieldValue === DATE_FIELD.DATE) {
                        return dayjs.utc(val).format(state.dateFormat);
                    }
                    return getReferenceLabel(props.allReferenceTypeInfo, state.dataField, val);
                },
            },
        },
        tooltip: {
            position: 'top',
            confine: true,
            formatter: (params) => {
                let _name = getReferenceLabel(props.allReferenceTypeInfo, state.xAxisField, params.name);
                if (state.xAxisField === DATE_FIELD.DATE) _name = dayjs.utc(_name).format(state.dateFormat);
                if (state.unit) _name = `${_name} (${state.unit})`;
                const _value = numberFormatter(params.value[2]) || '';
                return `${params.marker} ${_name}: <b>${_value}</b>`;
            },
        },
        visualMap: {
            show: state.showLegends,
            calculable: true,
            orient: 'horizontal',
            left: 'left',
            bottom: 0,
            max: state.heatmapMaxValue,
            inRange: {
                color: state.colorValue,
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
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    xAxisField: computed<string>(() => (props.widgetOptions?.xAxis as XAxisValue)?.value),
    xAxisCount: computed<number>(() => (props.widgetOptions?.xAxis as XAxisValue)?.count),
    dataFieldInfo: computed<TableDataFieldValue>(() => props.widgetOptions?.tableDataField as TableDataFieldValue),
    dynamicFieldInfo: computed<TableDataFieldValue['dynamicFieldInfo']>(() => state.dataFieldInfo?.dynamicFieldInfo),
    staticFieldInfo: computed<TableDataFieldValue['staticFieldInfo']>(() => state.dataFieldInfo?.staticFieldInfo),
    dataField: computed<string|string[]|undefined>(() => {
        if (state.dataFieldInfo?.fieldType === 'staticField') return state.staticFieldInfo?.fieldValue;
        return state.dynamicFieldInfo?.fieldValue;
    }),
    dynamicFieldValue: computed<string[]>(() => state.dynamicFieldInfo?.fixedValue || []),
    colorValue: computed<ColorValue>(() => (props.widgetOptions?.colorSchema as ColorSchemaValue)?.colorValue),
    dateRange: computed<DateRange>(() => {
        let _start = state.basedOnDate;
        let _end = state.basedOnDate;
        if (isDateField(state.xAxisField)) {
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.xAxisCount);
        } else if (isDateField(state.dataField)) {
            let subtract = state.dynamicFieldInfo.count;
            if (state.dynamicFieldInfo?.valueType === 'fixed') {
                if (state.granularity === GRANULARITY.YEARLY) subtract = 3;
                if (state.granularity === GRANULARITY.MONTHLY) subtract = 12;
                if (state.granularity === GRANULARITY.DAILY) subtract = 30;
            }
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, subtract);
        }
        return { start: _start, end: _end };
    }),
    // optional fields
    showLegends: computed<boolean>(() => (props.widgetOptions?.legend as LegendValue)?.toggleValue),
    dateFormat: computed<string|undefined>(() => {
        const _dateFormat = (props.widgetOptions?.dateFormat as DateFormatValue)?.value || 'MMM DD, YYYY';
        return DATE_FORMAT?.[_dateFormat]?.[state.granularity];
    }),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange: computed(() => state.dateRange),
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
    noData: computed(() => (state.data ? !state.data.results?.length : false)),
});

/* Api */
const privateWidgetFetcher = getCancellableFetcher<PrivateWidgetLoadParameters, Data>(SpaceConnector.clientV2.dashboard.privateWidget.load);
const publicWidgetFetcher = getCancellableFetcher<PublicWidgetLoadParameters, Data>(SpaceConnector.clientV2.dashboard.publicWidget.load);
const fetchWidget = async (): Promise<Data|APIErrorToast|undefined> => {
    if (props.widgetState === 'INACTIVE') return undefined;
    try {
        state.loading = true;
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate ? privateWidgetFetcher : publicWidgetFetcher;
        const { status, response } = await _fetcher({
            widget_id: props.widgetId,
            query: {
                granularity: state.granularity,
                ...getWidgetLoadApiQueryDateRange(state.granularity, state.dateRange),
                ...getWidgetLoadApiQuery(state.dataFieldInfo, state.xAxisField),
                page: { start: 1, limit: state.xAxisCount },
            },
            vars: props.dashboardVars,
        });
        if (status === 'succeed') {
            state.errorMessage = undefined;
            state.loading = false;
            return response;
        }
        return undefined;
    } catch (e: any) {
        state.loading = false;
        state.errorMessage = e.message;
        ErrorHandler.handleError(e);
        return ErrorHandler.makeAPIErrorToast(e);
    }
};

/* Util */
const getDynamicFieldData = (rawData: DynamicFieldData): any[] => {
    const _criteria = state.dynamicFieldInfo?.criteria;
    const _seriesData: any[] = [];
    state.xAxisData.forEach((x, xIdx) => {
        const _targetData = rawData.results?.find((d) => d[state.xAxisField] === x);
        state.yAxisData.forEach((y, yIdx) => {
            const _data = _targetData?.[_criteria].find((v) => v[state.dataField] === y);
            _seriesData.push([xIdx, yIdx, _data ? _data.value : 0]);
        });
    });

    return _seriesData;
};
const getStaticFieldData = (rawData: StaticFieldData): any[] => {
    const _seriesData: any[] = [];
    state.xAxisData.forEach((x, xIdx) => {
        state.yAxisData.forEach((y, yIdx) => {
            const _data = rawData.results?.find((v) => v[state.xAxisField] === x);
            _seriesData.push([xIdx, yIdx, _data ? _data[y] : 0]);
        });
    });
    return _seriesData;
};
const drawChart = (rawData: Data|null) => {
    if (isEmpty(rawData)) return;

    // get converted chart data
    let _seriesData: any[];
    if (state.dataFieldInfo?.fieldType === 'staticField') {
        _seriesData = getStaticFieldData(rawData);
    } else {
        _seriesData = getDynamicFieldData(rawData);
    }
    state.chartData = _seriesData;
};

const loadWidget = async (): Promise<Data|APIErrorToast> => {
    const res = await fetchWidget();
    if (!res) return state.data;
    if (typeof res === 'function') return res;
    state.data = res;
    drawChart(state.data);
    return state.data;
};

/* Watcher */
watch([() => state.chartData, () => chartContext.value], ([, chartCtx]) => {
    if (chartCtx) {
        state.chart = init(chartContext.value);
        state.chart.setOption(state.chartOptions, true);
    }
});

useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
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
            <div ref="chartContext"
                 class="h-full"
            />
        </div>
    </widget-frame>
</template>
