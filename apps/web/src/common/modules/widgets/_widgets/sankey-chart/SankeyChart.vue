<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, onMounted,
    reactive, ref, watch,
} from 'vue';

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

import { numberFormatter } from '@cloudforet/utils';

import type { WidgetLoadResponse } from '@/api-clients/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDataTableQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-query';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetLoadQuery } from '@/common/modules/widgets/_composables/use-widget-load-query';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import { DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import { getReferenceLabel } from '@/common/modules/widgets/_helpers/widget-date-helper';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import {
    getWidgetLoadApiQueryDateRange, getWidgetLoadApiQuerySort,
} from '@/common/modules/widgets/_helpers/widget-load-helper';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { DisplaySeriesLabelValue } from '@/common/modules/widgets/_widget-fields/display-series-label/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { SankeyDimensionsValue } from '@/common/modules/widgets/_widget-fields/sankey-dimensions/type';
import type { TooltipNumberFormatValue } from '@/common/modules/widgets/_widget-fields/tooltip-number-format/type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';



const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { data: dataTable, isFetching: dataTableLoading } = useWidgetDataTableQuery(
    computed(() => props.dataTableId),
);

const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange?.value as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
});
const chartContext = ref<HTMLElement|null>(null);
const state = reactive({
    isPrivateWidget: computed<boolean>(() => props.widgetId.startsWith('private')),
    data: computed<WidgetLoadResponse | null>(() => loadQuery.data?.value || null),
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
                const _sourceField = widgetOptionsState.sankeyDimensionsInfo?.data?.[0] as string;
                const _targetField = widgetOptionsState.sankeyDimensionsInfo?.data?.[1] as string;
                if (!_source || !_target) return '';
                if (_sourceField === DATE_FIELD.DATE) {
                    _source = dayjs.utc(_source).format(state.dateFormat);
                }
                if (_targetField === DATE_FIELD.DATE) {
                    _target = dayjs.utc(_target).format(state.dateFormat);
                }
                let _value = numberFormatter(params.data.value) || '';
                if (widgetOptionsState.tooltipNumberFormatInfo?.toggleValue) {
                    _value = getFormattedNumber(params.data.value, widgetOptionsState.numberFormatInfo?.[widgetOptionsState.dataFieldInfo?.data as string], state.unit);
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
    sankeyDimensionsInfo: computed<SankeyDimensionsValue|undefined>(() => props.widgetOptions?.sankeyDimensions?.value as SankeyDimensionsValue),
    dateFormatInfo: computed<DateFormatValue>(() => props.widgetOptions?.dateFormat?.value as DateFormatValue),
    numberFormatInfo: computed<NumberFormatValue>(() => props.widgetOptions?.numberFormat?.value as NumberFormatValue),
    tooltipNumberFormatInfo: computed<TooltipNumberFormatValue>(() => props.widgetOptions?.tooltipNumberFormat?.value as TooltipNumberFormatValue),
    displaySeriesLabelInfo: computed<DisplaySeriesLabelValue>(() => props.widgetOptions?.displaySeriesLabel?.value as DisplaySeriesLabelValue),
});



/* Api */
const loadQuery = useWidgetLoadQuery({
    widgetId: computed(() => props.widgetId),
    params: computed(() => ({
        widget_id: props.widgetId,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        group_by: widgetOptionsState.sankeyDimensionsInfo?.data,
        sort: getWidgetLoadApiQuerySort(widgetOptionsState.sankeyDimensionsInfo?.data?.[0] as string, [widgetOptionsState.dataFieldInfo?.data as string]),
        page: { start: 0, limit: widgetOptionsState.sankeyDimensionsInfo?.count ?? 0 },
        vars: props.dashboardVars,
        ...getWidgetLoadApiQueryDateRange(widgetOptionsState.granularityInfo?.granularity, dateRange.value),
    })),
    additionalDeps: computed(() => ({
        widgetName: props.widgetName,
        dataTableId: props.dataTableId,
    })),
    enabled: computed<boolean>(() => props.widgetState !== 'INACTIVE' && !!dataTable.value && !props.loadDisabled),
});

const widgetLoading = computed<boolean>(() => loadQuery.isFetching.value || dataTableLoading.value);

const errorMessage = computed<string|undefined>(() => {
    if (!dataTable.value) return i18n.t('COMMON.WIDGETS.NO_DATA_TABLE_ERROR_MESSAGE') as string;
    return loadQuery.error?.value?.message as string;
});

const drawChart = (rawData: WidgetLoadResponse|null) => {
    if (isEmpty(rawData)) return;

    const _dataSet = new Set<string>();
    const _links: SankeySeriesOption['links'] = [];
    const _left = widgetOptionsState.sankeyDimensionsInfo?.data?.[0] as string;
    const _right = widgetOptionsState.sankeyDimensionsInfo?.data?.[1] as string;
    const _dataField = widgetOptionsState.dataFieldInfo?.data as string;
    const _sourceField = widgetOptionsState.sankeyDimensionsInfo?.data?.[0] as string;
    const _targetField = widgetOptionsState.sankeyDimensionsInfo?.data?.[1] as string;
    if (!_left || !_right || !_dataField) {
        state.links = [];
        state.chartData = [];
        return;
    }
    rawData?.results?.forEach((d) => {
        _links.push({
            source: getReferenceLabel(props.allReferenceTypeInfo, _sourceField, d[_left] as string),
            target: getReferenceLabel(props.allReferenceTypeInfo, _targetField, d[_right] as string),
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

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage,
    widgetLoading,
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
watch([() => state.data, () => props.widgetOptions, dataTable], ([newData,, _dataTable]) => {
    if (!_dataTable) return;
    drawChart(newData);
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
