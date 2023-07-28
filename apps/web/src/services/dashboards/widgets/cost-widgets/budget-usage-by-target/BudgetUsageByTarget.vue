<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="budget-usage-by-target"
                  @refresh="refreshWidget"
    >
        <widget-data-table :loading="state.loading"
                           :fields="state.tableFields"
                           :items="state.tableItems"
                           :currency="state.currency"
                           :currency-rates="props.currencyRates"
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

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, toRefs,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import {
    PProgressBar,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { BudgetDataModel } from '@/services/dashboards/widgets/type';


type Data = BudgetDataModel;

const budgetQueryHelper = new QueryHelper();
const props = defineProps<WidgetProps>();
const state = reactive({
    ...toRefs(useWidgetState<Data>(props)),
    tableFields: computed<Field[]>(() => [
        { label: 'Target', name: 'target', textOptions: { type: 'reference', referenceType: 'projectGroup' } },
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
    tableItems: computed<Partial<Data>>(() => state.data?.results?.map((d) => ({
        ...d,
        target: d.project_id ?? d.project_group_id,
        progress: d.budget_usage,
    })) ?? []),
    dateRange: computed<DateRange>(() => ({
        start: state.settings?.date_range?.start ?? dayjs.utc().format('YYYY-MM'),
        end: state.settings?.date_range?.end ?? dayjs.utc().format('YYYY-MM'),
    })),
    thisPage: 1,
    widgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.BUDGET._NAME,
        params: {},
        query: {
            filters: budgetQueryHelper.setFilters(state.budgetConsoleFilters).rawQueryStrings,
        },
    })),
});
const storeState = reactive({
    projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
    projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Util */
const targetTextFormatter = (value: string): string => {
    const isProjectGroup = value.startsWith('pg-');
    if (isProjectGroup) return storeState.projectGroups[value].label;
    return storeState.projects[value].label;
};

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchBudgetUsageAnalyze = getCancellableFetcher<Data>(SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze);
const fetchData = async (): Promise<Data> => {
    try {
        apiQueryHelper.setFilters(state.budgetConsoleFilters);
        if (state.pageSize) apiQueryHelper.setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);
        const res = await fetchBudgetUsageAnalyze({
            query: {
                granularity: state.granularity,
                group_by: [state.groupBy, COST_GROUP_BY.PROJECT_GROUP, COST_GROUP_BY.PROJECT],
                start: state.dateRange.start,
                end: state.dateRange.end,
                fields: {
                    total_spent: {
                        key: 'usd_cost',
                        operator: 'sum',
                    },
                    total_budget: {
                        key: 'limit',
                        operator: 'sum',
                    },
                },
                select: {
                    [state.groupBy]: state.groupBy,
                    [COST_GROUP_BY.PROJECT_GROUP]: COST_GROUP_BY.PROJECT_GROUP,
                    [COST_GROUP_BY.PROJECT]: COST_GROUP_BY.PROJECT,
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
        if (res) return res;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    return { results: [], more: false };
};

const initWidget = async (data?: Data): Promise<Data> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.loading = false;
    return state.data;
};
const refreshWidget = async (thisPage = 1): Promise<Data> => {
    await nextTick();
    state.loading = true;
    state.thisPage = thisPage;
    state.data = await fetchData();
    state.loading = false;
    return state.data;
};

/* Event */
const handleUpdateThisPage = (thisPage: number) => {
    state.thisPage = thisPage;
    refreshWidget(thisPage);
};

(async () => {
    await Promise.allSettled([
        store.dispatch('reference/project/load'),
        store.dispatch('reference/projectGroup/load'),
    ]);
})();

useWidgetLifecycle({
    disposeWidget: undefined,
    refreshWidget,
    props,
    state,
});

defineExpose<WidgetExpose<Data>>({
    initWidget,
    refreshWidget,
});
</script>

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
