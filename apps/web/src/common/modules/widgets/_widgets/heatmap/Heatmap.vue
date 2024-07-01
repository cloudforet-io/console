<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import {
    computed, defineExpose, reactive, ref,
} from 'vue';

import dayjs from 'dayjs';
import type { HeatmapSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
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
import {
    getDateLabelFormat, getReferenceLabel,
    getWidgetBasedOnDate,
    getWidgetDateFields,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';
import type { XAxisValue, YAxisValue } from '@/common/modules/widgets/types/widget-field-value-type';


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
    xAxisData: [],
    yAxisData: [],
    chartData: [],
    chartOptions: computed<HeatmapSeriesOption>(() => ({
        xAxis: {
            type: 'category',
            data: state.xAxisData,
            axisLabel: {
                formatter: (val) => {
                    if (state.xAxisField === DATE_FIELD.DATE) {
                        return dayjs.utc(val).format(getDateLabelFormat(state.granularity));
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
                    if (state.yAxisField === DATE_FIELD.DATE) {
                        return dayjs.utc(val).format(getDateLabelFormat(state.granularity));
                    }
                    return getReferenceLabel(props.allReferenceTypeInfo, state.yAxisField, val);
                },
            },
        },
        tooltip: {
            position: 'top',
            formatter: (params) => {
                const _name = getReferenceLabel(props.allReferenceTypeInfo, state.xAxisField, params.name);
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
            // inRange: {
            //     color: ['#cdd3ef', '#21e121'],
            // },
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
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
    xAxisField: computed<string>(() => (props.widgetOptions?.xAxis as XAxisValue)?.value),
    xAxisCount: computed<number>(() => (props.widgetOptions?.xAxis as XAxisValue)?.count),
    yAxisField: computed<string>(() => (props.widgetOptions?.yAxis as YAxisValue)?.value),
    yAxisCount: computed<number>(() => (props.widgetOptions?.yAxis as YAxisValue)?.count),
    dateRange: computed<DateRange>(() => {
        let _start = state.basedOnDate;
        let _end = state.basedOnDate;
        if (Object.values(DATE_FIELD).includes(state.xAxisField)) {
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.xAxisCount);
        } else if (Object.values(DATE_FIELD).includes(state.yAxisField)) {
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.yAxisCount);
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
                group_by: [state.xAxisField, state.yAxisField],
                fields: {
                    [state.dataField]: {
                        key: state.dataField,
                        operator: 'sum',
                    },
                },
                field_group: [state.yAxisField],
                sort: [{ key: `_total_${state.dataField}`, desc: true }],
                page: { start: 1, limit: state.xAxisCount },
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

    // get xAxis, yAxis data
    if (state.xAxisField === DATE_FIELD.DATE) {
        state.xAxisData = getWidgetDateFields(state.granularity, state.dateRange.start, state.dateRange.end);
    } else {
        state.xAxisData = rawData.results?.map((d) => d[state.xAxisField] as string) ?? [];
    }

    // slice yAxisData by yAxisCount
    const _refinedByYAxisCount: any[] = [];
    rawData.results?.forEach((d) => {
        const _values = orderBy(d[state.dataField], 'value', 'desc').slice(0, state.yAxisCount);
        _values.forEach((v) => {
            _refinedByYAxisCount.push({
                [state.xAxisField]: d[state.xAxisField],
                ...v,
            });
        });
    });
    state.yAxisData = Array.from(new Set(_refinedByYAxisCount.map((d) => d[state.yAxisField])));

    // set chartData
    const _chartData: any[] = [];
    state.xAxisData.forEach((x, xIdx) => {
        state.yAxisData.forEach((y, yIdx) => {
            const _data = _refinedByYAxisCount.find((d) => d[state.xAxisField] === x && d[state.yAxisField] === y);
            _chartData.push([xIdx, yIdx, _data ? _data.value : 0]);
        });
    });
    state.chartData = _chartData;

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
