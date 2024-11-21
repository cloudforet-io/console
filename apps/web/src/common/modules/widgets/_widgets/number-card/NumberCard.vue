<script setup lang="ts">
import { useElementSize, useResizeObserver } from '@vueuse/core';
import {
    computed, defineExpose, reactive, ref, watch,
} from 'vue';

import { debounce, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import {
    PI,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';
import { i18n } from '@/translations';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import {
    getPreviousDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import type { ComparisonValue } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { IconValue } from '@/common/modules/widgets/_widget-fields/icon/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';

import { gray } from '@/styles/colors';



type Data = ListResponse<{
    [key: string]: string|number;
}>;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const topPartRef = ref<null | HTMLElement>(null);
const valueTextRef = ref<null | HTMLElement>(null);

const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
});
const state = reactive({
    loading: false,
    previousLoading: false,
    errorMessage: undefined as string|undefined,
    data: null as Data | null,
    previousData: null as Data | null,
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[state.dataField]),
    previousValue: computed<number>(() => state.previousData?.results?.[0]?.[state.dataField] ?? 0),
    currentValue: computed<number>(() => state.data?.results?.[0]?.[state.dataField] ?? 0),
    valueText: computed<string|undefined>(() => {
        const _numberFormatMap = props.widgetOptions?.numberFormat as NumberFormatValue;
        return getFormattedNumber(state.currentValue, state.dataField, _numberFormatMap, state.unit);
    }),
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
    // optional fields
    iconName: computed<string|undefined>(() => (props.widgetOptions?.icon as IconValue)?.icon?.name),
    iconColor: computed<string>(() => (props.widgetOptions?.icon as IconValue)?.color),
    comparisonColor: computed<string|undefined>(() => {
        const _comparison = state.currentValue - state.previousValue;
        if (!_comparison) return gray[700];

        const _target: ComparisonValue|undefined = props.widgetOptions?.comparison;
        if (state.currentValue > state.previousValue) {
            return _target?.increaseColor;
        }
        return _target?.decreaseColor;
    }),
    comparisonValue: computed<string>(() => {
        const _target: ComparisonValue|undefined = props.widgetOptions?.comparison;
        const _comparison = Math.abs(state.currentValue - state.previousValue);
        const _format = _target?.format || 'all';
        let _percentage = '--';
        if (state.previousValue > 0) {
            _percentage = (_comparison / state.previousValue * 100).toFixed(2);
        }
        let _fixedAmount = numberFormatter(_comparison, { notation: 'compact' });
        if (!_fixedAmount || _fixedAmount === '0') _fixedAmount = '--';
        if (_format === 'all') {
            return `${_fixedAmount} (${_percentage}%)`;
        }
        if (_format === 'percent') {
            return `${_percentage}%`;
        }
        return _fixedAmount;
    }),
    comparisonText: computed(() => {
        const _previousDateRange = getPreviousDateRange(state.granularity, dateRange.value);
        const _comparison = state.currentValue - state.previousValue;
        if (!_comparison) return i18n.t('COMMON.WIDGETS.NUMBER_CARD.NO_CHANGE');

        let _dateText = `${_previousDateRange.start} ~ ${_previousDateRange.end}`;
        if (_previousDateRange.start === _previousDateRange.end) {
            _dateText = _previousDateRange.start;
        }

        if (_comparison < 0) {
            return `less than '${_dateText}'`;
        }
        return `more than '${_dateText}'`;
    }),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
    noData: computed(() => !state.currentValue && !state.previousValue),
});

/* Util */
const setValueTextFontSize = debounce(() => {
    if (!valueTextRef.value || !topPartRef.value) return;
    let _fontSize = 56;
    let _maxWidth = useElementSize(topPartRef).width.value;
    let _valueTextWidth = useElementSize(valueTextRef).width.value;
    if (state.iconName) _maxWidth -= 32;
    while ((_valueTextWidth > _maxWidth) && _fontSize > 0) {
        _fontSize -= 1;
        valueTextRef.value.style.fontSize = `${_fontSize}px`;
        _valueTextWidth = useElementSize(valueTextRef).width.value;
    }
}, 300);

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

const privatePreviousFetcher = getCancellableFetcher<PrivateWidgetLoadParameters, Data>(SpaceConnector.clientV2.dashboard.privateWidget.load);
const publicPreviousFetcher = getCancellableFetcher<PublicWidgetLoadParameters, Data>(SpaceConnector.clientV2.dashboard.publicWidget.load);
const fetchPreviousData = async (): Promise<Data|undefined> => {
    if (props.widgetState === 'INACTIVE') return undefined;
    try {
        state.previousLoading = true;
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate ? privatePreviousFetcher : publicPreviousFetcher;
        const _previousDateRange = getPreviousDateRange(state.granularity, dateRange.value);
        const { status, response } = await _fetcher({
            widget_id: props.widgetId,
            query: {
                granularity: state.granularity,
                start: _previousDateRange.start,
                end: _previousDateRange.end,
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
            return response;
        }
        return undefined;
    } catch (e: any) {
        ErrorHandler.handleError(e);
        return undefined;
    } finally {
        state.previousLoading = false;
    }
};

const loadWidget = async (): Promise<Data|APIErrorToast> => {
    const res = await fetchWidget();
    if (!res) return state.data;
    if (typeof res === 'function') return res;
    state.data = res;
    return state.data;
};

watch([() => props.widgetOptions?.comparison, () => dateRange.value], async ([comparison]) => {
    if (comparison) {
        state.previousData = await fetchPreviousData();
    } else {
        state.previousData = null;
    }
}, { immediate: true });
useResizeObserver(valueTextRef, throttle(() => {
    setValueTextFontSize();
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
        <!-- NOTE: Apply styles directly due to intermittent scoped style issues -->
        <div class="content-wrapper flex flex-col justify-center h-full">
            <div ref="topPartRef"
                 class="top-part"
            >
                <div v-if="state.iconName"
                     class="icon-wrapper"
                >
                    <p-i :name="state.iconName"
                         width="1.5rem"
                         height="1.5rem"
                         :color="state.iconColor"
                    />
                </div>
                <span ref="valueTextRef"
                      class="value-text"
                      :class="[props.size]"
                      style="font-size: 56px;"
                >{{ state.valueText }}</span>
            </div>
            <div v-if="props.widgetOptions?.comparison?.toggleValue && !state.previousLoading"
                 class="comparison-wrapper"
            >
                <p-i v-if="state.currentValue !== state.previousValue"
                     :name="(state.currentValue > state.previousValue) ? 'ic_caret-up-filled-alt' : 'ic_caret-down-filled-alt'"
                     :color="state.comparisonColor"
                     width="1rem"
                     height="1rem"
                />
                <span :style="{ 'color': state.comparisonColor }">
                    {{ state.comparisonValue }}
                </span>
                <span>{{ state.comparisonText }}</span>
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.content-wrapper {
    .top-part {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        .value-text {
            flex: 1;
            line-height: 1.25;
            display: inline-block;
            white-space: nowrap;
            &.full {
                font-size: 8rem;
            }
        }
    }
    .comparison-wrapper {
        @apply text-label-sm text-gray-700;
        padding-top: 0.5rem;
    }
}
</style>
