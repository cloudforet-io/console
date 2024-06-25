<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, reactive, ref,
} from 'vue';

import axios from 'axios';
import type { MapSeriesOption } from 'echarts/charts';
import { init, registerMap } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import { throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { RegionReferenceMap } from '@/store/reference/region-reference-store';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { getWidgetBasedOnDate, getWidgetDateRange } from '@/common/modules/widgets/_helpers/widget-date-helper';
import type { DateRange, WidgetLoadData } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit,
    WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';

import { coral, gray } from '@/styles/colors';


const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const REGION_FIELD = 'Region';

const chartContext = ref<HTMLElement|null>(null);
const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    regions: computed<RegionReferenceMap>(() => allReferenceStore.getters.region),
});
const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
    data: null as WidgetLoadData | null,
    chart: null as EChartsType | null,
    chartData: [],
    chartOptions: computed<MapSeriesOption>(() => ({
        map: 'world',
        geo: {
            type: 'map',
            map: 'world',
            roam: false,
            silent: true,
            itemStyle: {
                normal: {
                    areaColor: gray[200],
                    borderColor: gray[600],
                },
                emphasis: {
                    show: false,
                    areaColor: gray[200],
                },
            },
        },
        tooltip: {
            trigger: 'item',
            valueFormatter: (val) => numberFormatter(val) || '',
        },
        series: [
            {
                type: 'scatter',
                coordinateSystem: 'geo',
                data: state.chartData,
            },
        ],
    })),
    // required fields
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    dataField: computed<string[]>(() => props.widgetOptions?.dataField as string[] || []),
    dateRange: computed<DateRange>(() => {
        const [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, 1);
        return { start: _start, end: _end };
    }),
    // optional fields
    showLegends: computed<boolean>(() => props.widgetOptions?.legend as boolean),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange: computed(() => ({
        end: state.dateRange.end,
    })),
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
});

/* Api */
const fetchWidget = async (): Promise<WidgetLoadData|APIErrorToast> => {
    try {
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, WidgetLoadData>
            : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, WidgetLoadData>;
        const res = await _fetcher({
            widget_id: props.widgetId,
            query: {
                granularity: state.granularity,
                start: state.dateRange.start,
                end: state.dateRange.end,
                group_by: [REGION_FIELD],
                fields: {
                    [state.dataField]: {
                        key: state.dataField,
                        operator: 'sum',
                    },
                },
            },
            vars: props.vars,
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
const drawChart = async (rawData: WidgetLoadData|null) => {
    if (!rawData) return;
    const _seriesData: any[] = [];
    rawData.results?.forEach((result) => {
        _seriesData.push({
            name: storeState.regions[result[REGION_FIELD]].label,
            value: [
                storeState.regions[result[REGION_FIELD]].continent.longitude,
                storeState.regions[result[REGION_FIELD]].continent.latitude,
                result[state.dataField],
            ],
            label: {
                emphasis: {
                    position: 'right',
                    show: true,
                },
            },
            itemStyle: {
                normal: {
                    color: coral[400],
                },
            },
        });
    });
    state.chartData = _seriesData;
    const response = await axios.get('map/geo-data.json');
    const geoJson = response.data;
    registerMap('world', geoJson);
    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions, true);
};
const loadWidget = async (data?: WidgetLoadData): Promise<WidgetLoadData|APIErrorToast> => {
    state.loading = true;
    const res = data ?? await fetchWidget();
    if (typeof res === 'function') return res;
    state.data = res;
    await drawChart(state.data);
    state.loading = false;
    return state.data;
};

useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
useWidgetInitAndRefresh({ props, emit, loadWidget });
defineExpose<WidgetExpose<WidgetLoadData>>({
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
