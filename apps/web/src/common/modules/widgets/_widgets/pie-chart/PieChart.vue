<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose,
    reactive, ref, watch,
} from 'vue';

import type { PieSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import { isEmpty, orderBy, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import {
    getReferenceLabel,
    getWidgetBasedOnDate,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';
import type { GroupByValue } from '@/common/modules/widgets/types/widget-field-value-type';


type Data = ListResponse<{
    [key: string]: string|number;
}>;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const chartContext = ref<HTMLElement|null>(null);
const state = reactive({
    loading: true,
    errorMessage: undefined as string|undefined,
    data: null as Data | null,
    chart: null as EChartsType | null,
    chartData: [],
    chartOptions: computed<PieSeriesOption>(() => ({
        tooltip: {
            trigger: 'item',
            position: 'inside',
            formatter: (params) => {
                const _name = getReferenceLabel(props.allReferenceTypeInfo, state.groupByField, params.name);
                const _value = numberFormatter(params.value) || '';
                return `${params.marker} ${_name}: <b>${_value}</b>`;
            },
        },
        grid: {
            containLabel: true,
        },
        legend: {
            show: state.showLegends,
            orient: 'vertical',
            type: 'scroll',
            right: 10,
            top: 20,
            itemWidth: 10,
            itemHeight: 10,
            icon: 'circle',
            formatter: (name) => {
                const _name = getReferenceLabel(props.allReferenceTypeInfo, state.groupByField, name);
                const _series = state.chart.getOption().series[0];
                const _value = _series.data.filter((row) => row.name === name)[0]?.value;
                if (props.size === 'full') {
                    return `${_name}  ${numberFormatter(_value)}`;
                }
                return `${(_name.length > 15 ? `${_name.slice(0, 15)}...` : _name)}  ${numberFormatter(_value)}`;
            },
        },
        series: [
            {
                type: 'pie',
                radius: ['30%', '70%'],
                center: props.size === 'full' ? ['40%', '50%'] : ['30%', '50%'],
                data: state.chartData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
                avoidLabelOverlap: false,
                label: {
                    show: false,
                },
            },
        ],
    })),
    // required fields
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
    groupByField: computed<string|undefined>(() => (props.widgetOptions?.groupBy as GroupByValue)?.value as string),
    groupByCount: computed<number>(() => (props.widgetOptions?.groupBy as GroupByValue)?.count as number),
    dateRange: computed<DateRange>(() => {
        const _dateRangeCount = Object.values(DATE_FIELD).includes(state.groupByField) ? state.groupByCount : 1;
        const [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, _dateRangeCount);
        return { start: _start, end: _end };
    }),
    // optional fields
    showLegends: computed<boolean>(() => props.widgetOptions?.legend as boolean),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange: computed(() => state.dateRange),
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
});

/* Util */
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
                group_by: [state.groupByField],
                fields: {
                    [state.dataField]: {
                        key: state.dataField,
                        operator: 'sum',
                    },
                },
            },
            vars: props.dashboardVars,
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
const drawChart = (rawData: Data|null) => {
    if (isEmpty(rawData)) return;

    // get chart data
    const _slicedData = orderBy(rawData.results || [], state.dataField, 'desc')?.slice(0, state.groupByCount);
    const _etcData = rawData.results?.slice(state.groupByCount).reduce((acc, cur) => {
        acc[state.groupByField] = 'etc';
        acc[state.dataField] = (acc[state.dataField] || 0) + cur[state.dataField];
        return acc;
    }, {} as Record<string, string|number>);
    const _refinedData = isEmpty(_etcData) ? _slicedData : [..._slicedData, _etcData];
    state.chartData = _refinedData?.map((v) => ({
        name: v[state.groupByField],
        value: v[state.dataField],
    })) || [];
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

watch(() => props.size, () => {
    state.chart.setOption(state.chartOptions, true);
}, { immediate: false });
watch([() => state.chartData, () => chartContext.value], ([, chartCtx]) => {
    if (chartCtx) {
        state.chart = init(chartContext.value);
        state.chart.setOption(state.chartOptions, true);
    }
});

useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
useWidgetInitAndRefresh({ props, emit, loadWidget });
defineExpose<WidgetExpose<Data>>({
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
