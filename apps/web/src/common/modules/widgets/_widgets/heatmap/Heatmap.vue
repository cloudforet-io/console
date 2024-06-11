<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import {
    computed,
    onMounted, reactive, ref,
} from 'vue';

import {
    PDataLoader,
} from '@spaceone/design-system';
import type { HeatmapSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import { groupBy, isEmpty, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import {
    getWidgetBasedOnDate,
    getWidgetDateFields,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import type {
    WidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';
import type { GroupByValue, XAxisValue } from '@/common/modules/widgets/types/widget-field-value-type';


type Data = ListResponse<{
    [key: string]: string|number;
}>;

const props = defineProps<WidgetProps<Data>>();
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
            type: 'piecewise',
            calculable: true,
            orient: 'horizontal',
            left: 'left',
            bottom: 0,
            pieces: [
                { min: 1000000001, color: '#d94e5d' },
                { min: 1000001, max: 1000000000, color: '#50a3ba' },
                { min: 1000, max: 1000000, color: '#eac736' },
            ],
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
const loadWidget = async (): Promise<Data|null> => {
    try {
        state.loading = true;
        let _start = state.basedOnDate;
        let _end = state.basedOnDate;
        if (state.xAxisField === 'Date') {
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.xAxisCount);
        }
        return await SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>({
            widget_id: 'public-widget-74bd848364d0',
            data_table_id: 'public-dt-3d35c80a0cee',
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
        return null;
    } finally {
        state.loading = false;
    }
};
const drawChart = (rawData: Data|null) => {
    if (isEmpty(rawData)) return;

    // get xAxis, yAxis data
    let _xAxisData: string[] = [];
    if (state.xAxisField === 'Date') {
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

const initWidget = async (data?: Data) => {
    state.data = data ?? await loadWidget();
    drawChart(state.data);
};
onMounted(async () => {
    await initWidget();
});

useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
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
