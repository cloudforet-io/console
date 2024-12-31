<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, onMounted,
    reactive, ref, watch,
} from 'vue';

import { useQuery } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import type { SankeySeriesOption } from 'echarts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import type { EChartsOption } from 'echarts/types/dist/shared';
import {
    isEmpty, throttle,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { DATE_FIELD, WIDGET_LOAD_STALE_TIME } from '@/common/modules/widgets/_constants/widget-constant';
import { DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import { normalizeAndSerialize } from '@/common/modules/widgets/_helpers/global-variable-helper';
import { sortObjectByKeys } from '@/common/modules/widgets/_helpers/widget-data-table-helper';
import { getReferenceLabel } from '@/common/modules/widgets/_helpers/widget-date-helper';
import { getFormattedNumber, getWidgetDataTable } from '@/common/modules/widgets/_helpers/widget-helper';
import {
    getWidgetLoadApiQueryDateRange, getWidgetLoadApiQuerySort,
} from '@/common/modules/widgets/_helpers/widget-load-helper';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { DisplaySeriesLabelValue } from '@/common/modules/widgets/_widget-fields/display-series-label/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { SankeyAxisValue } from '@/common/modules/widgets/_widget-fields/sankey-axis/type';
import type { TooltipNumberFormatValue } from '@/common/modules/widgets/_widget-fields/tooltip-number-format/type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';



type Data = ListResponse<{
    [key: string]: string|number;
}>;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange?.value as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
});
const chartContext = ref<HTMLElement|null>(null);
const state = reactive({
    runQueries: false,
    isPrivateWidget: computed<boolean>(() => props.widgetId.startsWith('private')),
    dataTable: undefined as PublicDataTableModel|PrivateDataTableModel|undefined,

    data: computed<Data | null>(() => queryResult?.data?.value || null),
    chart: null as EChartsType | null,
    chartData: [] as SankeySeriesOption['data'],
    links: [] as SankeySeriesOption['links'],
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[widgetOptionsState.dataFieldInfo?.data as string]),
    chartOptions: computed<EChartsOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        animation: false,
        series: {
            type: 'sankey',
            layout: 'none',
            emphasis: {
                focus: 'adjacency',
            },
            links: state.links,
            data: state.chartData,
            lineStyle: {
                color: 'source',
                curveness: 0.5,
            },
            layoutIterations: 0,
        },
        grid: {
            containLabel: true,
        },
        tooltip: {
            trigger: 'item',
            position: 'inside',
            formatter: (params) => {
                let _source = params.data.source as string;
                let _target = params.data.target as string;
                if (_source === DATE_FIELD.DATE) {
                    _source = dayjs.utc(_source).format(state.dateFormat);
                } else {
                    getReferenceLabel(props.allReferenceTypeInfo, widgetOptionsState.sankeyAxisInfo?.data?.[0] as string, _source);
                }
                if (_target === DATE_FIELD.DATE) {
                    _target = dayjs.utc(_target).format(state.dateFormat);
                } else {
                    getReferenceLabel(props.allReferenceTypeInfo, widgetOptionsState.sankeyAxisInfo?.data?.[1] as string, _target);
                }
                let _value = numberFormatter(params.data.value) || '';
                if (widgetOptionsState.tooltipNumberFormatInfo?.toggleValue) {
                    _value = getFormattedNumber(params.data.value, widgetOptionsState.dataFieldInfo?.data as string, widgetOptionsState.numberFormatInfo, state.unit);
                }
                return `${_source} - ${_target}: <b>${_value}</b>`;
            },
        },
    })),
    dateFormat: computed<string|undefined>(() => {
        const _dateFormat = (props.widgetOptions?.dateFormat?.value as DateFormatValue)?.format || 'MMM DD, YYYY';
        return DATE_FORMAT?.[_dateFormat]?.[widgetOptionsState.granularityInfo?.granularity];
    }),
});

const widgetOptionsState = reactive({
    granularityInfo: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
    dataFieldInfo: computed<DataFieldValue>(() => props.widgetOptions?.dataField?.value as DataFieldValue),
    sankeyAxisInfo: computed<SankeyAxisValue|undefined>(() => props.widgetOptions?.sankeyAxis?.value as SankeyAxisValue),
    dateFormatInfo: computed<DateFormatValue>(() => props.widgetOptions?.dateFormat?.value as DateFormatValue),
    numberFormatInfo: computed<NumberFormatValue>(() => props.widgetOptions?.numberFormat?.value as NumberFormatValue),
    tooltipNumberFormatInfo: computed<TooltipNumberFormatValue>(() => props.widgetOptions?.tooltipNumberFormat?.value as TooltipNumberFormatValue),
    displaySeriesLabelInfo: computed<DisplaySeriesLabelValue>(() => props.widgetOptions?.displaySeriesLabel?.value as DisplaySeriesLabelValue),
});



/* Util */
const fetchWidgetData = async (params: PrivateWidgetLoadParameters|PublicWidgetLoadParameters): Promise<Data> => {
    const defaultFetcher = state.isPrivateWidget
        ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
        : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
    const res = await defaultFetcher(params);
    return res;
};

const queryKey = computed(() => [
    'widget-load-sankey-chart',
    props.widgetId,
    {
        start: dateRange.value.start,
        end: dateRange.value.end,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        dataTableId: state.dataTable?.data_table_id,
        dataTableOptions: JSON.stringify(sortObjectByKeys(state.dataTable?.options) ?? {}),
        sankeyAxis: widgetOptionsState.sankeyAxisInfo?.data,
        count: widgetOptionsState.sankeyAxisInfo?.count,
        vars: normalizeAndSerialize(props.dashboardVars),
    },
]);

const queryResult = useQuery({
    queryKey,
    queryFn: () => fetchWidgetData({
        widget_id: props.widgetId,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        group_by: widgetOptionsState.sankeyAxisInfo?.data,
        sort: getWidgetLoadApiQuerySort(widgetOptionsState.sankeyAxisInfo?.data?.[0] as string, [widgetOptionsState.dataFieldInfo?.data as string]),
        page: { start: 0, limit: widgetOptionsState.sankeyAxisInfo?.count ?? 0 },
        vars: props.dashboardVars,
        ...getWidgetLoadApiQueryDateRange(widgetOptionsState.granularityInfo?.granularity, dateRange.value),
    }),
    enabled: computed(() => props.widgetState !== 'INACTIVE' && !!state.dataTable && state.runQueries),
    staleTime: WIDGET_LOAD_STALE_TIME,
});

const widgetLoading = computed<boolean>(() => queryResult.isLoading);
const errorMessage = computed<string>(() => queryResult.error?.value?.message);

const drawChart = (rawData: Data|null) => {
    if (isEmpty(rawData)) return;

    const _dataSet = new Set<string>();
    const _links: SankeySeriesOption['links'] = [];
    const _left = widgetOptionsState.sankeyAxisInfo?.data?.[0] as string;
    const _right = widgetOptionsState.sankeyAxisInfo?.data?.[1] as string;
    const _dataField = widgetOptionsState.dataFieldInfo?.data as string;
    if (!_left || !_right || !_dataField) {
        state.links = [];
        state.chartData = [];
        return;
    }
    rawData?.results?.forEach((d) => {
        _links.push({
            source: d[_left] as string,
            target: d[_right] as string,
            value: d[_dataField] as number,
        });
    });
    _links.forEach((d) => {
        _dataSet.add(d.source as string);
        _dataSet.add(d.target as string);
    });
    state.links = _links;
    state.chartData = Array.from(_dataSet).map((d) => ({ name: d }));
};

const loadWidget = () => {
    state.runQueries = true;
};

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage,
    widgetLoading: widgetLoading.value,
    noData: computed(() => (state.data ? !state.data?.results?.length : false)),
});

watch(() => props.size, () => {
    state.chart.setOption(state.chartOptions, true);
}, { immediate: false });
watch([() => state.chartData, () => chartContext.value], ([, chartCtx]) => {
    if (chartCtx) {
        state.chart = init(chartContext.value);
        state.chart.setOption(state.chartOptions, true);
    }
});
watch(() => state.data, (newData) => {
    drawChart(newData);
});

useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
useWidgetInitAndRefresh({ props, emit, loadWidget });
onMounted(async () => {
    if (!props.dataTableId) return;
    state.dataTable = await getWidgetDataTable(props.dataTableId);
});
defineExpose<WidgetExpose>({
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
