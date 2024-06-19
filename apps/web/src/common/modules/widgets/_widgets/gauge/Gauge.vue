<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, reactive, ref,
} from 'vue';

import type { GaugeSeriesOption } from 'echarts/charts';
import type {
    EChartsType,
} from 'echarts/core';
import { init } from 'echarts/core';
import { isEmpty, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import { getWidgetBasedOnDate, getWidgetDateRange } from '@/common/modules/widgets/_helpers/widget-date-helper';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit,
    WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';
import type { FormatRulesValue } from '@/common/modules/widgets/types/widget-field-value-type';

import { gray } from '@/styles/colors';


type Data = ListResponse<{
    [key: string]: string|number;
}>;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
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
                min: 0, // state.min, TODO: set min, max
                max: 10000, // state.max,
                splitNumber: 4,
                itemStyle: {
                    color: '#FFAB91', // TODO: set color from format rules
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
                    distance: -45,
                    color: gray[700],
                    fontSize: 12,
                    formatter: (val) => numberFormatter(val, { notation: 'compact' }) || '--',
                },
                detail: {
                    offsetCenter: [0, 0],
                    fontSize: 32,
                    formatter: (val) => numberFormatter(val, { notation: 'compact' }) || '--',
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
    basedOnDate: computed<string>(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
    min: computed<number>(() => props.widgetOptions?.min as number),
    max: computed<number>(() => props.widgetOptions?.max as number),
    formatRules: computed<FormatRulesValue[]>(() => props.widgetOptions?.formatRules as FormatRulesValue[]),
    formatRulesBaseColor: computed<string>(() => {
        const _formatRules = props.widgetOptions?.formatRules as FormatRulesValue[];
        return _formatRules?.filter((d) => d.threshold === 0)?.[0]?.color || gray[200];
    }),
    dateRange: computed<DateRange>(() => {
        const [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, 2);
        return { start: _start, end: _end };
    }),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange: computed(() => ({
        end: state.dateRange.end,
    })),
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
});

/* Api */
const fetchWidget = async (): Promise<Data|APIErrorToast> => {
    try {
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
            : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
        const res = await _fetcher({
            widget_id: props.widgetId,
            query: {
                granularity: state.granularity,
                start: state.dateRange.start,
                end: state.dateRange.end,
                group_by: [],
                fields: {
                    [state.dataField]: {
                        key: state.dataField,
                        operator: 'sum',
                    },
                },
            },
            vars: props.dashboardVariables,
        });
        state.errorMessage = undefined;
        return res;
    } catch (e: any) {
        state.errorMessage = e.message;
        ErrorHandler.handleError(e);
        return ErrorHandler.makeAPIErrorToast(e);
    }
};

/* Util */
const drawChart = (rawData: Data|null) => {
    if (isEmpty(rawData)) return;
    state.chartData = rawData?.results?.[0]?.[state.dataField] || 0;
    state.chart = init(chartContext.value);
    state.chart.setOption(state.chartOptions);
};
const loadWidget = async (data?: Data): Promise<Data|APIErrorToast> => {
    state.loading = true;
    const res = data ?? await fetchWidget();
    if (typeof res === 'function') return res;
    state.data = res;
    drawChart(state.data);
    state.loading = false;
    return state.data;
};

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
