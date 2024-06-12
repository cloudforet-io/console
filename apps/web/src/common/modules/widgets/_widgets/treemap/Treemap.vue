<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed,
    onMounted, reactive, ref,
} from 'vue';

import {
    PDataLoader,
} from '@spaceone/design-system';
import type { TreemapSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import { isEmpty, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import { getWidgetBasedOnDate, getWidgetDateRange } from '@/common/modules/widgets/_helpers/widget-date-helper';
import type {
    WidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';
import type { CategoryByValue } from '@/common/modules/widgets/types/widget-field-value-type';


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
    chartData: [],
    chartOptions: computed<TreemapSeriesOption>(() => ({
        tooltip: {
            trigger: 'item',
            position: 'inside',
        },
        legend: {
            bottom: 0,
            left: 0,
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
        },
        series: [
            {
                type: 'treemap',
                nodeClick: false,
                breadcrumb: {
                    show: false,
                },
                label: {
                    fontSize: 12,
                },
                data: state.chartData,
            },
        ],
    })),
    //
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
    categoryByField: computed<string|undefined>(() => (props.widgetOptions?.categoryBy as CategoryByValue)?.value as string),
    categoryByCount: computed<number>(() => (props.widgetOptions?.categoryBy as CategoryByValue)?.count as number),
});

/* Util */
const loadWidget = async (): Promise<Data|null> => {
    try {
        state.loading = true;
        const [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, 1);
        return await SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>({
            widget_id: 'public-widget-74bd848364d0',
            query: {
                granularity: state.granularity,
                start: _start,
                end: _end,
                group_by: [state.categoryByField],
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

    // get chart data
    const _slicedData = rawData.results?.slice(0, state.categoryByCount);
    state.chartData = _slicedData?.map((v) => ({
        name: v[state.categoryByField],
        value: v[state.dataField],
    })) || [];

    // init chart and set options
    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions);
};

const initWidget = async (data?: Data) => {
    state.data = data ?? await loadWidget();
    drawChart(state.data);
};

onMounted(() => {
    initWidget();
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
