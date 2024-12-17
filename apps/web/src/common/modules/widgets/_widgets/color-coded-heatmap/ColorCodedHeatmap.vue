<script setup lang="ts">
import {
    computed, defineExpose, reactive, watch,
} from 'vue';


import { orderBy } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import {
    PEmpty,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetCustomLagend from '@/common/modules/widgets/_components/WidgetCustomLagend.vue';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import {
    getReferenceLabel,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import type { AdvancedFormatRulesValue } from '@/common/modules/widgets/_widget-fields/advanced-format-rules/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type { WidgetEmit, WidgetExpose, WidgetProps } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetLegend } from '@/common/modules/widgets/types/widget-legend-typs';


type Data = ListResponse<{
    [key: string]: string|number;
}>;

const BOX_MIN_WIDTH = 112;
const MAX_COUNT = 80;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange?.value as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
});
const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
    data: null as Data | null,
    boxWidth: computed<number>(() => {
        if (!props.width) return BOX_MIN_WIDTH;
        const widgetContentWidth = props.width;
        if (props.width >= 990) return widgetContentWidth / 10;
        return widgetContentWidth / 8 < BOX_MIN_WIDTH ? BOX_MIN_WIDTH : widgetContentWidth / 8;
    }),
    refinedData: computed(() => {
        if (!state.data) return [];
        const _filteredData = state.data.results?.filter((d) => {
            const _label = getReferenceLabel(props.allReferenceTypeInfo, state.formatRulesField, d[state.formatRulesField]);
            return state.legendList.find((l) => l.name === _label)?.disabled !== true;
        }) || [];
        const _orderedData = orderBy(_filteredData, [state.dataField], ['desc']);
        return _orderedData.map((d) => ({
            name: d[state.groupByField],
            label: getReferenceLabel(props.allReferenceTypeInfo, state.groupByField, d[state.groupByField]),
            value: numberFormatter(d[state.dataField], { minimumFractionDigits: 2 }),
            color: getColor(d[state.formatRulesField], state.formatRulesField),
            legendValue: getReferenceLabel(props.allReferenceTypeInfo, state.formatRulesField, d[state.formatRulesField]),
        }));
    }),
    legendList: [] as WidgetLegend[],
    // required fields
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
    groupByField: computed<string|undefined>(() => (props.widgetOptions?.groupBy as GroupByValue)?.value as string),
    formatRulesValue: computed<AdvancedFormatRulesValue>(() => props.widgetOptions?.advancedFormatRules as AdvancedFormatRulesValue),
    formatRulesField: computed<string|undefined>(() => state.formatRulesValue?.field),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
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
                start: dateRange.value.start,
                end: dateRange.value.end,
                group_by: [state.groupByField, state.formatRulesField],
                fields: {
                    [state.dataField]: {
                        key: state.dataField,
                        operator: 'sum',
                    },
                },
                page: { start: 1, limit: MAX_COUNT },
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
const getColor = (val: string, field: string): string => {
    const _label = getReferenceLabel(props.allReferenceTypeInfo, field, val);
    return state.formatRulesValue.value.find((d) => d.text === _label)?.color ?? state.formatRulesValue.baseColor;
};

/* Watcher */
watch(() => state.formatRulesValue, async () => {
    state.legendList = state.formatRulesValue.value.map((d) => ({
        name: d.text,
        color: d.color,
        disabled: false,
    }));
}, { immediate: true });

useWidgetInitAndRefresh({ props, emit, loadWidget });
defineExpose<WidgetExpose<Data>>({
    loadWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="color-coded-heatmap"
                  v-on="widgetFrameEventHandlers"
    >
        <!--Do not delete div element below. It's defense code for redraw-->
        <div class="content-wrapper">
            <div v-if="state.refinedData?.length"
                 class="box-wrapper"
                 :style="{'grid-template-columns': `repeat(auto-fill, ${state.boxWidth-4}px)`}"
            >
                <div v-for="(data, idx) in state.refinedData"
                     :key="`box-${idx}`"
                     v-tooltip.bottom="`${data.label}: ${data.value} (${ data.legendValue })`"
                     class="value-box"
                     :style="{'background-color': data.color}"
                >
                    <span class="value-text">{{ data.label }}</span>
                </div>
            </div>
            <p-empty v-else
                     class="p-empty"
            >
                <span>{{ $t('COMMON.WIDGETS.NO_DATA_TO_DISPLAY') }}</span>
            </p-empty>
        </div>
        <widget-custom-lagend :legend-list.sync="state.legendList"
                              class="widget-custom-legend"
        />
    </widget-frame>
</template>

<style lang="postcss" scoped>
.color-coded-heatmap {
    .content-wrapper {
        position: relative;
        height: calc(96% - 2rem);
        overflow-y: auto;
    }
    .box-wrapper {
        display: grid;
        grid-auto-flow: row;
        gap: 1px;
        .value-box {
            height: 3.125rem;
            font-weight: 500;
            padding: 0.5rem;
            .value-text {
                @apply text-label-sm;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
                text-overflow: ellipsis;
                text-align: center;
            }
        }
    }
    .p-empty {
        height: 100%;
    }
    .widget-custom-legend {
        position: absolute;
        bottom: 0;
        left: 0;
    }
}
</style>
