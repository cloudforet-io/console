<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, reactive, ref,
} from 'vue';

import { cloneDeep, orderBy, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PTooltip } from '@cloudforet/mirinae';
import { getContrastingColor, numberFormatter } from '@cloudforet/utils';

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
    getApiQueryDateRange,
    getWidgetBasedOnDate, getWidgetDateFields,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetEmit, WidgetExpose, WidgetProps } from '@/common/modules/widgets/types/widget-display-type';
import type {
    AdvancedFormatRulesValue, NumberFormatValue, XAxisValue, YAxisValue,
} from '@/common/modules/widgets/types/widget-field-value-type';

import { gray } from '@/styles/colors';


type Data = ListResponse<{
    [key: string]: string|number;
}>;
type RefinedData = {
    [key: string]: Array<{
        [key: string]: string|any;
        value: number;
    }>;
};

const colorCodedTableRef = ref<null | HTMLElement>(null);
const Y_AXIS_FIELD_WIDTH = 120;
const BOX_MIN_WIDTH = 64;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
    data: null as Data | null,
    refinedData: computed<RefinedData[]>(() => {
        if (!state.data?.results?.length) return [];
        if (state.xAxisField === DATE_FIELD.DATE) {
            return state.data.results;
        }
        const _refinedData: RefinedData[] = [];
        state.data.results.forEach((d) => {
            const _orderedData = orderBy(d[state.dataField], 'value', ['desc']);
            const _slicedData = _orderedData.slice(0, state.xAxisCount);
            _refinedData.push({
                [state.yAxisField]: d[state.yAxisField],
                [state.dataField]: _slicedData,
            });
        });
        return _refinedData;
    }),
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[state.dataField]),
    boxWidth: BOX_MIN_WIDTH,
    boxHeight: 0,
    xAxisData: computed<string[]>(() => {
        if (state.xAxisField === DATE_FIELD.DATE) {
            return getWidgetDateFields(state.granularity, state.dateRange.start, state.dateRange.end);
        }
        const _results = new Set<string>();
        state.refinedData.forEach((d) => {
            d[state.dataField].forEach((col) => {
                _results.add(col[state.xAxisField] as string);
            });
        });
        return Array.from(_results);
    }),
    yAxisData: computed<string[]>(() => {
        if (state.yAxisField === DATE_FIELD.DATE) {
            return getWidgetDateFields(state.granularity, state.dateRange.start, state.dateRange.end);
        }
        return state.refinedData.map((d) => d[state.yAxisField] as string);
    }),
    // required fields
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
    xAxisField: computed<string>(() => (props.widgetOptions?.xAxis as XAxisValue)?.value),
    xAxisCount: computed<number>(() => (props.widgetOptions?.xAxis as XAxisValue)?.count),
    yAxisField: computed<string>(() => (props.widgetOptions?.yAxis as YAxisValue)?.value),
    yAxisCount: computed<number>(() => (props.widgetOptions?.yAxis as YAxisValue)?.count),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    formatRulesValue: computed<AdvancedFormatRulesValue>(() => props.widgetOptions?.advancedFormatRules as AdvancedFormatRulesValue),
    dateRange: computed<DateRange>(() => {
        let _dateRangeCount = 1;
        if (Object.values(DATE_FIELD).includes(state.xAxisField)) {
            _dateRangeCount = state.xAxisCount;
        } else if (Object.values(DATE_FIELD).includes(state.yAxisField)) {
            _dateRangeCount = state.yAxisCount;
        }
        const [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, _dateRangeCount);
        return { start: _start, end: _end };
    }),
    // optional fields
    numberFormat: computed(() => props.widgetOptions?.numberFormat as NumberFormatValue),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange: computed(() => state.dateRange),
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
    noData: computed(() => (state.data ? !state.data.results?.length : false)),
});

/* Api */
const fetchWidget = async (): Promise<Data|APIErrorToast|undefined> => {
    if (props.widgetState === 'INACTIVE') return undefined;
    try {
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
            : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
        const _queryDateRange = getApiQueryDateRange(state.granularity, state.dateRange);
        const res = await _fetcher({
            widget_id: props.widgetId,
            query: {
                granularity: state.granularity,
                start: _queryDateRange.start,
                end: _queryDateRange.end,
                group_by: [state.xAxisField, state.yAxisField],
                fields: {
                    [state.dataField]: {
                        key: state.dataField,
                        operator: 'sum',
                    },
                },
                field_group: [state.xAxisField],
                sort: [{ key: `_total_${state.dataField}`, desc: true }],
                page: { start: 1, limit: state.yAxisCount },
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

/* Util */
const loadWidget = async (): Promise<Data|APIErrorToast> => {
    state.loading = true;
    const res = await fetchWidget();
    if (typeof res === 'function') return res;
    state.data = res;
    state.loading = false;
    return state.data;
};
const targetValue = (xField?: string, yField?: string, format?: 'table'|'tooltip'): number|string => {
    if (!xField || !yField) return '--';
    const _targetData = state.refinedData.find((d) => d[state.yAxisField] === yField);
    const _targetVal = _targetData?.[state.dataField].find((d) => d[state.xAxisField] === xField)?.value;
    if (!_targetVal) return format === 'table' ? '--' : '';
    if (!format) return _targetVal;
    if (format === 'table') {
        const _formattedVal = getFormattedNumber(_targetVal, state.dataField, state.numberFormat, state.unit);
        if ((_formattedVal.length * 6.5) > state.boxWidth) return '...';
        return _formattedVal;
    }
    return numberFormatter(_targetVal, { minimumFractionDigits: 2 }) || '--';
};
const getColor = (val: string|number): string => {
    let _formatRules = cloneDeep(state.formatRulesValue);
    let _color = state.formatRulesValue.baseColor || gray[200];
    _formatRules = _formatRules.value.sort((a, b) => (a?.threshold || 0) - (b?.threshold || 0));
    _formatRules?.forEach((d) => {
        if (val >= (d.threshold || 0)) {
            _color = d.color;
        }
    });
    return _color;
};

/* Lifecycle */
useWidgetInitAndRefresh({ props, emit, loadWidget });
defineExpose<WidgetExpose<Data>>({
    loadWidget,
});
useResizeObserver(colorCodedTableRef, throttle(() => {
    const _containerWidth = colorCodedTableRef.value?.clientWidth;
    const _containerHeight = colorCodedTableRef.value?.clientHeight;
    if (!_containerWidth || !_containerHeight) return;

    // width
    const boxWidth = (_containerWidth - Y_AXIS_FIELD_WIDTH) / state.xAxisCount;
    if (boxWidth < BOX_MIN_WIDTH) state.boxWidth = BOX_MIN_WIDTH - 2;
    else state.boxWidth = boxWidth - 2;

    // height
    const yAxisCount = state.yAxisData.length;
    if (!_containerHeight) state.boxHeight = 0;
    else state.boxHeight = _containerHeight / yAxisCount;
}, 500));
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="color-coded-table-heatmap"
                  v-on="widgetFrameEventHandlers"
    >
        <!--Do not delete div element below. It's defense code for redraw-->
        <div ref="colorCodedTableRef"
             class="table-wrapper"
        >
            <div class="y-axis-wrapper">
                <div v-for="(yField, yIdx) in state.yAxisData"
                     :key="`color-coded-y-axis-${props.widgetId}-${yField}-${yIdx}`"
                     class="y-col"
                     :style="{'height': `${state.boxHeight}px`}"
                >
                    {{ yField }}
                </div>
            </div>
            <div class="x-axis-wrapper">
                <div class="scroll-view">
                    <div v-for="(yField, yIdx) in state.yAxisData"
                         :key="`color-coded-row-${props.widgetId}-${yField}-${yIdx}`"
                         class="x-row"
                    >
                        <div v-for="xField in state.xAxisData"
                             :key="`color-coded-box-${props.widgetId}-${xField}-${yField}`"
                             class="col-box"
                             :style="{
                                 'width': `${state.boxWidth}px`,
                                 'background-color': getColor(targetValue(xField, yField)),
                                 'color': getContrastingColor(getColor(targetValue(xField, yField))),
                                 'height': `${state.boxHeight-1}px`,
                             }"
                        >
                            <p-tooltip :contents="targetValue(xField, yField, 'tooltip')"
                                       position="bottom"
                                       class="tooltip-wrapper"
                            >
                                {{ targetValue(xField, yField, 'table') }}
                            </p-tooltip>
                        </div>
                    </div>
                    <div class="x-field-wrapper">
                        <div v-for="xField in state.xAxisData"
                             :key="`color-coded-x-field-${props.widgetId}-${xField}`"
                             :style="{'width': `${state.boxWidth}px`}"
                             class="x-field-col"
                        >
                            {{ xField }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.color-coded-table-heatmap {
    .table-wrapper {
        display: flex;
        width: 100%;
        height: 80%;
        gap: 0.25rem;
        padding-top: 1rem;
        .y-axis-wrapper {
            .y-col {
                @apply text-label-sm text-gray-700 truncate border-b border-gray-200;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 0.375rem;
            }
            .y-col:first-child {
                @apply border-t;
            }
        }
        .x-axis-wrapper {
            flex: 1;
            overflow-x: auto;
            overflow-y: hidden;
            height: 120%;
            .scroll-view {
                display: inline-block;
                white-space: nowrap;
            }
            .x-row {
                @apply text-label-sm;
                display: flex;
                gap: 1px;
                padding-bottom: 1px;
                .col-box {
                    @apply truncate;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    .tooltip-wrapper {
                        width: 100%;
                        text-align: center;
                    }
                }
            }
            .x-field-wrapper {
                @apply text-label-xs text-gray-600;
                display: flex;
                gap: 1px;
                padding-top: 0.25rem;
                .x-field-col {
                    @apply truncate;
                }
            }
        }
    }
}
</style>
