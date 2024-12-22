<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose,
    reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { PieSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import type { LegendOption, EChartsOption } from 'echarts/types/dist/shared';
import {
    groupBy, isEmpty, orderBy, throttle, sumBy,
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
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { DisplaySeriesLabelValue } from '@/common/modules/widgets/_widget-fields/display-series-label/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type { LegendValue } from '@/common/modules/widgets/_widget-fields/legend/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { PieChartTypeValue } from '@/common/modules/widgets/_widget-fields/pie-chart-type/type';
import type { TooltipNumberFormatValue } from '@/common/modules/widgets/_widget-fields/tooltip-number-format/type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';



type Data = ListResponse<{
    [key: string]: string|number;
}>;
interface ChartData {
    name: string;
    value: number;
}
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange?.value as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
});
const chartContext = ref<HTMLElement|null>(null);
const state = reactive({
    loading: true,
    errorMessage: undefined as string|undefined,
    data: null as Data | null,
    chart: null as EChartsType | null,
    chartData: [] as ChartData[],
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[state.dataField]),
    chartLegendOption: computed<LegendOption>(() => {
        if (!state.showLegends) return { show: false };
        const _option: LegendOption = {
            show: true,
            type: 'scroll',
            itemWidth: 10,
            itemHeight: 10,
            icon: 'circle',
            formatter: (val) => {
                if (state.groupByField === DATE_FIELD.DATE) return dayjs.utc(val).format(state.dateFormat);
                return getReferenceLabel(props.allReferenceTypeInfo, state.groupByField, val);
            },
        };
        if (['left', 'right'].includes(state.legendPosition)) {
            _option.orient = 'vertical';
            _option.top = 20;
            if (state.legendPosition === 'right') _option.right = 10;
            else _option.left = 10;
        } else {
            _option.orient = 'horizontal';
            if (state.legendPosition === 'bottom') _option.bottom = 0;
            else _option.top = 0;
        }
        return _option;
    }),
    chartSeriesOption: computed<PieSeriesOption>(() => {
        const _option: PieSeriesOption = {
            type: 'pie',
            avoidLabelOverlap: true,
        };
        if (state.chartType === 'donut') {
            _option.radius = ['30%', '70%'];
        }
        if (['left', 'right'].includes(state.legendPosition)) {
            if (props.size === 'full') {
                if (state.legendPosition === 'right') _option.center = ['40%', '50%'];
                else _option.center = ['60%', '50%'];
            } else _option.center = ['30%', '50%'];
        }
        if (['top', 'bottom'].includes(state.legendPosition)) {
            if (state.legendPosition === 'bottom') {
                _option.center = ['50%', '45%'];
            } else {
                _option.center = ['50%', '55%'];
            }
        }
        return _option;
    }),
    chartOptions: computed<EChartsOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        tooltip: {
            trigger: 'item',
            position: 'inside',
            formatter: (params) => {
                let _name = getReferenceLabel(props.allReferenceTypeInfo, state.groupByField, params.name);
                if (state.groupByField === DATE_FIELD.DATE) {
                    _name = dayjs.utc(_name).format(state.dateFormat);
                }
                let _value = numberFormatter(params.value) || '';
                if (state.tooltipNumberFormat?.toggleValue) {
                    _value = getFormattedNumber(params.value, state.dataField, state.numberFormat, state.unit);
                }
                if (state.unit) _name = `${_name} (${state.unit})`;
                return `${params.marker} ${_name}: <b>${_value}</b>`;
            },
        },
        grid: {
            containLabel: true,
        },
        legend: state.chartLegendOption,
        series: [
            {
                ...state.chartSeriesOption,
                label: {
                    show: !!state.displaySeriesLabel?.toggleValue,
                    position: state.displaySeriesLabel?.position,
                    rotate: state.displaySeriesLabel?.rotate,
                    fontSize: 10,
                    formatter: (p) => {
                        if (p.percent < 5) return '';
                        if (state.displaySeriesLabel?.format === 'percent') {
                            return `${p.percent}%`;
                        }
                        return getFormattedNumber(p.value, state.dataField, state.numberFormat, state.unit);
                    },
                },
                data: state.chartData,
            },
        ],
    })),
    // required fields
    granularity: computed<string|undefined>(() => (props.widgetOptions?.granularity?.value as GranularityValue)?.granularity),
    dataField: computed<string|undefined>(() => (props.widgetOptions?.dataField?.value as DataFieldValue)?.data as string),
    groupByField: computed<string|undefined>(() => (props.widgetOptions?.groupBy?.value as GroupByValue)?.data as string),
    groupByCount: computed<number|undefined>(() => (props.widgetOptions?.groupBy?.value as GroupByValue)?.count),
    chartType: computed<string|undefined>(() => (props.widgetOptions?.pieChartType?.value as PieChartTypeValue)?.type),
    // optional fields
    showLegends: computed<boolean|undefined>(() => (props.widgetOptions?.legend?.value as LegendValue)?.toggleValue),
    legendPosition: computed<string|undefined>(() => (props.widgetOptions?.legend?.value as LegendValue)?.position),
    dateFormat: computed<string|undefined>(() => {
        const _dateFormat = (props.widgetOptions?.dateFormat?.value as DateFormatValue)?.format || 'MMM DD, YYYY';
        return DATE_FORMAT?.[_dateFormat]?.[state.granularity];
    }),
    numberFormat: computed<NumberFormatValue>(() => props.widgetOptions?.numberFormat?.value as NumberFormatValue),
    tooltipNumberFormat: computed<TooltipNumberFormatValue>(() => props.widgetOptions?.tooltipNumberFormat?.value as TooltipNumberFormatValue),
    displaySeriesLabel: computed(() => (props.widgetOptions?.displaySeriesLabel?.value as DisplaySeriesLabelValue)),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
});

/* Util */
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
            granularity: state.granularity,
            group_by: [state.groupByField],
            start: dateRange.value.start,
            end: dateRange.value.end,
            vars: props.dashboardVars,
            sort: [{ key: state.dataField, desc: true }],
            page: { start: 0, limit: state.groupByCount },
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
const drawChart = (rawData: Data|null) => {
    if (isEmpty(rawData)) return;

    // get chart data
    const _groupByData = groupBy(rawData.results || [], state.groupByField);
    let _refinedData: ChartData[] = Object.entries(_groupByData).map(([k, v]) => ({
        name: k,
        value: sumBy(v, state.dataField),
    }));
    if (isDateField(state.groupByField)) {
        _refinedData = orderBy(_refinedData, 'name', 'desc');
        _refinedData = _refinedData?.slice(0, state.groupByCount);
    } else {
        _refinedData = orderBy(_refinedData, 'value', 'desc');
        const _slicedData: ChartData[] = _refinedData?.slice(0, state.groupByCount);
        const _etcData: ChartData = _refinedData?.slice(state.groupByCount).reduce((acc, cur) => {
            acc.name = 'etc';
            acc.value = (acc.value || 0) + (cur.value || 0);
            return acc;
        }, {} as ChartData);
        _refinedData = isEmpty(_etcData) ? _slicedData : [..._slicedData, _etcData];
    }
    state.chartData = _refinedData;
};

const loadWidget = async (): Promise<Data|APIErrorToast> => {
    const res = await fetchWidget();
    if (!res) return state.data;
    if (typeof res === 'function') return res;
    state.data = res;
    drawChart(state.data);
    return state.data;
};

watch(() => props.size, () => {
    state.chart.setOption(state.chartOptions, true);
}, { immediate: false });
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
