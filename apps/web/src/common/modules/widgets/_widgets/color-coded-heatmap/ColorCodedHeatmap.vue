<script setup lang="ts">
import {
    computed, defineExpose, onMounted, reactive, watch,
} from 'vue';

import { useQuery } from '@tanstack/vue-query';
import { orderBy } from 'lodash';

import {
    PEmpty,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { WidgetLoadParams, WidgetLoadResponse } from '@/api-clients/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetCustomLegend from '@/common/modules/widgets/_components/WidgetCustomLegend.vue';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFormQuery } from '@/common/modules/widgets/_composables/use-widget-form-query';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { WIDGET_LOAD_STALE_TIME } from '@/common/modules/widgets/_constants/widget-constant';
import {
    normalizeAndSerializeVars,
} from '@/common/modules/widgets/_helpers/global-variable-helper';
import {
    getReferenceLabel,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type {
    FormatRulesValue,
} from '@/common/modules/widgets/_widget-fields/format-rules/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type { GroupByValue } from '@/common/modules/widgets/_widget-fields/group-by/type';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type { WidgetEmit, WidgetExpose, WidgetProps } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetLegend } from '@/common/modules/widgets/types/widget-legend-typs';



const BOX_MIN_WIDTH = 112;
const MAX_COUNT = 80;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { keys, api } = useWidgetFormQuery({
    widgetId: computed(() => props.widgetId),
    preventLoad: true,
});

const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => (props.widgetOptions?.dateRange?.value as DateRangeValue)),
    baseOnDate: computed(() => props.dashboardOptions?.date_range?.end),
    granularity: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
});
const state = reactive({
    isPrivateWidget: computed<boolean>(() => props.widgetId.startsWith('private')),
    dataTable: undefined as DataTableModel|undefined,
    boxWidth: computed<number>(() => {
        if (!props.width) return BOX_MIN_WIDTH;
        const widgetContentWidth = props.width;
        if (props.width >= 990) return widgetContentWidth / 10;
        return widgetContentWidth / 8 < BOX_MIN_WIDTH ? BOX_MIN_WIDTH : widgetContentWidth / 8;
    }),
    legendList: [] as WidgetLegend[],
    dataTableLoading: false,
});

const widgetOptionsState = reactive({
    granularityInfo: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
    dataFieldInfo: computed<DataFieldValue>(() => props.widgetOptions?.dataField?.value as DataFieldValue),
    groupByInfo: computed<GroupByValue>(() => props.widgetOptions?.groupBy?.value as GroupByValue),
    formatRulesInfo: computed<FormatRulesValue>(() => props.widgetOptions?.formatRules?.value as FormatRulesValue),
});

/* Api */
const fetchWidgetData = async (params: WidgetLoadParams): Promise<WidgetLoadResponse> => {
    const defaultFetcher = state.isPrivateWidget
        ? api.privateWidgetAPI.load
        : api.publicWidgetAPI.load;
    const res = await defaultFetcher(params);
    return res;
};

const queryKey = computed(() => [
    ...(state.isPrivateWidget ? keys.privateWidgetLoadQueryKey.value : keys.publicWidgetLoadQueryKey.value),
    props.dashboardId,
    props.widgetId,
    props.widgetName,
    {
        start: dateRange.value.start,
        end: dateRange.value.end,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        dataTableId: props.dataTableId,
        // dataTableOptions: normalizeAndSerializeDataTableOptions(state.dataTable?.options as DataTableOptions),
        // dataTables: normalizeAndSerializeDataTableOptions((props.dataTables || []).map((d) => d?.options || {})),
        groupBy: [widgetOptionsState.groupByInfo?.data as string, widgetOptionsState.formatRulesInfo?.field as string],
        vars: normalizeAndSerializeVars(props.dashboardVars),
    },
]);

const queryResult = useQuery({
    queryKey,
    queryFn: () => fetchWidgetData({
        widget_id: props.widgetId,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        group_by: (widgetOptionsState.groupByInfo?.data && widgetOptionsState.formatRulesInfo?.field) ? [widgetOptionsState.groupByInfo?.data, widgetOptionsState.formatRulesInfo?.field] : [],
        start: dateRange.value.start,
        end: dateRange.value.end,
        vars: props.dashboardVars,
        page: {
            start: 1,
            limit: MAX_COUNT,
        },
    }),
    enabled: computed(() => props.widgetState !== 'INACTIVE' && !!state.dataTable && !props.loadDisabled),
    staleTime: WIDGET_LOAD_STALE_TIME,
});

const widgetLoading = computed<boolean>(() => queryResult.isFetching.value || state.dataTableLoading);
const errorMessage = computed<string|undefined>(() => {
    if (!state.dataTable) return i18n.t('COMMON.WIDGETS.NO_DATA_TABLE_ERROR_MESSAGE');
    return queryResult.error?.value?.message;
});

const refinedData = computed(() => {
    const data = queryResult.data?.value;
    if (!data?.results || !widgetOptionsState.groupByInfo?.data || !widgetOptionsState.formatRulesInfo?.field) return [];
    const groupByField = widgetOptionsState.groupByInfo.data as string;
    const formatRulesField = widgetOptionsState.formatRulesInfo.field as string;
    const dataField = widgetOptionsState.dataFieldInfo.data as string;

    const _filteredData = data.results?.filter((d) => {
        const _label = getReferenceLabel(props.allReferenceTypeInfo, formatRulesField, d[formatRulesField as string] as string);
        return state.legendList.find((l) => l.name === _label)?.disabled !== true;
    }) || [];
    const _orderedData = orderBy(_filteredData, [dataField], ['desc']);
    return _orderedData.map((d) => {
        const groupByValue = d[groupByField] as string;
        const dataFieldValue = d[dataField] as number;
        const formatRulesValue = d[formatRulesField] as string;
        return {
            name: d[groupByField],
            label: getReferenceLabel(props.allReferenceTypeInfo, groupByField, groupByValue),
            value: numberFormatter(dataFieldValue, { minimumFractionDigits: 2 }),
            color: getColor(formatRulesValue, formatRulesField),
            legendValue: getReferenceLabel(props.allReferenceTypeInfo, formatRulesField, formatRulesValue),
        };
    });
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange,
    errorMessage,
    widgetLoading,
    noData: computed(() => (refinedData.value ? !(refinedData.value?.length) : false)),
});

/* Util */
const getColor = (val: string, field: string): string => {
    const _label = getReferenceLabel(props.allReferenceTypeInfo, field, val);
    return (widgetOptionsState.formatRulesInfo?.rules ?? []).find((d) => d.text === _label || _label.includes(d.text) || val.includes(d.text))?.color
        ?? widgetOptionsState.formatRulesInfo.baseColor as string;
};

/* Watcher */
watch(() => widgetOptionsState.formatRulesInfo, async () => {
    state.legendList = (widgetOptionsState.formatRulesInfo?.rules ?? []).map((d) => ({
        name: d.text as string,
        color: d.color,
        disabled: false,
    }));
}, { immediate: true });


watch(() => props.dataTableId, async (newDataTableId) => {
    if (!newDataTableId) return;
    state.dataTableLoading = true;
    const fetcher = state.isPrivateWidget
        ? api.privateDataTableAPI.get
        : api.publicDataTableAPI.get;
    try {
        state.dataTable = await fetcher({ data_table_id: newDataTableId });
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.dataTableLoading = false;
    }
}, { immediate: true });
defineExpose<WidgetExpose>({
    loadWidget: () => {
        queryResult.refetch();
    },
});
onMounted(() => {
    emit('mounted', props.widgetName);
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="color-coded-heatmap"
                  v-on="widgetFrameEventHandlers"
    >
        <!--Do not delete div element below. It's defense code for redraw-->
        <div class="content-wrapper">
            <div v-if="refinedData?.length"
                 class="box-wrapper"
                 :style="{'grid-template-columns': `repeat(auto-fill, ${state.boxWidth-4}px)`}"
            >
                <div v-for="(data, idx) in (refinedData ?? [])"
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
        <widget-custom-legend :legend-list.sync="state.legendList"
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
