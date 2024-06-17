<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import {
    computed, defineExpose, reactive, ref,
} from 'vue';

import {
    PDataLoader,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import type { HeatmapSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import { groupBy, isEmpty, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import {
    getDateLabelFormat,
    getWidgetBasedOnDate,
    getWidgetDateFields,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';
import type { GroupByValue, XAxisValue } from '@/common/modules/widgets/types/widget-field-value-type';


type Data = ListResponse<{
    [key: string]: string|number;
}>;

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit);

const state = reactive({
    loading: false,
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
                interval: 0,
                formatter: (val) => {
                    if (state.xAxisField === DATE_FIELD) {
                        return dayjs.utc(val).format(getDateLabelFormat(state.granularity));
                    }
                    return val;
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
                interval: 0,
            },
        },
        tooltip: {
            position: 'top',
        },
        visualMap: {
            // type: 'piecewise',
            calculable: true,
            orient: 'horizontal',
            left: 'left',
            bottom: 0,
            // pieces: [
            //     {
            //         label: 'high', min: '50%', color: '#d94e5d',
            //     },
            //     {
            //         label: 'low', min: '30%', max: '49%', color: '#eca7a7',
            //     },
            // ],
            outOfRange: {
                color: '#999',
            },
        },
        series: [
            {
                name: 'project',
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
    //
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    xAxisField: computed<string>(() => (props.widgetOptions?.xAxis as XAxisValue)?.value),
    xAxisCount: computed<number>(() => (props.widgetOptions?.xAxis as XAxisValue)?.count),
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
    groupByField: computed<string|undefined>(() => (props.widgetOptions?.groupBy as GroupByValue)?.value as string),
    groupByCount: computed<number>(() => (props.widgetOptions?.groupBy as GroupByValue)?.count as number),
});

/* Util */
const fetchWidget = async (): Promise<Data|APIErrorToast> => {
    try {
        state.loading = true;
        let _start = state.basedOnDate;
        let _end = state.basedOnDate;
        if (state.xAxisField === DATE_FIELD) {
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.xAxisCount);
        }
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
            : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
        return await _fetcher({
            widget_id: props.widgetId,
            query: {
                granularity: state.granularity,
                start: _start,
                end: _end,
                group_by: [state.xAxisField, state.groupByField],
                fields: {
                    [state.dataField]: {
                        key: state.dataField,
                        operator: 'sum',
                    },
                },
            },
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return ErrorHandler.makeAPIErrorToast(e);
    } finally {
        state.loading = false;
    }
};
const drawChart = (rawData: Data|null) => {
    if (isEmpty(rawData)) return;

    // get xAxis, yAxis data
    let _xAxisData: string[] = [];
    if (state.xAxisField === DATE_FIELD) {
        const [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.xAxisCount);
        _xAxisData = getWidgetDateFields(state.granularity, _start, _end);
    } else {
        _xAxisData = Array.from(new Set(rawData.results?.map((v) => v[state.xAxisField] as string)));
    }
    state.xAxisData = _xAxisData.slice(0, state.xAxisCount);
    state.yAxisData = Array.from(new Set(rawData.results?.map((v) => v[state.groupByField]))).slice(0, state.groupByCount);

    // get chart data
    const _xAxisGroupedData = groupBy(rawData?.results, state.xAxisField);
    const _chartData: any[] = [];
    state.xAxisData.forEach((x, xIdx) => {
        state.yAxisData.forEach((y, yIdx) => {
            const _data = _xAxisGroupedData[x]?.find((v) => v[state.groupByField] === y);
            _chartData.push([xIdx, yIdx, _data ? _data[state.dataField] : 0]);
        });
    });
    state.chartData = _chartData;

    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions);
};

const loadWidget = async (data?: Data): Promise<Data|APIErrorToast> => {
    const res = data ?? await fetchWidget();
    if (typeof res === 'function') return res;
    state.data = res;
    drawChart(state.data);
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
        <p-data-loader class="chart-loader"
                       :loading="state.loading"
                       loader-type="skeleton"
                       disable-empty-case
                       :loader-backdrop-opacity="1"
                       show-data-from-scratch
        >
            <div ref="chartContext"
                 class="chart"
            />
        </p-data-loader>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.chart-loader {
    height: 100%;
    .chart {
        height: 100%;
    }
}
</style>
