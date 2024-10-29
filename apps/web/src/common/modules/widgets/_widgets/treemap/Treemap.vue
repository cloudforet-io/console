<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { TreemapSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import {
    cloneDeep, isEmpty, orderBy, throttle,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import { DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import {
    getReferenceLabel,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import type { CategoryByValue } from '@/common/modules/widgets/_widget-fields/category-by/type';
import type { DateFormatValue } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { DisplaySeriesLabelValue } from '@/common/modules/widgets/_widget-fields/display-series-label/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
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
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
});
const chartContext = ref<HTMLElement|null>(null);
const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
    data: null as Data | null,
    chart: null as EChartsType | null,
    chartData: [],
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[state.dataField]),
    chartOptions: computed<TreemapSeriesOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        tooltip: {
            trigger: 'item',
            position: 'inside',
            formatter: (params) => {
                let _name = getReferenceLabel(props.allReferenceTypeInfo, state.categoryByField, params.name);
                if (state.unit) _name = `${_name} (${state.unit})`;
                const _value = numberFormatter(params.value) || '';
                return `${params.marker} ${_name}: <b>${_value}</b>`;
            },
        },
        legend: {
            show: false,
        },
        series: [
            {
                type: 'treemap',
                roam: false,
                nodeClick: false,
                breadcrumb: {
                    show: false,
                },
                label: {
                    show: true,
                    position: state.displaySeriesLabel?.position,
                    rotate: state.displaySeriesLabel?.rotate,
                    fontSize: 10,
                    formatter: (p) => {
                        if (state.displaySeriesLabel?.toggleValue) {
                            return `${p.name}\n\n${getFormattedNumber(p.value, state.dataField, state.numberFormat, state.unit)}`;
                        }
                        return p.name;
                    },
                },
                data: state.chartData,
            },
        ],
    })),
    // required fields
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
    categoryByField: computed<string|undefined>(() => (props.widgetOptions?.categoryBy as CategoryByValue)?.value as string),
    categoryByCount: computed<number>(() => (props.widgetOptions?.categoryBy as CategoryByValue)?.count as number),
    // optional fields
    dateFormat: computed<string|undefined>(() => {
        const _dateFormat = (props.widgetOptions?.dateFormat as DateFormatValue)?.value || 'MMM DD, YYYY';
        return DATE_FORMAT?.[_dateFormat]?.[state.granularity];
    }),
    numberFormat: computed<NumberFormatValue>(() => props.widgetOptions?.numberFormat as NumberFormatValue),
    displaySeriesLabel: computed(() => (props.widgetOptions?.displaySeriesLabel as DisplaySeriesLabelValue)),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
    noData: computed(() => (state.data ? !state.data.results?.length : false)),
});

/* Util */
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
                group_by: [state.categoryByField],
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
const drawChart = (rawData: Data|null) => {
    if (isEmpty(rawData)) return;

    let _refinedData = cloneDeep(rawData.results || []);
    if (isDateField(state.categoryByField)) {
        _refinedData = orderBy(_refinedData, state.categoryByField, 'desc');
        _refinedData = _refinedData?.slice(0, state.categoryByCount);
    } else {
        _refinedData = orderBy(_refinedData, state.dataField, 'desc');
        const _slicedData = _refinedData.slice(0, state.categoryByCount);
        const _etcValue = _refinedData.slice(state.categoryByCount).reduce((acc, v) => acc + v[state.dataField], 0);
        const _etcData = _etcValue ? {
            [state.categoryByField]: 'etc',
            [state.dataField]: _etcValue,
        } : {};
        _refinedData = isEmpty(_etcData) ? _slicedData : [..._slicedData, _etcData];
    }

    // get chart data
    state.chartData = _refinedData?.map((v) => {
        let _name = getReferenceLabel(props.allReferenceTypeInfo, state.categoryByField, v[state.categoryByField]);
        if (state.categoryByField === DATE_FIELD.DATE) {
            _name = dayjs.utc(v[state.categoryByField]).format(state.dateFormat);
        }
        return {
            name: _name,
            value: v[state.dataField],
        };
    }) || [];
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
