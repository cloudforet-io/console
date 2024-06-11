<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed,
    onMounted, reactive, ref,
} from 'vue';

import {
    PDataLoader,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import type { BarSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import { isEmpty, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import {
    getDateLabelFormat,
    getWidgetBasedOnDate,
    getWidgetDateFields,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import type {
    WidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';
import type { XAxisValue } from '@/common/modules/widgets/types/widget-field-value-type';


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
    chartData: [],
    chartOptions: computed<BarSeriesOption>(() => ({
        legend: {
            bottom: 0,
            left: 0,
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
        },
        tooltip: {},
        xAxis: {
            type: 'category',
            axisLabel: {
                interval: 0,
                formatter: (val) => {
                    if (state.xAxisField === 'Date') {
                        return dayjs.utc(val).format(getDateLabelFormat(state.granularity));
                    }
                    return val;
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
    //
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    xAxisField: computed<string>(() => (props.widgetOptions?.xAxis as XAxisValue)?.value),
    xAxisCount: computed<number>(() => (props.widgetOptions?.xAxis as XAxisValue)?.count),
    dataField: computed<string[]>(() => props.widgetOptions?.dataField as string[]),
});

/* Util */
const loadWidget = async (): Promise<Data|null> => {
    try {
        let _start = state.basedOnDate;
        let _end = state.basedOnDate;
        if (state.xAxisField === 'Date') {
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.xAxisCount);
        }
        const _fields = {};
        state.dataField.forEach((field) => {
            _fields[field] = { key: field, operator: 'sum' };
        });
        return await SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>({
            widget_id: 'public-widget-74bd848364d0',
            data_table_id: 'public-dt-3d35c80a0cee',
            query: {
                granularity: state.granularity,
                start: _start,
                end: _end,
                group_by: [state.xAxisField],
                fields: _fields,
            },
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    }
};
const drawChart = (rawData: Data|null) => {
    if (isEmpty(rawData)) return;

    // get xAxis data
    let _xAxisData: string[] = [];
    if (state.xAxisField === 'Date') {
        const [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.xAxisCount);
        _xAxisData = getWidgetDateFields(state.granularity, _start, _end);
    } else {
        _xAxisData = Array.from(new Set(rawData.results?.map((v) => v[state.xAxisField] as string)));
    }
    state.xAxisData = _xAxisData.slice(0, state.xAxisCount);

    // get chart data
    const _seriesData: any[] = [];
    state.dataField.forEach((field) => {
        _seriesData.push({
            name: field,
            type: 'bar',
            barMaxWidth: 24,
            barGap: 0,
            data: _xAxisData.map((d) => {
                const _data = rawData.results?.find((v) => v[state.xAxisField] === d);
                return _data ? _data[field] : undefined;
            }),
        });
    });
    state.chartData = _seriesData;

    // init chart and set options
    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions);
};

const initWidget = async (data?: Data) => {
    state.data = data ?? await loadWidget();
    drawChart(state.data);
    return state.data;
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
