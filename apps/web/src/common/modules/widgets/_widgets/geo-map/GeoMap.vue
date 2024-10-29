<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, reactive, ref, watch,
} from 'vue';

import axios from 'axios';
import type { MapSeriesOption } from 'echarts/charts';
import { init, registerMap } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import { throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { numberFormatter } from '@cloudforet/utils';

import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { RegionReferenceMap } from '@/store/reference/region-reference-store';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { LegendValue } from '@/common/modules/widgets/_widget-fields/legend/type';
import type { WidgetLoadData } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit,
    WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';

import { coral, gray } from '@/styles/colors';


const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const REGION_FIELD = 'Region';

const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
});
const chartContext = ref<HTMLElement|null>(null);
const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    regions: computed<RegionReferenceMap>(() => allReferenceStore.getters.region),
});
const state = reactive({
    mapLoaded: false,
    loading: false,
    errorMessage: undefined as string|undefined,
    data: null as WidgetLoadData | null,
    chart: null as EChartsType | null,
    chartData: [],
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[state.dataField]),
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
            formatter: (params) => {
                let _name = params.name;
                if (state.unit) _name = `${_name} (${state.unit})`;
                const _value = numberFormatter(params.value[2]) || '';
                return `${params.marker} ${_name}: <b>${_value}</b>`;
            },
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
    dataField: computed<string[]>(() => props.widgetOptions?.dataField as string[] || []),
    // optional fields
    showLegends: computed<boolean>(() => (props.widgetOptions?.legend as LegendValue)?.toggleValue),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
});

/* Api */
const privateWidgetFetcher = getCancellableFetcher<PrivateWidgetLoadParameters, WidgetLoadData>(SpaceConnector.clientV2.dashboard.privateWidget.load);
const publicWidgetFetcher = getCancellableFetcher<PublicWidgetLoadParameters, WidgetLoadData>(SpaceConnector.clientV2.dashboard.publicWidget.load);
const fetchWidget = async (): Promise<WidgetLoadData|APIErrorToast|undefined> => {
    if (props.widgetState === 'INACTIVE') return undefined;
    try {
        state.loading = true;
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate ? privateWidgetFetcher : publicWidgetFetcher;
        const { status, response } = await _fetcher({
            widget_id: props.widgetId,
            query: {
                granularity: state.granularity,
                start: dateRange.value.start,
                end: dateRange.value.end,
                group_by: [REGION_FIELD],
                fields: {
                    [state.dataField]: {
                        key: state.dataField,
                        operator: 'sum',
                    },
                },
            },
            vars: props.dashboardVars,
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

/* Util */
const loadMap = async () => {
    const response = await axios.get('map/geo-data.json');
    const geoJson = response.data;
    registerMap('world', geoJson);
    state.mapLoaded = true;
};
const drawChart = async (rawData: WidgetLoadData|null) => {
    if (!rawData) return;
    const _seriesData: any[] = [];
    rawData.results?.forEach((result) => {
        const _targetRegion = storeState.regions[result[REGION_FIELD]];
        _seriesData.push({
            name: _targetRegion?.label || result[REGION_FIELD],
            value: [
                _targetRegion?.continent.longitude,
                _targetRegion?.continent.latitude,
                result[state.dataField],
            ],
            itemStyle: {
                normal: {
                    color: coral[400],
                },
            },
        });
    });

    state.chartData = _seriesData;
};
const loadWidget = async (): Promise<WidgetLoadData|APIErrorToast> => {
    await loadMap();
    const res = await fetchWidget();
    if (!res) return state.data;
    if (typeof res === 'function') return res;
    state.data = res;
    await drawChart(state.data);
    return state.data;
};

/* Watcher */
watch([() => state.chartData, () => chartContext.value, () => state.mapLoaded], ([, chartCtx, mapLoaded]) => {
    if (chartCtx && mapLoaded) {
        state.chart = init(chartContext.value);
        state.chart.setOption(state.chartOptions, true);
    }
});

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
        <!--Do not delete div element below. It's defense code for redraw-->
        <div class="h-full">
            <div ref="chartContext"
                 class="h-full"
            />
        </div>
    </widget-frame>
</template>
