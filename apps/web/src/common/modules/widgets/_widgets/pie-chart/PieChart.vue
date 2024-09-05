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
import { isEmpty, orderBy, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
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
    getApiQueryDateRange,
    getReferenceLabel,
    getWidgetBasedOnDate,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';
import type {
    GroupByValue, DateFormatValue, DisplaySeriesLabelValue, NumberFormatValue,
    LegendValue,
} from '@/common/modules/widgets/types/widget-field-value-type';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';


type Data = ListResponse<{
    [key: string]: string|number;
}>;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const chartContext = ref<HTMLElement|null>(null);
const state = reactive({
    loading: true,
    errorMessage: undefined as string|undefined,
    data: null as Data | null,
    chart: null as EChartsType | null,
    chartData: [],
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
                if (state.unit) _name = `${_name} (${state.unit})`;
                const _value = numberFormatter(params.value) || '';
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
                    formatter: (p) => getFormattedNumber(p.value, state.dataField, state.numberFormat, state.unit),
                },
                data: state.chartData,
            },
        ],
    })),
    // required fields
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
    groupByField: computed<string|undefined>(() => (props.widgetOptions?.groupBy as GroupByValue)?.value as string),
    groupByCount: computed<number>(() => (props.widgetOptions?.groupBy as GroupByValue)?.count as number),
    chartType: computed<string>(() => props.widgetOptions?.pieChartType as string),
    dateRange: computed<DateRange>(() => {
        const _dateRangeCount = Object.values(DATE_FIELD).includes(state.groupByField) ? state.groupByCount : 1;
        const [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, _dateRangeCount);
        return { start: _start, end: _end };
    }),
    // optional fields
    showLegends: computed<boolean>(() => (props.widgetOptions?.legend as LegendValue)?.toggleValue),
    legendPosition: computed<string|undefined>(() => (props.widgetOptions?.legend as LegendValue)?.position),
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
});

/* Util */
const fetchWidget = async (): Promise<Data|APIErrorToast|undefined> => {
    if (props.widgetState === 'INACTIVE') return undefined;
    try {
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
            : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
        const _queryDateRange = getApiQueryDateRange(state.granularity, state.dateRange);
        const res = await _fetcher({
            widget_id: props.widgetId,
            query: {
                granularity: state.granularity,
                start: _queryDateRange.start,
                end: _queryDateRange.end,
                group_by: [state.groupByField],
                fields: {
                    [state.dataField]: {
                        key: state.dataField,
                        operator: 'sum',
                    },
                },
            },
            vars: props.dashboardVars,
        });
        state.errorMessage = undefined;
        return res;
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
    const _orderedData = orderBy(rawData.results || [], state.dataField, 'desc');
    const _slicedData = _orderedData?.slice(0, state.groupByCount);
    const _etcData = _orderedData?.slice(state.groupByCount).reduce((acc, cur) => {
        acc[state.groupByField] = 'etc';
        acc[state.dataField] = (acc[state.dataField] || 0) + cur[state.dataField];
        return acc;
    }, {} as Record<string, string|number>);
    let _refinedData = isEmpty(_etcData) ? _slicedData : [..._slicedData, _etcData];
    _refinedData = orderBy(_refinedData, state.dataField, 'desc');
    state.chartData = _refinedData?.map((v) => ({
        name: v[state.groupByField],
        value: v[state.dataField],
    })) || [];
};

const loadWidget = async (): Promise<Data|APIErrorToast> => {
    state.loading = true;
    const res = await fetchWidget();
    if (typeof res === 'function') return res;
    state.data = res;
    drawChart(state.data);
    state.loading = false;
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
