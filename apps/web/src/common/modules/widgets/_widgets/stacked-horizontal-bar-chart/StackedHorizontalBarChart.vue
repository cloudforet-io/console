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
    groupBy, isEmpty, orderBy, throttle,
} from 'lodash';

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
import {
    getAllRequiredFieldsFilled,
    getDateLabelFormat, getReferenceLabel,
    getWidgetBasedOnDate,
    getWidgetDateFields,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetEmit, WidgetExpose, WidgetProps } from '@/common/modules/widgets/types/widget-display-type';
import type { StackByValue, YAxisValue } from '@/common/modules/widgets/types/widget-field-value-type';


type Data = ListResponse<{
    [key: string]: string|number;
}>;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
    allRequiredFieldsFilled: computed(() => getAllRequiredFieldsFilled(props.widgetName, props.widgetOptions)),
    data: null as Data | null,
    yAxisData: [],
    chartData: [],
    chart: null as EChartsType | null,
    chartOptions: computed<BarSeriesOption>(() => ({
        legend: {
            type: 'scroll',
            show: state.showLegends,
            bottom: 0,
            left: 0,
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
            formatter: (val) => getReferenceLabel(props.allReferenceTypeInfo, state.stackByField, val),
        },
        tooltip: {
            formatter: (params) => {
                const _params = Array.isArray(params) ? params : [params];
                return _params.map((p) => {
                    const _seriesName = getReferenceLabel(props.allReferenceTypeInfo, state.stackByField, p.seriesName);
                    const _value = numberFormatter(p.value) || '';
                    return `${_seriesName}<br>${p.marker} ${params.name}: <b>${_value}</b>`;
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
                        return dayjs.utc(val).format(getDateLabelFormat(state.granularity));
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
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
    stackByField: computed<string|undefined>(() => (props.widgetOptions?.stackBy as StackByValue)?.value as string),
    stackByCount: computed<number>(() => (props.widgetOptions?.stackBy as StackByValue)?.count as number),
    dateRange: computed<DateRange>(() => {
        let _start = state.basedOnDate;
        let _end = state.basedOnDate;
        if (Object.values(DATE_FIELD).includes(state.yAxisField)) {
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.yAxisCount);
        } else if (Object.values(DATE_FIELD).includes(state.stackByField)) {
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.stackByCount);
        }
        return { start: _start, end: _end };
    }),
    // optional fields
    showLegends: computed<boolean>(() => props.widgetOptions?.legend as boolean),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange: computed(() => state.dateRange),
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
    noData: computed(() => (state.data ? !state.data.results?.length : false)),
});

/* Api */
const fetchWidget = async (): Promise<Data|APIErrorToast|undefined> => {
    if (!state.allRequiredFieldsFilled) return undefined;
    try {
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
            : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
        const res = await _fetcher({
            widget_id: props.widgetId,
            query: {
                granularity: state.granularity,
                start: state.dateRange.start,
                end: state.dateRange.end,
                group_by: [state.yAxisField, state.stackByField],
                fields: {
                    [state.dataField]: {
                        key: state.dataField,
                        operator: 'sum',
                    },
                },
                field_group: [state.stackByField],
                sort: [{ key: `_total_${state.dataField}`, desc: true }],
                page: { start: 1, limit: state.yAxisCount },
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

/* Util */
const drawChart = (rawData?: Data|null) => {
    if (isEmpty(rawData)) return;

    // set yAxisData
    if (state.yAxisField === DATE_FIELD.DATE) {
        state.yAxisData = getWidgetDateFields(state.granularity, state.dateRange.start, state.dateRange.end);
    } else {
        state.yAxisData = rawData.results?.map((d) => d[state.yAxisField] as string) ?? [];
    }

    // slice stackByData by stackByCount
    const _slicedByStackBy: any[] = [];
    rawData.results?.forEach((d) => {
        const _slicedData = orderBy(d[state.dataField], 'value', 'desc').slice(0, state.stackByCount);
        const _etcData = d[state.dataField].slice(state.stackByCount).reduce((acc, v) => {
            acc[state.stackByField] = 'etc';
            acc.value += v.value;
            return acc;
        }, {});
        const _values = isEmpty(_etcData) ? _slicedData : [..._slicedData, _etcData];
        _values.forEach((v) => {
            _slicedByStackBy.push({
                [state.yAxisField]: d[state.yAxisField],
                ...v,
            });
        });
    });

    // set chartData
    const _seriesData: any[] = [];
    Object.entries(groupBy(_slicedByStackBy, state.stackByField)).forEach(([key, value]) => {
        _seriesData.push({
            name: key,
            type: 'bar',
            stack: true,
            barMaxWidth: 50,
            data: state.yAxisData.map((d) => {
                const _data = value.find((v) => v[state.yAxisField] === d);
                return _data ? _data?.value : undefined;
            }),
        });
    });
    state.chartData = _seriesData;
};
const loadWidget = async (data?: Data): Promise<Data|APIErrorToast> => {
    state.loading = true;
    const res = data ?? await fetchWidget();
    if (typeof res === 'function') return res;
    state.data = res;
    drawChart(state.data);
    state.loading = false;
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
