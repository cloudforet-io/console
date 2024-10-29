<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, reactive, ref, watch,
} from 'vue';

import type { GaugeSeriesOption } from 'echarts/charts';
import type {
    EChartsType,
} from 'echarts/core';
import { init } from 'echarts/core';
import { isEmpty, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { FormatRulesValue } from '@/common/modules/widgets/_widget-fields/format-rules/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type {
    WidgetProps, WidgetEmit,
    WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';

import { gray } from '@/styles/colors';


type Data = ListResponse<{
    [key: string]: string|number;
}>;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
});
const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[state.dataField]),
    data: null as Data | null,
    chart: null as EChartsType | null,
    chartData: undefined as undefined|number,
    chartOptions: computed<{series: GaugeSeriesOption[]}>(() => ({
        series: [
            {
                type: 'gauge',
                center: ['50%', '60%'],
                startAngle: 200,
                endAngle: -20,
                min: state.min,
                max: state.max,
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
                            [1, state.formatRulesBaseColor],
                        ],
                    },
                },
                axisLabel: {
                    distance: -55,
                    color: gray[700],
                    fontSize: 12,
                    formatter: (val) => getFormattedNumber(val, state.dataField, state.numberFormat, state.unit),
                },
                detail: {
                    offsetCenter: [0, 0],
                    fontSize: 32,
                    formatter: (val) => getFormattedNumber(val, state.dataField, state.numberFormat, state.unit),
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
    // required fields
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
    min: computed<number>(() => props.widgetOptions?.min as number),
    max: computed<number>(() => props.widgetOptions?.max as number),
    formatRules: computed<FormatRulesValue[]>(() => props.widgetOptions?.formatRules as FormatRulesValue[]),
    gaugeColor: computed<string>(() => {
        let _formatRules = props.widgetOptions?.formatRules as FormatRulesValue[];
        let _color = gray[200];
        _formatRules = _formatRules?.sort((a, b) => (a?.threshold || 0) - (b?.threshold || 0));
        _formatRules?.forEach((d) => {
            if (state.chartData >= (d.threshold || 0)) {
                _color = d.color;
            }
        });
        return _color;
    }),
    formatRulesBaseColor: computed<string>(() => {
        const _formatRules = props.widgetOptions?.formatRules as FormatRulesValue[];
        return _formatRules?.filter((d) => d.threshold === 0)?.[0]?.color || gray[200];
    }),
    // optional fields
    numberFormat: computed(() => props.widgetOptions?.numberFormat as NumberFormatValue),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
});

/* Api */
const privateWidgetFetcher = getCancellableFetcher<PrivateWidgetLoadParameters, Data>(SpaceConnector.clientV2.dashboard.privateWidget.load);
const publicWidgetFetcher = getCancellableFetcher<PublicWidgetLoadParameters, Data>(SpaceConnector.clientV2.dashboard.publicWidget.load);
const fetchWidget = async (): Promise<Data|APIErrorToast|undefined> => {
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
                group_by: [],
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
const drawChart = (rawData: Data|null) => {
    if (isEmpty(rawData)) return;
    state.chartData = rawData?.results?.[0]?.[state.dataField] || 0;
};
const loadWidget = async (): Promise<Data|APIErrorToast> => {
    const res = await fetchWidget();
    if (!res) return state.data;
    if (typeof res === 'function') return res;
    state.data = res;
    drawChart(state.data);
    return state.data;
};

/* Watcher */
watch([() => state.chartData, () => chartContext.value], ([, chartCtx]) => {
    if (chartCtx) {
        state.chart = init(chartContext.value);
        state.chart.setOption(state.chartOptions, true);
    }
});

useWidgetInitAndRefresh({ props, emit, loadWidget });
defineExpose<WidgetExpose<Data>>({
    loadWidget,
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
