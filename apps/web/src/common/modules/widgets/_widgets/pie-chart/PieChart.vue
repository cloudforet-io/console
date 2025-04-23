<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, onMounted,
    reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { PieSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import type { LegendOption, EChartsOption } from 'echarts/types/dist/shared';
import {
    isEmpty, orderBy, throttle,
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
import {
    getReferenceLabel,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import {
    getWidgetLoadApiQueryDateRange,
} from '@/common/modules/widgets/_helpers/widget-load-helper';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { DisplaySeriesLabelValue } from '@/common/modules/widgets/_widget-fields/display-series-label/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type { LegendValue } from '@/common/modules/widgets/_widget-fields/legend/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { PieChartTypeValue } from '@/common/modules/widgets/_widget-fields/pie-chart-type/type';
import type { TooltipNumberFormatValue } from '@/common/modules/widgets/_widget-fields/tooltip-number-format/type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';




interface ChartData {
    name: string;
    value: number;
}
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
    chartData: [] as ChartData[],
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[widgetOptionsState.dataFieldInfo?.data as string]),
    chartLegendOption: computed<LegendOption>(() => {
        if (!widgetOptionsState.legendInfo?.toggleValue) return { show: false };
        const _option: LegendOption = {
            show: true,
            type: 'scroll',
            itemWidth: 10,
            itemHeight: 10,
            icon: 'circle',
            formatter: (val) => {
                if (widgetOptionsState.groupByInfo?.data === DATE_FIELD.DATE) return dayjs.utc(val).format(state.dateFormat);
                return getReferenceLabel(props.allReferenceTypeInfo, widgetOptionsState.groupByInfo?.data as string, val);
            },
        };
        if (widgetOptionsState.legendInfo?.position && ['left', 'right'].includes(widgetOptionsState.legendInfo?.position)) {
            _option.orient = 'vertical';
            _option.top = 20;
            if (widgetOptionsState.legendInfo?.position === 'right') _option.right = 10;
            else _option.left = 10;
        } else {
            _option.orient = 'horizontal';
            if (widgetOptionsState.legendInfo?.position === 'bottom') _option.bottom = 0;
            else _option.top = 0;
        }
        return _option;
    }),
    chartSeriesOption: computed<PieSeriesOption>(() => {
        const _option: PieSeriesOption = {
            type: 'pie',
            avoidLabelOverlap: true,
        };
        if (widgetOptionsState.pieChartTypeInfo?.type === 'donut') {
            _option.radius = ['30%', '70%'];
        }
        if (widgetOptionsState.legendInfo?.position && ['left', 'right'].includes(widgetOptionsState.legendInfo?.position)) {
            if (props.size === 'full') {
                if (widgetOptionsState.legendInfo?.position === 'right') _option.center = ['40%', '50%'];
                else _option.center = ['60%', '50%'];
            } else _option.center = ['30%', '50%'];
        }
        if (widgetOptionsState.legendInfo?.position && ['top', 'bottom'].includes(widgetOptionsState.legendInfo?.position)) {
            if (widgetOptionsState.legendInfo?.position === 'bottom') {
                _option.center = ['50%', '45%'];
            } else {
                _option.center = ['50%', '55%'];
            }
        }
        return _option;
    }),
    chartOptions: computed<EChartsOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        tooltip: {
            trigger: 'item',
            position: 'inside',
            formatter: (params) => {
                let _name = getReferenceLabel(props.allReferenceTypeInfo, widgetOptionsState.groupByInfo?.data as string, params.name);
                if (widgetOptionsState.groupByInfo?.data === DATE_FIELD.DATE) {
                    _name = dayjs.utc(_name).format(state.dateFormat);
                }
                let _value = numberFormatter(params.value) || '';
                if (widgetOptionsState.tooltipNumberFormatInfo?.toggleValue) {
                    _value = getFormattedNumber(params.value, widgetOptionsState.numberFormatInfo?.[widgetOptionsState.dataFieldInfo?.data as string], state.unit);
                }
                if (state.unit) _name = `${_name} (${state.unit})`;
                return `${params.marker} ${_name}: <b>${_value}</b>`;
            },
        },
        grid: {
            containLabel: true,
        },
        legend: state.chartLegendOption,
        series: [
            {
                ...state.chartSeriesOption,
                label: {
                    show: !!widgetOptionsState.displaySeriesLabelInfo?.toggleValue,
                    position: widgetOptionsState.displaySeriesLabelInfo?.position,
                    rotate: widgetOptionsState.displaySeriesLabelInfo?.rotate,
                    fontSize: 10,
                    formatter: (p) => {
                        if (p.percent < 5) return '';
                        if (widgetOptionsState.displaySeriesLabelInfo?.format === 'percent') {
                            return `${p.percent}%`;
                        }
                        return getFormattedNumber(p.value, widgetOptionsState.numberFormatInfo?.[widgetOptionsState.dataFieldInfo?.data as string], state.unit);
                    },
                },
                data: state.chartData,
            },
        ],
    })),
    dateFormat: computed<string|undefined>(() => {
        const _dateFormat = (props.widgetOptions?.dateFormat?.value as DateFormatValue)?.format || 'MMM DD, YYYY';
        return DATE_FORMAT?.[_dateFormat]?.[widgetOptionsState.granularityInfo?.granularity];
    }),
});

const widgetOptionsState = reactive({
    granularityInfo: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
    dataFieldInfo: computed<DataFieldValue>(() => props.widgetOptions?.dataField?.value as DataFieldValue),
    groupByInfo: computed<GroupByValue>(() => props.widgetOptions?.groupBy?.value as GroupByValue),
    pieChartTypeInfo: computed<PieChartTypeValue>(() => props.widgetOptions?.pieChartType?.value as PieChartTypeValue),
    legendInfo: computed<LegendValue>(() => props.widgetOptions?.legend?.value as LegendValue),
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
        group_by: widgetOptionsState.groupByInfo?.data ? [widgetOptionsState.groupByInfo?.data as string] : [],
        sort: widgetOptionsState.dataFieldInfo?.data ? [{ key: widgetOptionsState.dataFieldInfo?.data as string, desc: true }] : undefined,
        page: { start: 0, limit: widgetOptionsState.groupByInfo?.count ?? 0 },
        vars: props.dashboardVars,
        ...getWidgetLoadApiQueryDateRange(widgetOptionsState.granularityInfo?.granularity, dateRange.value),
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
    return loadQuery.error?.value?.message as string;
});

const drawChart = (rawData: WidgetLoadResponse|null) => {
    if (isEmpty(rawData)) return;

    // get chart data
    const _groupByData = rawData?.results || [];
    let _refinedData: ChartData[] = _groupByData.map((d) => ({
        name: d[widgetOptionsState.groupByInfo?.data as string] as string,
        value: d[widgetOptionsState.dataFieldInfo?.data as string] as number,
    }));
    if (isDateField(widgetOptionsState.groupByInfo?.data as string)) {
        _refinedData = orderBy(_refinedData, 'name', 'desc');
        _refinedData = _refinedData?.slice(0, widgetOptionsState.groupByInfo?.count);
    } else {
        _refinedData = orderBy(_refinedData, 'value', 'desc');
        const _slicedData: ChartData[] = _refinedData?.slice(0, widgetOptionsState.groupByInfo?.count);
        const _etcData: ChartData = _refinedData?.slice(widgetOptionsState.groupByInfo?.count).reduce((acc, cur) => {
            acc.name = 'etc';
            acc.value = (acc.value || 0) + (cur.value || 0);
            return acc;
        }, {} as ChartData);
        _refinedData = isEmpty(_etcData) ? _slicedData : [..._slicedData, _etcData];
    }
    state.chartData = _refinedData;
};

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage,
    widgetLoading,
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
    loadWidget: async () => {
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
