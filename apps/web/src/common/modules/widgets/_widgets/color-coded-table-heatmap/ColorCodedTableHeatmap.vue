<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, reactive, ref, watch,
} from 'vue';

import { cloneDeep, orderBy, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { PTooltip } from '@cloudforet/mirinae';
import { getContrastingColor, numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetCustomLagend from '@/common/modules/widgets/_components/WidgetCustomLagend.vue';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import {
    getWidgetBasedOnDate, getWidgetDateFields,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import {
    getWidgetLoadApiQuery,
    getWidgetLoadApiQueryDateRange,
} from '@/common/modules/widgets/_helpers/widget-load-helper';
import type { AdvancedFormatRulesValue } from '@/common/modules/widgets/_widget-fields/advanced-format-rules/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { TableDataFieldValue } from '@/common/modules/widgets/_widget-fields/table-data-field/type';
import type { XAxisValue } from '@/common/modules/widgets/_widget-fields/x-axis/type';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetEmit, WidgetExpose, WidgetProps } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetLegend } from '@/common/modules/widgets/types/widget-legend-typs';

import { gray } from '@/styles/colors';


type Data = ListResponse<{
    [key: string]: string|number;
}>;

const colorCodedTableRef = ref<null | HTMLElement>(null);
const scrollViewRef = ref<null | HTMLElement>(null);
const Y_AXIS_FIELD_WIDTH = 120;
const BOX_MIN_WIDTH = 64;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
    data: null as Data | null,
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[state.dataField]),
    boxWidth: BOX_MIN_WIDTH,
    boxHeight: 0,
    scrollHeight: 0,
    xAxisData: computed<string[]>(() => {
        if (isDateField(state.xAxisField)) {
            const _isSeparatedDate = state.xAxisField !== DATE_FIELD.DATE;
            return getWidgetDateFields(state.granularity, state.dateRange.start, state.dateRange.end, _isSeparatedDate);
        }
        return state.data?.results?.map((d) => d[state.xAxisField] as string) || [];
    }),
    yAxisData: computed<string[]>(() => {
        if (!state.data?.results?.length) return [];
        if (state.dataFieldInfo.fieldType === 'staticField') return state.dataField;
        if (state.dynamicFieldInfo?.valueType === 'fixed') return state.dynamicFieldValue;
        // auto
        if (isDateField(state.dataField)) {
            const _isSeparatedDate = state.dataField !== DATE_FIELD.DATE;
            return getWidgetDateFields(state.granularity, state.dateRange.start, state.dateRange.end, _isSeparatedDate);
        }
        const _subTotalResults: Record<string, number> = {};
        const _criteria = state.dynamicFieldInfo?.criteria;
        const _valueCount = state.dynamicFieldInfo?.count || 0;
        state.data.results.forEach((result) => {
            result?.[_criteria]?.forEach((d) => {
                if (d[state.dataField] in _subTotalResults) {
                    _subTotalResults[d[state.dataField]] += d.value;
                } else {
                    _subTotalResults[d[state.dataField]] = d.value;
                }
            });
        });
        return orderBy(Object.entries(_subTotalResults), 1, 'desc').slice(0, _valueCount).map(([k]) => k);
    }),
    legendList: [] as WidgetLegend[],
    // required fields
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    xAxisField: computed<string>(() => (props.widgetOptions?.xAxis as XAxisValue)?.value),
    xAxisCount: computed<number>(() => (props.widgetOptions?.xAxis as XAxisValue)?.count),
    dataFieldInfo: computed<TableDataFieldValue>(() => props.widgetOptions?.tableDataField as TableDataFieldValue),
    dynamicFieldInfo: computed<TableDataFieldValue['dynamicFieldInfo']>(() => state.dataFieldInfo?.dynamicFieldInfo),
    staticFieldInfo: computed<TableDataFieldValue['staticFieldInfo']>(() => state.dataFieldInfo?.staticFieldInfo),
    dataField: computed<string|string[]|undefined>(() => {
        if (state.dataFieldInfo?.fieldType === 'staticField') return state.staticFieldInfo?.fieldValue;
        return state.dynamicFieldInfo?.fieldValue;
    }),
    dynamicFieldValue: computed<string[]>(() => state.dynamicFieldInfo?.fixedValue || []),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    formatRulesValue: computed<AdvancedFormatRulesValue>(() => props.widgetOptions?.advancedFormatRules as AdvancedFormatRulesValue),
    dateRange: computed<DateRange>(() => {
        let _start = state.basedOnDate;
        let _end = state.basedOnDate;
        if (isDateField(state.xAxisField)) {
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.xAxisCount);
        } else if (isDateField(state.dataField)) {
            let subtract = state.dynamicFieldInfo.count;
            if (state.dynamicFieldInfo?.valueType === 'fixed') {
                if (state.granularity === GRANULARITY.YEARLY) subtract = 3;
                if (state.granularity === GRANULARITY.MONTHLY) subtract = 12;
                if (state.granularity === GRANULARITY.DAILY) subtract = 30;
            }
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, subtract);
        }
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
                page: { start: 1, limit: state.xAxisCount },
                ...getWidgetLoadApiQueryDateRange(state.granularity, state.dateRange),
                ...getWidgetLoadApiQuery(state.dataFieldInfo, state.xAxisField),
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
const loadWidget = async (): Promise<Data|APIErrorToast> => {
    const res = await fetchWidget();
    if (!res) return state.data;
    if (typeof res === 'function') return res;
    state.data = res;
    return state.data;
};
const targetValue = (xField?: string, yField?: string, format?: 'table'|'tooltip'): number|string => {
    if (!state.data?.results?.length || !xField || !yField) return '--';
    let _targetVal: number|undefined;

    let _field = yField;
    if (state.dataFieldInfo.fieldType === 'staticField') {
        const _targetData = state.data.results.find((d) => d[state.xAxisField] === xField);
        _targetVal = _targetData?.[yField];
    } else {
        const _criteria = state.dynamicFieldInfo?.criteria;
        const _targetXData = state.data.results.find((d) => d[state.xAxisField] === xField);
        const _targetXYData = _targetXData?.[_criteria]?.find((d) => d[state.dataField] === yField);
        _targetVal = _targetXYData?.value;
        _field = _criteria;
    }

    if (!_targetVal) return format === 'table' ? '--' : '';
    if (!format) return _targetVal;
    if (format === 'table') {
        const _formattedVal = getFormattedNumber(_targetVal, _field, state.numberFormat, state.unit);
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

/* Watcher */
watch(() => state.formatRulesValue, async () => {
    state.legendList = state.formatRulesValue.value.map((d) => ({
        name: d.text,
        color: d.color,
        disabled: false,
    }));
}, { immediate: true });

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
    const boxHeight = _containerHeight / yAxisCount;
    const padding = 20 / yAxisCount;
    if (boxHeight < 32) state.boxHeight = 32 - padding;
    else state.boxHeight = boxHeight - padding;

    if (props.mode === 'overlay') {
        state.scrollHeight = '100%';
    } else {
        const _scrollHeight = scrollViewRef.value?.scrollHeight || 0;
        if (_containerHeight < _scrollHeight) state.scrollHeight = `${_scrollHeight}px`;
        else state.scrollHeight = '100%';
    }
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
             :class="[props.mode]"
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
            <div class="x-axis-wrapper"
                 :style="{'height': `calc(${state.scrollHeight})`}"
            >
                <div ref="scrollViewRef"
                     class="scroll-view"
                >
                    <div v-for="(xField, xIdx) in state.xAxisData"
                         :key="`color-coded-col-${props.widgetId}-${xField}-${xIdx}`"
                         class="x-col"
                         :style="{'width': `${state.boxWidth}px`}"
                    >
                        <div v-for="yField in state.yAxisData"
                             :key="`color-coded-box-${props.widgetId}-${xField}-${yField}`"
                             class="box"
                             :style="{
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
                        <div class="x-field-text">
                            <span class="x-field-col"
                                  :style="{'width': `${state.boxWidth}px`}"
                            >{{ xField }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <widget-custom-lagend :legend-list="state.legendList"
                              disable-toggle
                              class="widget-custom-legend"
        />
    </widget-frame>
</template>

<style lang="postcss" scoped>
.color-coded-table-heatmap {
    .table-wrapper {
        display: flex;
        width: 100%;
        height: 82%;
        gap: 0.25rem;
        overflow: auto;
        margin-top: 1rem;
        &.overlay {
            height: 90%;
        }
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
            overflow-y: hidden;
            .scroll-view {
                overflow-x: auto;
                overflow-y: hidden;
                display: inline-flex;
                white-space: nowrap;
                .x-field-text {
                    @apply text-label-xs text-gray-600;
                    display: inline-flex;
                    padding-top: 0.25rem;
                    padding-bottom: 1rem;
                    .x-field-col {
                        @apply truncate;
                    }
                }
            }
            .x-col {
                @apply text-label-sm;
                display: flex;
                flex-direction: column;
                gap: 1px;
                padding-right: 1px;
                .box {
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
        }
    }
    .widget-custom-legend {
        position: absolute;
        bottom: 0;
        left: 0;
    }
}
</style>
