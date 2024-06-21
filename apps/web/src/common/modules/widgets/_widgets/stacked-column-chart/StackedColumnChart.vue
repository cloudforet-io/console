<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import {
    computed, defineExpose, reactive, ref,
} from 'vue';

import dayjs from 'dayjs';
import type { BarSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
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
    getDateLabelFormat,
    getWidgetBasedOnDate,
    getWidgetDateFields,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetEmit, WidgetExpose, WidgetProps } from '@/common/modules/widgets/types/widget-display-type';
import type { StackByValue, XAxisValue } from '@/common/modules/widgets/types/widget-field-value-type';


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
    xAxisData: [],
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
        },
        tooltip: {
            valueFormatter: (val) => numberFormatter(val) || '',
        },
        xAxis: {
            type: 'category',
            data: state.xAxisData,
            axisLabel: {
                interval: 0,
                rotate: 45,
                formatter: (val) => {
                    if (state.xAxisField === DATE_FIELD) {
                        return dayjs.utc(val).format(getDateLabelFormat(state.granularity));
                    }
                    return val;
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
    // required fields
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    xAxisField: computed<string>(() => (props.widgetOptions?.xAxis as XAxisValue)?.value),
    xAxisCount: computed<number>(() => (props.widgetOptions?.xAxis as XAxisValue)?.count),
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
    stackByField: computed<string|undefined>(() => (props.widgetOptions?.stackBy as StackByValue)?.value as string),
    stackByCount: computed<number>(() => (props.widgetOptions?.stackBy as StackByValue)?.count as number),
    dateRange: computed<DateRange>(() => {
        let _start = state.basedOnDate;
        let _end = state.basedOnDate;
        if (state.xAxisField === DATE_FIELD) {
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.xAxisCount);
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
});

/* Util */
const fetchWidget = async (): Promise<Data|APIErrorToast> => {
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
                group_by: [state.xAxisField, state.stackByField],
                fields: {
                    [state.dataField]: {
                        key: state.dataField,
                        operator: 'sum',
                    },
                },
                field_group: [state.stackByField],
                sort: [{ key: `_total_${state.dataField}`, desc: true }],
                page: { start: 1, limit: state.xAxisCount },
            },
            vars: props.dashboardVariables,
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
const drawChart = (rawData?: Data|null) => {
    if (isEmpty(rawData)) return;

    // set xAxisData
    if (state.xAxisField === DATE_FIELD) {
        state.xAxisData = getWidgetDateFields(state.granularity, state.dateRange.start, state.dateRange.end);
    } else {
        state.xAxisData = rawData.results?.map((d) => d[state.xAxisField] as string) ?? [];
    }

    // slice stackByData by stackByCount
    const _slicedByStackBy: any[] = [];
    rawData.results?.forEach((d) => {
        const _values = orderBy(d[state.dataField], 'value', 'desc').slice(0, state.stackByCount);
        _values.forEach((v) => {
            _slicedByStackBy.push({
                [state.xAxisField]: d[state.xAxisField],
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
            data: state.xAxisData.map((d) => {
                const _data = value.find((v) => v[state.xAxisField] === d);
                return _data ? _data?.value : undefined;
            }),
        });
    });
    state.chartData = _seriesData;

    // init chart and set options
    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
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
        <div ref="chartContext"
             class="chart"
        />
    </widget-frame>
</template>

<style lang="postcss" scoped>
.chart {
    height: 100%;
}
</style>
