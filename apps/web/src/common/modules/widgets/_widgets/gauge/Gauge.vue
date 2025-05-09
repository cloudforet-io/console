<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, onMounted, reactive, ref, watch,
} from 'vue';

import type { GaugeSeriesOption } from 'echarts/charts';
import type {
    EChartsType,
} from 'echarts/core';
import { init } from 'echarts/core';
import { isEmpty, orderBy, throttle } from 'lodash';


import type { WidgetLoadResponse } from '@/api-clients/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDataTableQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-query';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetLoadQuery } from '@/common/modules/widgets/_composables/use-widget-load-query';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { FormatRulesValue, ThresholdValue } from '@/common/modules/widgets/_widget-fields/format-rules/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { MaxValue } from '@/common/modules/widgets/_widget-fields/max/type';
import type { MinValue } from '@/common/modules/widgets/_widget-fields/min/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type {
    WidgetProps, WidgetEmit,
    WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';

import { gray } from '@/styles/colors';


const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const { data: dataTable, isFetching: dataTableLoading } = useWidgetDataTableQuery(
    computed(() => props.dataTableId),
);

const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange?.value as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
});
const state = reactive({
    isPrivateWidget: computed<boolean>(() => props.widgetId.startsWith('private')),

    unit: computed<string|undefined>(() => {
        if (!widgetOptionsState.dataFieldInfo?.data) return undefined;
        return widgetFrameProps.value.unitMap?.[widgetOptionsState.dataFieldInfo.data as string];
    }),
    data: computed<WidgetLoadResponse | null>(() => loadQuery.data?.value || null),
    chart: null as EChartsType | null,
    chartData: undefined as undefined|number,
    chartOptions: computed<{series: GaugeSeriesOption[]}>(() => ({
        series: [
            {
                type: 'gauge',
                center: ['50%', '60%'],
                startAngle: 200,
                endAngle: -20,
                min: widgetOptionsState.minInfo?.min,
                max: widgetOptionsState.maxInfo?.max,
                splitNumber: 4,
                itemStyle: {
                    color: state.gaugeColor,
                },
                progress: {
                    show: true,
                    width: 30,
                },
                axisLine: {
                    lineStyle: {
                        width: 30,
                        color: [
                            [1, gray[200]],
                        ],
                    },
                },
                axisLabel: {
                    distance: -55,
                    color: gray[700],
                    fontSize: 12,
                    formatter: (val) => getFormattedNumber(val, widgetOptionsState.numberFormatInfo?.[widgetOptionsState.dataFieldInfo?.data as string], state.unit),
                },
                detail: {
                    offsetCenter: [0, 0],
                    fontSize: 32,
                    formatter: (val) => getFormattedNumber(val, widgetOptionsState.numberFormatInfo?.[widgetOptionsState.dataFieldInfo?.data as string], state.unit),
                    color: gray[700],
                },
                data: [
                    {
                        value: state.chartData,
                    },
                ],
                axisTick: { show: false },
                splitLine: { show: false },
                pointer: { show: false },
                anchor: { show: false },
            },
        ],
    })),
    gaugeColor: computed<string>(() => {
        let _formatRules: ThresholdValue[] = widgetOptionsState.formatRulesInfo?.rules || [];
        let _color = widgetOptionsState.formatRulesInfo?.baseColor || gray[200];
        const _percentage = (state.chartData / (widgetOptionsState.maxInfo?.max || 100)) * 100;
        _formatRules = orderBy(_formatRules, ['number'], ['asc']);
        _formatRules?.forEach((d) => {
            if (_percentage >= (d.number || 0)) {
                _color = d.color;
            }
        });
        return _color;
    }),
});

const widgetOptionsState = reactive({
    granularityInfo: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
    dataFieldInfo: computed<DataFieldValue>(() => props.widgetOptions?.dataField?.value as DataFieldValue),
    minInfo: computed<MinValue>(() => props.widgetOptions?.min?.value as MinValue),
    maxInfo: computed<MaxValue>(() => props.widgetOptions?.max?.value as MaxValue),
    formatRulesInfo: computed<FormatRulesValue>(() => props.widgetOptions?.formatRules?.value as FormatRulesValue),
    numberFormatInfo: computed<NumberFormatValue>(() => props.widgetOptions?.numberFormat?.value as NumberFormatValue),
});


/* Api */
const loadQuery = useWidgetLoadQuery({
    widgetId: computed(() => props.widgetId),
    params: computed(() => ({
        widget_id: props.widgetId,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        start: dateRange.value.start,
        end: dateRange.value.end,
        vars: props.dashboardVars,
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

/* Util */
const drawChart = (rawData: WidgetLoadResponse|null) => {
    if (isEmpty(rawData)) return;
    state.chartData = rawData?.results?.[0]?.[widgetOptionsState.dataFieldInfo?.data as string] || 0;
};

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage,
    widgetLoading,
});

/* Watcher */
watch([() => state.chartData, () => chartContext.value, () => props.widgetOptions], ([, chartCtx]) => {
    if (chartCtx) {
        state.chart = init(chartContext.value);
        state.chart.setOption(state.chartOptions, true);
    }
});
watch([() => state.data, () => props.widgetOptions, dataTable], ([newData,, _dataTable]) => {
    if (!_dataTable) return;
    drawChart(newData);
}, { immediate: true });

defineExpose<WidgetExpose>({
    loadWidget: () => {
        loadQuery.refetch();
    },
});
onMounted(() => {
    emit('mounted', props.widgetName);
});
useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
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
