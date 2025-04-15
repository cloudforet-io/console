<script setup lang="ts">
import { useElementSize, useResizeObserver } from '@vueuse/core';
import {
    computed, defineExpose, onMounted, reactive, ref,
} from 'vue';

import { debounce, throttle } from 'lodash';

import {
    PI,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { WidgetLoadResponse } from '@/api-clients/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDataTableQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-query';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetLoadSumQuery } from '@/common/modules/widgets/_composables/use-widget-load-query';
import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import { SUB_TOTAL_NAME } from '@/common/modules/widgets/_constants/widget-field-constant';
import {
    getPreviousDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import type { ComparisonValue } from '@/common/modules/widgets/_widget-fields/comparison/type';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { IconValue } from '@/common/modules/widgets/_widget-fields/icon/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { WidgetHeightValue } from '@/common/modules/widgets/_widget-fields/widget-height/type';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';

import { gray } from '@/styles/colors';



const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const topPartRef = ref<null | HTMLElement>(null);
const valueTextRef = ref<null | HTMLElement>(null);

const { data: dataTable, isFetching: dataTableLoading } = useWidgetDataTableQuery(
    computed(() => props.dataTableId),
);
const isPivotDataTable = computed<boolean>(() => dataTable.value?.operator === DATA_TABLE_OPERATOR.PIVOT);


const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange?.value as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
});
const state = reactive({
    isPrivateWidget: computed<boolean>(() => props.widgetId.startsWith('private')),
    previousLoading: false,

    data: computed<WidgetLoadResponse | null>(() => loadQuery.data?.value || null),
    previousData: computed<WidgetLoadResponse | null>(() => comparisonQuery.data?.value || null),
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[widgetOptionsState.dataFieldInfo?.data as string]),
    previousValue: computed<number>(() => {
        if (isPivotDataTable.value) return state.previousData?.results?.[0]?.[SUB_TOTAL_NAME] ?? 0;
        return state.previousData?.results?.[0]?.[widgetOptionsState.dataFieldInfo?.data as string] ?? 0;
    }),
    currentValue: computed<number>(() => {
        if (isPivotDataTable.value) return state.data?.results?.[0]?.[SUB_TOTAL_NAME] ?? 0;
        return state.data?.results?.[0]?.[widgetOptionsState.dataFieldInfo?.data as string] ?? 0;
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
const loadQuery = useWidgetLoadSumQuery({
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


const comparisonQuery = useWidgetLoadSumQuery({
    widgetId: computed(() => props.widgetId),
    params: computed(() => ({
        widget_id: props.widgetId,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        start: state.comparisonDateRange.start,
        end: state.comparisonDateRange.end,
        vars: props.dashboardVars,
    })),
    additionalDeps: computed(() => ({
        widgetName: props.widgetName,
        dataTableId: props.dataTableId,
    })),
    enabled: computed(() => props.widgetState !== 'INACTIVE' && !!dataTable.value && widgetOptionsState.comparisonInfo?.toggleValue && !props.loadDisabled),
});


const widgetLoading = computed<boolean>(() => loadQuery.isFetching.value || dataTableLoading.value);
const previousLoading = computed<boolean>(() => comparisonQuery.isFetching.value || dataTableLoading.value);
const errorMessage = computed<string|undefined>(() => {
    if (!dataTable.value) return i18n.t('COMMON.WIDGETS.NO_DATA_TABLE_ERROR_MESSAGE') as string;
    return loadQuery.error?.value?.message as string;
});

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage,
    widgetLoading,
    noData: computed(() => !state.currentValue && !state.previousValue),
});

useResizeObserver(valueTextRef, throttle(() => {
    setValueTextFontSize();
}, 500));

defineExpose<WidgetExpose>({
    loadWidget: () => {
        loadQuery.refetch();
        comparisonQuery.refetch();
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
