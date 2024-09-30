<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { BarSeriesOption } from 'echarts/charts';
import type { EChartsType } from 'echarts/core';
import { init } from 'echarts/core';
import {
    isEmpty, throttle,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
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
    getReferenceLabel, getRefinedDynamicFieldData,
    getWidgetBasedOnDate,
    getWidgetDateFields,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import {
    getWidgetLoadApiQuery,
    getWidgetLoadApiQueryDateRange,
} from '@/common/modules/widgets/_helpers/widget-load-helper';
import type { DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { DisplaySeriesLabelValue } from '@/common/modules/widgets/_widget-fields/display-series-label/type';
import type { LegendValue } from '@/common/modules/widgets/_widget-fields/legend/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { TableDataFieldValue } from '@/common/modules/widgets/_widget-fields/table-data-field/type';
import type { YAxisValue } from '@/common/modules/widgets/_widget-fields/y-axis/type';
import type { DateRange, DynamicFieldData, StaticFieldData } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetEmit, WidgetExpose, WidgetProps } from '@/common/modules/widgets/types/widget-display-type';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';


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
    yAxisData: computed<string[]>(() => {
        if (!state.data?.results?.length) return [];
        if (isDateField(state.yAxisField)) {
            const _isSeparatedDate = state.yAxisField !== DATE_FIELD.DATE;
            return getWidgetDateFields(state.granularity, state.dateRange.start, state.dateRange.end, _isSeparatedDate);
        }
        return state.data.results.map((d) => d[state.yAxisField] as string) || [];
    }),
    chartData: [],
    chart: null as EChartsType | null,
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[state.dataField]),
    chartOptions: computed<BarSeriesOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        legend: {
            type: 'scroll',
            show: state.showLegends,
            bottom: 0,
            left: 0,
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
            formatter: (val) => {
                if (state.dataField === DATE_FIELD.DATE) return dayjs.utc(val).format(state.dateFormat);
                return getReferenceLabel(props.allReferenceTypeInfo, state.dataField, val);
            },
        },
        tooltip: {
            formatter: (params) => {
                const _params = Array.isArray(params) ? params : [params];
                return _params.map((p) => {
                    let _seriesName = getReferenceLabel(props.allReferenceTypeInfo, state.dataField, p.seriesName);
                    if (state.dataField === DATE_FIELD.DATE) {
                        _seriesName = dayjs.utc(_seriesName).format(state.dateFormat);
                    }
                    if (state.unit) _seriesName = `${_seriesName} (${state.unit})`;
                    const _name = getReferenceLabel(props.allReferenceTypeInfo, state.yAxisField, params.name);
                    const _value = numberFormatter(p.value) || '';
                    return `${_seriesName}<br>${p.marker} ${_name}: <b>${_value}</b>`;
                }).join('<br>');
            },
        },
        grid: {
            left: 0,
            right: '3%',
            containLabel: true,
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                formatter: (val) => numberFormatter(val, { notation: 'compact' }),
            },
        },
        yAxis: {
            type: 'category',
            data: state.yAxisData,
            axisLabel: {
                formatter: (val) => {
                    if (state.yAxisField === DATE_FIELD.DATE) {
                        return dayjs.utc(val).format(state.dateFormat);
                    }
                    return getReferenceLabel(props.allReferenceTypeInfo, state.yAxisField, val);
                },
            },
        },
        series: state.chartData,
    })),
    // required fields
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    yAxisField: computed<string>(() => (props.widgetOptions?.yAxis as YAxisValue)?.value),
    yAxisCount: computed<number>(() => (props.widgetOptions?.yAxis as YAxisValue)?.count),
    dataFieldInfo: computed<TableDataFieldValue>(() => props.widgetOptions?.tableDataField as TableDataFieldValue),
    dynamicFieldInfo: computed<TableDataFieldValue['dynamicFieldInfo']>(() => state.dataFieldInfo?.dynamicFieldInfo),
    staticFieldInfo: computed<TableDataFieldValue['staticFieldInfo']>(() => state.dataFieldInfo?.staticFieldInfo),
    dataField: computed<string|string[]|undefined>(() => {
        if (state.dataFieldInfo?.fieldType === 'staticField') return state.staticFieldInfo?.fieldValue;
        return state.dynamicFieldInfo?.fieldValue;
    }),
    dynamicFieldValue: computed<string[]>(() => state.dynamicFieldInfo?.fixedValue || []),
    dateRange: computed<DateRange>(() => {
        let _start = state.basedOnDate;
        let _end = state.basedOnDate;
        if (isDateField(state.yAxisField)) {
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.yAxisCount);
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
    numberFormat: computed<NumberFormatValue>(() => props.widgetOptions?.numberFormat as NumberFormatValue),
    displaySeriesLabel: computed(() => (props.widgetOptions?.displaySeriesLabel as DisplaySeriesLabelValue)),
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
                page: { start: 1, limit: state.yAxisCount },
                ...getWidgetLoadApiQueryDateRange(state.granularity, state.dateRange),
                ...getWidgetLoadApiQuery(state.dataFieldInfo, state.yAxisField),
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
const getDynamicFieldData = (rawData: DynamicFieldData, threshold: number): any[] => {
    // get refined data and series fields
    const [_refinedResults, _seriesFields] = getRefinedDynamicFieldData(rawData, state.dynamicFieldInfo, state.yAxisField);

    // get chart data
    const _seriesData: any[] = [];
    _seriesFields.forEach((field) => {
        const _data: number[] = [];
        state.yAxisData.forEach((d) => {
            const _result = _refinedResults.find((result) => result[state.yAxisField] === d);
            const _value = _result?.[state.dynamicFieldInfo?.criteria].find((v) => v[state.dataField] === field);
            _data.push(_value?.value || 0);
        });
        _seriesData.push({
            name: field,
            type: 'bar',
            stack: true,
            barMaxWidth: 50,
            label: {
                show: !!state.displaySeriesLabel?.toggleValue,
                position: state.displaySeriesLabel?.position,
                rotate: state.displaySeriesLabel?.rotate,
                fontSize: 10,
                formatter: (p) => {
                    if (p.value < threshold) return '';
                    return getFormattedNumber(p.value, state.dataField, state.numberFormat, state.unit);
                },
            },
            data: _data,
        });
    });

    return _seriesData;
};
const getStaticFieldData = (rawData: StaticFieldData, threshold: number): any[] => {
    const _seriesData: any[] = [];
    state.dataField.forEach((field) => {
        _seriesData.push({
            name: field,
            type: 'bar',
            stack: true,
            barMaxWidth: 50,
            data: state.yAxisData.map((d) => {
                const _data = rawData.results?.find((v) => v[state.yAxisField] === d);
                return _data ? _data[field] : 0;
            }),
            label: {
                show: !!state.displaySeriesLabel?.toggleValue,
                position: state.displaySeriesLabel?.position,
                rotate: state.displaySeriesLabel?.rotate,
                fontSize: 10,
                formatter: (p) => {
                    if (p.value < threshold) return '';
                    return getFormattedNumber(p.value, field, state.numberFormat, state.unit);
                },
            },
        });
    });
    return _seriesData;
};
const drawChart = (rawData?: Data|null) => {
    if (isEmpty(rawData)) return;

    const _maxTotalCount = rawData?.results?.[0]?.[`_total_${state.dataField}`] ?? 0;
    const _threshold = _maxTotalCount * 0.08;

    // get converted chart data
    let _seriesData: any[];
    if (state.dataFieldInfo?.fieldType === 'staticField') {
        _seriesData = getStaticFieldData(rawData, _threshold);
    } else {
        _seriesData = getDynamicFieldData(rawData, _threshold);
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

useWidgetInitAndRefresh({ props, emit, loadWidget });
useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
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
