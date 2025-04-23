<script setup lang="ts">
import {
    computed, defineProps, nextTick, reactive,
} from 'vue';


import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PProgressBar,
} from '@cloudforet/mirinae';

import { COST_DATA_FIELD_MAP } from '@/api-clients/dashboard/_constants/widget-constant';

import ErrorHandler from '@/common/composables/error/errorHandler';

import WidgetDataTable from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import { useWidgetLifecycle } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-lifecycle';
import { useWidgetPagination } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-pagination';
import { useWidget } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import type { Field, WidgetTableData } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-data-table-type';
import type {
    WidgetExpose, WidgetProps, WidgetEmit, BudgetUsageAnalyzeResponse,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';


interface Data {
    budget_id: string,
    name?: string;
    project_id?: string;
    project_group_id?: string;
    total_spent?: number;
    total_budget?: number;
    budget_usage?: number;
}
type Response = BudgetUsageAnalyzeResponse<Data>;

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit);

const state = reactive({
    loading: true,
    data: undefined as Response | undefined,
    tableFields: computed<Field[]>(() => [
        { label: 'Budget', name: 'name' },
        { label: 'Target', name: 'target', textOptions: { type: 'reference', referenceType: 'project_group' } },
        {
            label: 'Total spent', name: 'total_spent', textOptions: { type: 'cost' }, textAlign: 'right',
        },
        {
            label: 'Total budget', name: 'total_budget', textOptions: { type: 'cost' }, textAlign: 'right',
        },
        { label: ' ', name: 'progress' },
        {
            label: 'Rate', name: 'budget_usage', textOptions: { type: 'percent' }, textAlign: 'right',
        },
    ]),
    tableItems: computed<WidgetTableData[]>(() => state.data?.results?.map((d) => ({
        ...d,
        target: d.project_id ?? d.project_group_id,
        progress: d.budget_usage,
    })) ?? []),
});

const { pageSize, thisPage } = useWidgetPagination(widgetState);

/* Util */
const targetTextFormatter = (value: string): string => {
    const isProjectGroup = value.startsWith('pg-');
    if (isProjectGroup) return props.allReferenceTypeInfo.project_group.referenceMap[value].label ?? value;
    return props.allReferenceTypeInfo.project.referenceMap[value]?.label ?? value;
};

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchBudgetUsageAnalyze = getCancellableFetcher<object, Response>(SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze);
const fetchData = async (): Promise<Response> => {
    try {
        apiQueryHelper.setFilters(widgetState.consoleFilters);
        if (pageSize.value) apiQueryHelper.setPage(getPageStart(thisPage.value, pageSize.value), pageSize.value);


        const groupBy: string[] = ['budget_id', 'name'];
        if (widgetState.dataField) groupBy.push(widgetState.dataField);
        if (widgetState.dataField === COST_DATA_FIELD_MAP.PROJECT_GROUP.name) groupBy.push(COST_DATA_FIELD_MAP.PROJECT.name);
        else if (widgetState.dataField === COST_DATA_FIELD_MAP.PROJECT.name) groupBy.push(COST_DATA_FIELD_MAP.PROJECT_GROUP.name);

        const defaultSelect = {} as Record<string, string>;
        groupBy.forEach((field) => {
            defaultSelect[field] = field;
        });

        const { status, response } = await fetchBudgetUsageAnalyze({
            data_source_id: widgetState.options.cost_data_source,
            query: {
                granularity: widgetState.granularity,
                group_by: groupBy,
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                fields: {
                    total_spent: {
                        key: 'cost',
                        operator: 'sum',
                    },
                    total_budget: {
                        key: 'limit',
                        operator: 'sum',
                    },
                },
                select: {
                    ...defaultSelect,
                    total_spent: 'total_spent',
                    total_budget: 'total_budget',
                    budget_usage: {
                        operator: 'multiply',
                        fields: [
                            {
                                operator: 'divide',
                                fields: ['total_spent', 'total_budget'],
                            },
                            100,
                        ],
                    },
                },
                sort: [{ key: 'budget_usage', desc: true }],
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    return { results: [], more: false };
};

const initWidget = async (data?: Response): Promise<Response> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.loading = false;
    return state.data;
};
const refreshWidget = async (_thisPage = 1): Promise<Response> => {
    await nextTick();
    state.loading = true;
    thisPage.value = _thisPage;
    state.data = await fetchData();
    state.loading = false;
    return state.data;
};

/* Event */
const handleUpdateThisPage = (_thisPage: number) => {
    thisPage.value = _thisPage;
    refreshWidget(_thisPage);
};

useWidgetLifecycle({
    disposeWidget: undefined,
    initWidget,
    refreshWidget,
    props,
    emit,
    widgetState,
});

defineExpose<WidgetExpose<Response>>({
    initWidget,
    refreshWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="budget-usage-by-target"
                  v-on="widgetFrameEventHandlers"
    >
        <widget-data-table :loading="props.loading || state.loading"
                           :fields="state.tableFields"
                           :items="state.tableItems"
                           :currency="widgetState.currency"
                           disable-row-click
                           @update:thisPage="handleUpdateThisPage"
        >
            <template #col-target="{value}">
                {{ targetTextFormatter(value) }}
            </template>
            <template #col-progress="{value}">
                <p-progress-bar size="lg"
                                :percentage="value"
                />
            </template>
        </widget-data-table>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.budget-usage-by-target {
    .widget-data-table {
        width: 100%;
        height: 100%;
    }
    &.full {
        .widget-data-table {
            height: auto;
        }
    }
}
</style>
