<script setup lang="ts">
import {
    computed, defineExpose, onMounted, reactive, watch,
} from 'vue';


import { useQuery } from '@tanstack/vue-query';
import { orderBy } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PEmpty,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import WidgetCustomLegend from '@/common/modules/widgets/_components/WidgetCustomLegend.vue';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { WIDGET_LOAD_STALE_TIME } from '@/common/modules/widgets/_constants/widget-constant';
import { normalizeAndSerialize } from '@/common/modules/widgets/_helpers/global-variable-helper';
import { sortObjectByKeys } from '@/common/modules/widgets/_helpers/widget-data-table-helper';
import {
    getReferenceLabel,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import { getWidgetDataTable } from '@/common/modules/widgets/_helpers/widget-helper';
import type { DataFieldValue } from '@/common/modules/widgets/_widget-fields/data-field/type';
import type { DateRangeValue } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type {
    FormatRulesValue,
} from '@/common/modules/widgets/_widget-fields/format-rules/type';
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
    runQueries: false,
    isPrivateWidget: computed<boolean>(() => props.widgetId.startsWith('private')),
    dataTable: undefined as PublicDataTableModel|PrivateDataTableModel|undefined,
    boxWidth: computed<number>(() => {
        if (!props.width) return BOX_MIN_WIDTH;
        const widgetContentWidth = props.width;
        if (props.width >= 990) return widgetContentWidth / 10;
        return widgetContentWidth / 8 < BOX_MIN_WIDTH ? BOX_MIN_WIDTH : widgetContentWidth / 8;
    }),
    legendList: [] as WidgetLegend[],
});

const widgetOptionsState = reactive({
    granularityInfo: computed<GranularityValue>(() => props.widgetOptions?.granularity?.value as GranularityValue),
    dataFieldInfo: computed<DataFieldValue>(() => props.widgetOptions?.dataField?.value as DataFieldValue),
    groupByInfo: computed<GroupByValue>(() => props.widgetOptions?.groupBy?.value as GroupByValue),
    formatRulesInfo: computed<FormatRulesValue>(() => props.widgetOptions?.formatRules?.value as FormatRulesValue),
});

/* Api */
const fetchWidgetData = async (params: PrivateWidgetLoadParameters|PublicWidgetLoadParameters): Promise<Data> => {
    const defaultFetcher = state.isPrivateWidget
        ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
        : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
    const res = await defaultFetcher(params);
    return res;
};

const queryKey = computed(() => [
    'widget-load-color-coded-heatmap',
    props.widgetId,
    {
        start: dateRange.value.start,
        end: dateRange.value.end,
        granularity: widgetOptionsState.granularityInfo?.granularity,
        dataTableId: state.dataTable?.data_table_id,
        dataTableOptions: JSON.stringify(sortObjectByKeys(state.dataTable?.options) ?? {}),
        groupBy: [widgetOptionsState.groupByInfo?.data as string, widgetOptionsState.formatRulesInfo?.field as string],
        vars: normalizeAndSerialize(props.dashboardVars),
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
    enabled: computed(() => props.widgetState !== 'INACTIVE' && !!state.dataTable && state.runQueries),
    staleTime: WIDGET_LOAD_STALE_TIME,
});

const loading = computed(() => queryResult.isLoading);
const errorMessage = computed(() => queryResult.error?.value?.message);

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
    errorMessage: errorMessage.value,
    widgetLoading: loading.value,
    noData: computed(() => (refinedData.value ? !(refinedData.value?.length) : false)),
});

/* Util */
const loadWidget = () => {
    state.runQueries = true;
};
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

useWidgetInitAndRefresh({ props, emit, loadWidget });
onMounted(async () => {
    if (!props.dataTableId) return;
    state.dataTable = await getWidgetDataTable(props.dataTableId);
});
defineExpose<WidgetExpose>({
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
