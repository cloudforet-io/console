<script setup lang="ts">
import { useElementSize, useResizeObserver } from '@vueuse/core';
import {
    computed, defineExpose, reactive, ref, watch,
} from 'vue';

import { useQueries } from '@tanstack/vue-query';
import { debounce, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PI,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PrivateWidgetLoadSumParameters } from '@/schema/dashboard/private-widget/api-verbs/load-sum';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import type { PublicWidgetLoadSumParameters } from '@/schema/dashboard/public-widget/api-verbs/load-sum';
import { i18n } from '@/translations';

import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { WIDGET_LOAD_STALE_TIME } from '@/common/modules/widgets/_constants/widget-constant';
import { normalizeAndSerialize } from '@/common/modules/widgets/_helpers/global-variable-helper';
import { sortObjectByKeys } from '@/common/modules/widgets/_helpers/widget-data-table-helper';
import {
    getPreviousDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { getFormattedNumber, getWidgetDataTable } from '@/common/modules/widgets/_helpers/widget-helper';
import type { ComparisonValue } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { IconValue } from '@/common/modules/widgets/_widget-fields/icon/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { WidgetHeightValue } from '@/common/modules/widgets/_widget-fields/widget-height/type';
import type { DateRange, WidgetLoadResponse } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';

import { gray } from '@/styles/colors';


const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const topPartRef = ref<null | HTMLElement>(null);
const valueTextRef = ref<null | HTMLElement>(null);

const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange?.value as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
});
const state = reactive({
    runQueries: false,
    isPrivateWidget: computed<boolean>(() => props.widgetId.startsWith('private')),
    dataTable: undefined as PublicDataTableModel|PrivateDataTableModel|undefined,
    previousLoading: false,

    data: computed<WidgetLoadResponse | null>(() => queryResults.value?.[0].data || null),
    previousData: computed<WidgetLoadResponse | null>(() => queryResults.value?.[1]?.data || null),
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[widgetOptionsState.dataFieldInfo?.data as string]),
    previousValue: computed<number>(() => {
        // HACK: Change the code below when the backend data is modified
        // return state.previousData?.results?.[0]?.[widgetOptionsState.dataFieldInfo?.data as string] ?? 0;
        const _targetData = state.previousData?.results?.find((d) => !!d[widgetOptionsState.dataFieldInfo?.data as string]);
        return _targetData?.[widgetOptionsState.dataFieldInfo?.data as string] || 0;
    }),
    currentValue: computed<number>(() => {
        // HACK: Change the code below when the backend data is modified
        // return state.data?.results?.[0]?.[widgetOptionsState.dataFieldInfo?.data as string] ?? 0;
        const _targetData = state.data?.results?.find((d) => !!d[widgetOptionsState.dataFieldInfo?.data as string]);
        return _targetData?.[widgetOptionsState.dataFieldInfo?.data as string] || 0;
    }),
    valueText: computed<string|undefined>(() => getFormattedNumber(state.currentValue, widgetOptionsState.numberFormatInfo?.[widgetOptionsState.dataFieldInfo?.data as string], state.unit)),

    iconName: computed<string|undefined>(() => widgetOptionsState.iconInfo?.icon?.name),
    iconColor: computed<string|undefined>(() => widgetOptionsState.iconInfo?.color),
    comparisonColor: computed<string|undefined>(() => {
        const _comparison = state.currentValue - state.previousValue;
        if (!_comparison) return gray[700];

        if (state.currentValue > state.previousValue) {
            return widgetOptionsState.comparisonInfo?.increaseColor;
        }
        return widgetOptionsState.comparisonInfo?.decreaseColor;
    }),
    comparisonValue: computed<string>(() => {
        const _comparison = Math.abs(state.currentValue - state.previousValue);
        const _format = widgetOptionsState.comparisonInfo?.format || 'all';
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
        const _previousDateRange = getPreviousDateRange(widgetOptionsState.granularityInfo?.granularity, dateRange.value);
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
    comparisonDateRange: computed<DateRange>(() => {
        const _previousDateRange = getPreviousDateRange(widgetOptionsState.granularityInfo?.granularity, dateRange.value);
        return _previousDateRange;
    }),
});

const widgetOptionsState = reactive({
    granularityInfo: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
    dataFieldInfo: computed<DataFieldValue>(() => props.widgetOptions?.dataField?.value as DataFieldValue),
    iconInfo: computed<IconValue>(() => props.widgetOptions?.icon?.value as IconValue),
    comparisonInfo: computed<ComparisonValue>(() => props.widgetOptions?.comparison?.value as ComparisonValue),
    numberFormatInfo: computed<NumberFormatValue>(() => props.widgetOptions?.numberFormat?.value as NumberFormatValue),
    widgetHeightInfo: computed<WidgetHeightValue>(() => props.widgetOptions?.widgetHeight?.value as WidgetHeightValue),
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
const fetchWidgetData = async (params: PrivateWidgetLoadSumParameters|PublicWidgetLoadSumParameters): Promise<WidgetLoadResponse> => {
    const defaultFetcher = state.isPrivateWidget
        ? SpaceConnector.clientV2.dashboard.privateWidget.loadSum<PrivateWidgetLoadSumParameters, WidgetLoadResponse>
        : SpaceConnector.clientV2.dashboard.publicWidget.loadSum<PublicWidgetLoadSumParameters, WidgetLoadResponse>;
    const res = await defaultFetcher(params);
    return res;
};

const baseQueryKey = computed(() => [
    'widget-load-number-card',
    props.widgetId,
    {
        start: dateRange.value.start,
        end: dateRange.value.end,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        dataTableId: state.dataTable?.data_table_id,
        dataTableOptions: JSON.stringify(sortObjectByKeys(state.dataTable?.options) ?? {}),
        vars: normalizeAndSerialize(props.dashboardVars),
    },
]);

const comparisonQueryKey = computed(() => [
    'widget-load-number-card-comparison',
    props.widgetId,
    {
        start: dateRange.value.start,
        end: dateRange.value.end,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        dataTableId: state.dataTable?.data_table_id,
        dataTableOptions: JSON.stringify(sortObjectByKeys(state.dataTable?.options) ?? {}),
        vars: normalizeAndSerialize(props.dashboardVars),
    },
]);

const queryResults = useQueries({
    queries: [
        {
            queryKey: baseQueryKey,
            queryFn: () => fetchWidgetData({
                widget_id: props.widgetId,
                granularity: widgetOptionsState.granularityInfo?.granularity,
                start: dateRange.value.start,
                end: dateRange.value.end,
                vars: props.dashboardVars,
            }),
            enabled: computed(() => props.widgetState !== 'INACTIVE' && !!state.dataTable && state.runQueries),
            staleTime: WIDGET_LOAD_STALE_TIME,
        },
        {
            queryKey: comparisonQueryKey,
            queryFn: () => fetchWidgetData({
                widget_id: props.widgetId,
                granularity: widgetOptionsState.granularityInfo?.granularity,
                start: state.comparisonDateRange.start,
                end: state.comparisonDateRange.end,
                vars: props.dashboardVars,
            }),
            enabled: computed(() => props.widgetState !== 'INACTIVE' && !!state.dataTable && state.runQueries && widgetOptionsState.comparisonInfo?.toggleValue),
            staleTime: WIDGET_LOAD_STALE_TIME,
        },
    ],
});

const widgetLoading = computed<boolean>(() => queryResults.value?.[0].isLoading);
const previousLoading = computed<string>(() => queryResults.value?.[1].isLoading);
const errorMessage = computed<string>(() => {
    if (!state.dataTable) return i18n.t('COMMON.WIDGETS.NO_DATA_TABLE_ERROR_MESSAGE');
    return queryResults.value?.[0].error?.message;
});

const loadWidget = () => {
    state.runQueries = true;
};

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage,
    widgetLoading,
    noData: computed(() => !state.currentValue && !state.previousValue),
});

useResizeObserver(valueTextRef, throttle(() => {
    setValueTextFontSize();
}, 500));
useWidgetInitAndRefresh({ props, emit, loadWidget });
watch(() => props.dataTableId, async (newDataTableId) => {
    if (!newDataTableId) return;
    state.dataTable = await getWidgetDataTable(newDataTableId);
}, { immediate: true });
defineExpose<WidgetExpose>({
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
            <div v-if="widgetOptionsState.comparisonInfo?.toggleValue && !previousLoading"
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
