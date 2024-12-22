<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { BarSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import {
    isEmpty, sortBy, throttle,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import { DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import {
    getReferenceLabel,
    getWidgetDateFields,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import {
    getWidgetLoadApiQueryDateRange,
} from '@/common/modules/widgets/_helpers/widget-load-helper';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { DisplaySeriesLabelValue } from '@/common/modules/widgets/_widget-fields/display-series-label/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { LegendValue } from '@/common/modules/widgets/_widget-fields/legend/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { TooltipNumberFormatValue } from '@/common/modules/widgets/_widget-fields/tooltip-number-format/type';
import type { XAxisValue } from '@/common/modules/widgets/_widget-fields/x-axis/type';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';



type StaticFieldData = ListResponse<{
    [key: string]: string|number;
}>;
type DynamicFieldData = {
    results?: Array<{
        [key: string]: any;
    }>;
    total_count?: number;
};
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
    loading: false,
    errorMessage: undefined as string|undefined,
    unitMap: computed<Record<string, string>>(() => widgetFrameProps.value.unitMap || {}),
    data: null as Data | null,
    chart: null as EChartsType | null,
    xAxisData: computed<string[]>(() => {
        if (!state.data?.results?.length) return [];
        if (isDateField(state.xAxisField)) {
            const _isSeparatedDate = state.xAxisField !== DATE_FIELD.DATE;
            return getWidgetDateFields(state.granularity, state.widgetDateRange.start, state.widgetDateRange.end, _isSeparatedDate);
        }
        const _xAxisData = state.data.results.map((d) => d[state.xAxisField] as string) || [];
        return Array.from(new Set(_xAxisData));
    }),
    chartData: [],
    chartOptions: computed<BarSeriesOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        grid: {
            left: 10,
            right: 10,
            containLabel: true,
        },
        legend: {
            type: 'scroll',
            show: state.showLegends,
            bottom: 0,
            left: 0,
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
            formatter: (val) => getReferenceLabel(props.allReferenceTypeInfo, state.dataField, val),
        },
        tooltip: {
            trigger: 'axis',
            confine: true,
            formatter: (params) => {
                const _params = params as any[];
                let _axisValue = getReferenceLabel(props.allReferenceTypeInfo, state.xAxisField, _params[0].axisValue);
                if (state.xAxisField === DATE_FIELD.DATE) {
                    _axisValue = dayjs.utc(_axisValue).format(state.dateFormat);
                }
                const _values = _params.map((p) => {
                    const _unit: string|undefined = state.unitMap[p.seriesName];
                    let _seriesName = getReferenceLabel(props.allReferenceTypeInfo, state.dataField, p.seriesName);
                    let _value = numberFormatter(p.value) || '';
                    if (state.tooltipNumberFormat?.toggleValue) {
                        _value = getFormattedNumber(p.value, p.seriesName, state.numberFormat, _unit);
                    }
                    if (_unit) _seriesName = `${_seriesName} (${_unit})`;
                    return `${p.marker} ${_seriesName}: <b>${_value}</b>`;
                });
                return [_axisValue, ..._values].join('<br/>');
            },
        },
        xAxis: {
            type: 'category',
            axisLabel: {
                formatter: (val) => {
                    if (state.xAxisField === DATE_FIELD.DATE) {
                        return dayjs.utc(val).format(state.dateFormat);
                    }
                    return getReferenceLabel(props.allReferenceTypeInfo, state.xAxisField, val);
                },
            },
            data: state.xAxisData,
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (val) => numberFormatter(val, { notation: 'compact' }),
            },
        },
        series: state.chartData,
    })),
    // required fields
    granularity: computed<string|undefined>(() => (props.widgetOptions?.granularity?.value as GranularityValue)?.granularity),
    xAxisField: computed<string|undefined>(() => (props.widgetOptions?.xAxis?.value as XAxisValue)?.data),
    xAxisCount: computed<number|undefined>(() => (props.widgetOptions?.xAxis?.value as XAxisValue)?.count),
    dataField: computed<string[]|undefined>(() => (props.widgetOptions?.dataField?.value as DataFieldValue)?.data as string[]),
    widgetDateRange: computed<DateRange>(() => {
        let _start = dateRange.value.start;
        let _end = dateRange.value.end;
        if (isDateField(state.xAxisField)) {
            [_start, _end] = getWidgetDateRange(state.granularity, _end, state.xAxisCount);
        }
        return { start: _start, end: _end };
    }),
    // optional fields
    showLegends: computed<boolean>(() => (props.widgetOptions?.legend?.value as LegendValue)?.toggleValue),
    dateFormat: computed<string|undefined>(() => {
        const _dateFormat = (props.widgetOptions?.dateFormat?.value as DateFormatValue)?.format || 'MMM DD, YYYY';
        return DATE_FORMAT?.[_dateFormat]?.[state.granularity];
    }),
    numberFormat: computed<NumberFormatValue|undefined>(() => props.widgetOptions?.numberFormat?.value as NumberFormatValue),
    tooltipNumberFormat: computed<TooltipNumberFormatValue|undefined>(() => props.widgetOptions?.tooltipNumberFormat?.value as TooltipNumberFormatValue),
    displaySeriesLabel: computed<DisplaySeriesLabelValue|undefined>(() => (props.widgetOptions?.displaySeriesLabel?.value as DisplaySeriesLabelValue)),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
    noData: computed(() => (state.data ? !state.data?.results?.length : false)),
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
        // TODO: set sort and pagination
        const { status, response } = await _fetcher({
            widget_id: props.widgetId,
            granularity: state.granularity,
            group_by: [state.xAxisField],
            vars: props.dashboardVars,
            ...getWidgetLoadApiQueryDateRange(state.granularity, dateRange.value),
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
const getThreshold = (rawData: Data): number => {
    const maxNumber = rawData?.results?.reduce((max, obj) => {
        const values = Object.values(obj).filter((val) => typeof val === 'number');
        return Math.max(max, ...values);
    }, 0);
    return maxNumber * 0.08;
};
const drawChart = (rawData: Data|null) => {
    if (isEmpty(rawData)) return;

    const _threshold = getThreshold(rawData);

    let _refinedData = rawData?.results || [];
    if (!isDateField(state.xAxisField)) {
        const _sortedData = sortBy(rawData?.results, (v) => state.dataField.reduce((acc, field) => acc + (v[field] as number), 0)).reverse();
        _refinedData = _sortedData.slice(0, state.xAxisCount);
        const _etcData = _sortedData.slice(state.xAxisCount).reduce((acc, v) => {
            state.dataField.forEach((field) => {
                acc[field] = (acc[field] as number) + (v[field] as number);
            });
            return acc;
        }, Object.fromEntries(state.dataField.map((field) => [field, 0])));
        if (Object.values(_etcData).some((v) => v > 0)) {
            _refinedData.push({ [state.xAxisField]: 'etc', ..._etcData });
        }
    }

    const _seriesData: any[] = [];
    state.dataField?.forEach((field) => {
        const _unit: string|undefined = state.unitMap[field];
        _seriesData.push({
            name: field,
            type: 'bar',
            barMaxWidth: 24,
            barGap: 0,
            label: {
                show: !!state.displaySeriesLabel?.toggleValue,
                position: state.displaySeriesLabel?.position,
                rotate: state.displaySeriesLabel?.rotate,
                fontSize: 10,
                formatter: (p) => {
                    if (p.value < _threshold) return '';
                    return getFormattedNumber(p.value, field, state.numberFormat, _unit);
                },
            },
            data: state.xAxisData.map((d) => {
                const _data = _refinedData.find((v) => v[state.xAxisField] === d);
                return _data ? _data[field] : undefined;
            }),
        });
    });
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
