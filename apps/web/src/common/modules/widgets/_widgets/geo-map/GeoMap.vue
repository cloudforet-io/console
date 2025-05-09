<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, onMounted, reactive, ref, watch,
} from 'vue';

import axios from 'axios';
import type { MapSeriesOption } from 'echarts/charts';
import { init, registerMap } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import { throttle } from 'lodash';

import { numberFormatter } from '@cloudforet/utils';

import type { WidgetLoadResponse } from '@/api-clients/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { RegionReferenceMap } from '@/store/reference/region-reference-store';

import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDataTableQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-query';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetLoadQuery } from '@/common/modules/widgets/_composables/use-widget-load-query';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type {
    WidgetProps, WidgetEmit,
    WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';

import { coral, gray } from '@/styles/colors';




const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const REGION_FIELD = 'Region';
const { data: dataTable, isFetching: dataTableLoading } = useWidgetDataTableQuery(
    computed(() => props.dataTableId),
);

const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange?.value as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
});
const chartContext = ref<HTMLElement|null>(null);
const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    regions: computed<RegionReferenceMap>(() => allReferenceStore.getters.region),
});
const state = reactive({
    mapLoaded: false,
    isPrivateWidget: computed<boolean>(() => props.widgetId.startsWith('private')),

    data: computed<WidgetLoadResponse | null>(() => loadQuery.data?.value || null),
    chart: null as EChartsType | null,
    chartData: [],
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[widgetOptionsState.dataFieldInfo?.data as string]),
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
});

const widgetOptionsState = reactive({
    granularityInfo: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
    dataFieldInfo: computed<DataFieldValue>(() => props.widgetOptions?.dataField?.value as DataFieldValue),
    groupByInfo: computed<GroupByValue>(() => props.widgetOptions?.groupBy?.value as GroupByValue),
});

/* Api */
const loadQuery = useWidgetLoadQuery({
    widgetId: computed(() => props.widgetId),
    params: computed(() => ({
        widget_id: props.widgetId,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        group_by: !!widgetOptionsState.groupByInfo?.data && widgetOptionsState.groupByInfo?.data === 'Region' ? ['Region'] : [],
        vars: props.dashboardVars,
        start: dateRange.value.start,
        end: dateRange.value.end,
    })),
    additionalDeps: computed(() => ({
        widgetName: props.widgetName,
        dataTableId: props.dataTableId,
    })),
    enabled: computed(() => props.widgetState !== 'INACTIVE' && !!dataTable.value && !props.loadDisabled),
});

const widgetLoading = computed<boolean>(() => loadQuery.isFetching.value || dataTableLoading.value);
const errorMessage = computed<string|undefined>(() => {
    if (!dataTable.value) return i18n.t('COMMON.WIDGETS.NO_DATA_TABLE_ERROR_MESSAGE') as string;
    return loadQuery.error?.value?.message;
});

/* Util */
const loadMap = async () => {
    const response = await axios.get('map/geo-data.json');
    const geoJson = response.data;
    registerMap('world', geoJson);
    state.mapLoaded = true;
};
const drawChart = async (rawData: WidgetLoadResponse|null) => {
    if (!rawData) return;
    const _seriesData: any[] = [];
    rawData.results?.forEach((result) => {
        const _targetRegion = storeState.regions[result[REGION_FIELD]];
        _seriesData.push({
            name: _targetRegion?.label || result[REGION_FIELD],
            value: [
                _targetRegion?.continent.longitude,
                _targetRegion?.continent.latitude,
                result[widgetOptionsState.dataFieldInfo?.data as string],
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

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage,
    widgetLoading,
});

/* Watcher */
watch([() => state.chartData, () => chartContext.value, () => state.mapLoaded], ([, chartCtx, mapLoaded]) => {
    if (chartCtx && mapLoaded) {
        state.chart = init(chartContext.value);
        state.chart.setOption(state.chartOptions, true);
    }
});
watch([() => state.data, () => props.widgetOptions, dataTable], async ([newData,, _dataTable]) => {
    if (!_dataTable) return;
    await loadMap();
    await drawChart(newData);
}, { immediate: true });

useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));

defineExpose<WidgetExpose>({
    loadWidget: () => {
        loadQuery.refetch();
    },
});
onMounted(() => {
    emit('mounted', props.widgetName);
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
