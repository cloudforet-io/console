<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, onMounted, reactive, ref, watch,
} from 'vue';

import { cloneDeep, throttle } from 'lodash';

import { PTooltip } from '@cloudforet/mirinae';
import { getContrastingColor, numberFormatter } from '@cloudforet/utils';

import type { WidgetLoadResponse } from '@/api-clients/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import WidgetCustomLegend from '@/common/modules/widgets/_components/WidgetCustomLegend.vue';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDataTableQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-query';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetLoadQuery } from '@/common/modules/widgets/_composables/use-widget-load-query';
import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import { SUB_TOTAL_NAME } from '@/common/modules/widgets/_constants/widget-field-constant';
import {
    getReferenceLabel,
    getWidgetDateFields, getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import { getFormattedNumber } from '@/common/modules/widgets/_helpers/widget-helper';
import {
    getWidgetLoadApiQueryDateRange,
} from '@/common/modules/widgets/_helpers/widget-load-helper';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type {
    FormatRulesValue,
} from '@/common/modules/widgets/_widget-fields/format-rules/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { NumberFormatValue } from '@/common/modules/widgets/_widget-fields/number-format/type';
import type { XAxisValue } from '@/common/modules/widgets/_widget-fields/x-axis/type';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetEmit, WidgetExpose, WidgetProps } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetLegend } from '@/common/modules/widgets/types/widget-legend-typs';

import { gray } from '@/styles/colors';



const colorCodedTableRef = ref<null | HTMLElement>(null);
const scrollViewRef = ref<null | HTMLElement>(null);
const Y_AXIS_FIELD_WIDTH = 120;
const BOX_MIN_WIDTH = 64;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

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

    data: computed<WidgetLoadResponse|undefined>(() => loadQuery.data?.value),
    dataField: computed<string>(() => widgetOptionsState.dataFieldInfo?.data?.[0] || ''),
    // unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[state.dataField]),
    boxWidth: BOX_MIN_WIDTH,
    boxHeight: 0,
    scrollHeight: 0,
    xAxisData: computed<string[]>(() => {
        if (isDateField(widgetOptionsState.xAxisInfo?.data)) {
            const _isSeparatedDate = widgetOptionsState.xAxisInfo?.data !== DATE_FIELD.DATE;
            return getWidgetDateFields(widgetOptionsState.granularityInfo?.granularity, state.widgetDateRange.start, state.widgetDateRange.end, _isSeparatedDate);
        }
        return state.data?.results?.map((d) => d[widgetOptionsState.xAxisInfo?.data as string] as string) || [];
    }),
    yAxisData: computed<string[]>(() => {
        if (!state.data?.results?.length) return [];
        if (isPivotDataTable.value) {
            const _excludeFields = [...Object.keys(state.data?.labels_info ?? {}), SUB_TOTAL_NAME];
            return state.data.order?.filter((v) => !_excludeFields.includes(v)) || [];
        }
        return widgetOptionsState.dataFieldInfo?.data as string[] || [];
    }),
    legendList: [] as WidgetLegend[],
    widgetDateRange: computed<DateRange>(() => {
        let _start = dateRange.value.start;
        let _end = dateRange.value.end;
        if (isDateField(widgetOptionsState.xAxisInfo?.data)) {
            [_start, _end] = getWidgetDateRange(widgetOptionsState.granularityInfo?.granularity, _end, widgetOptionsState.xAxisInfo?.count);
        }
        return { start: _start, end: _end };
    }),
});

const widgetOptionsState = reactive({
    granularityInfo: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
    dataFieldInfo: computed<DataFieldValue>(() => props.widgetOptions?.dataField?.value as DataFieldValue),
    xAxisInfo: computed<XAxisValue>(() => props.widgetOptions?.xAxis?.value as XAxisValue),
    xAxisCount: computed<number>(() => widgetOptionsState.xAxisInfo?.count || 0),
    formatRulesInfo: computed<FormatRulesValue>(() => props.widgetOptions?.formatRules?.value as FormatRulesValue),
    numberFormatInfo: computed<NumberFormatValue>(() => props.widgetOptions?.numberFormat?.value as NumberFormatValue),
});


/* Api */
const loadQuery = useWidgetLoadQuery({
    widgetId: computed(() => props.widgetId),
    params: computed(() => ({
        widget_id: props.widgetId,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        group_by: widgetOptionsState.xAxisInfo?.data ? [widgetOptionsState.xAxisInfo?.data as string] : [],
        ...getWidgetLoadApiQueryDateRange(widgetOptionsState.granularityInfo?.granularity, dateRange.value),
        ...(!isDateField(widgetOptionsState.xAxisInfo.data) && { page: { start: 1, limit: widgetOptionsState.xAxisInfo?.count } }),
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
const targetValue = (xField?: string, yField?: string, format?: 'table'|'tooltip'): number|string => {
    if (!state.data?.results?.length || !xField || !yField) return '--';

    const _field = yField;
    const _targetData = state.data.results.find((d) => d[widgetOptionsState.xAxisInfo?.data as string] === xField);
    const _targetVal: number|undefined = _targetData?.[yField];

    if (!_targetVal) return format === 'table' ? '--' : '';
    if (!format) return _targetVal;
    if (format === 'table') {
        const columnFieldForPivot = dataTable.value?.options.PIVOT?.fields?.column;
        const fieldName = (isPivotDataTable.value && columnFieldForPivot) ? columnFieldForPivot : _field;
        const numberFormat = widgetOptionsState.numberFormatInfo[fieldName];
        const _formattedVal = getFormattedNumber(_targetVal, numberFormat);
        if ((_formattedVal.length * 6.5) > state.boxWidth) return '...';
        return _formattedVal;
    }
    return numberFormatter(_targetVal, { minimumFractionDigits: 2 }) || '--';
};
const getColor = (val: string|number): string => {
    let _formatRules = cloneDeep(widgetOptionsState.formatRulesInfo?.rules);
    let _color = widgetOptionsState.formatRulesInfo?.baseColor || gray[200];
    _formatRules = _formatRules?.sort((a, b) => (a?.number || 0) - (b?.number || 0)) || [];
    _formatRules?.forEach((d) => {
        if (val >= (d.number || 0)) {
            _color = d.color;
        }
    });
    return _color;
};
const resizeWidget = () => {
    const _containerWidth = colorCodedTableRef.value?.clientWidth;
    const _containerHeight = colorCodedTableRef.value?.clientHeight;
    if (!_containerWidth || !_containerHeight) return;

    // width
    const boxWidth = (_containerWidth - Y_AXIS_FIELD_WIDTH) / widgetOptionsState.xAxisCount;
    if (boxWidth < BOX_MIN_WIDTH) state.boxWidth = BOX_MIN_WIDTH - 2;
    else state.boxWidth = boxWidth - 2;

    // height
    const yAxisCount = state.yAxisData.length || 1;
    const boxHeight = (_containerHeight - 16) / yAxisCount;
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
};

/* Watcher */
watch(() => widgetOptionsState.formatRulesInfo?.rules, async () => {
    state.legendList = (widgetOptionsState.formatRulesInfo?.rules ?? [])?.map((d) => ({
        name: d.text,
        color: d.color,
        disabled: false,
    })) || [];
}, { immediate: true });

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage,
    widgetLoading,
    noData: computed(() => (state.data ? !state.data?.results?.length : false)),
});
watch(() => widgetOptionsState, () => {
    resizeWidget();
}, { deep: true });

/* Lifecycle */
defineExpose<WidgetExpose>({
    loadWidget: () => {
        loadQuery.refetch();
    },
});
onMounted(() => {
    emit('mounted', props.widgetName);
});
useResizeObserver(colorCodedTableRef, throttle(() => {
    resizeWidget();
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
                    {{ getReferenceLabel(props.allReferenceTypeInfo, state.dataField, yField) }}
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
                                <span>{{ targetValue(xField, yField, 'table') }}</span>
                            </p-tooltip>
                        </div>
                        <div class="x-field-text">
                            <span class="x-field-col"
                                  :style="{'width': `${state.boxWidth}px`}"
                            >{{ getReferenceLabel(props.allReferenceTypeInfo, widgetOptionsState.xAxisInfo?.data, xField) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <widget-custom-legend :legend-list="state.legendList"
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
        height: 95%;
        gap: 0.25rem;
        overflow: auto;
        margin-top: 1rem;
        &.overlay {
            height: 95%;
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
