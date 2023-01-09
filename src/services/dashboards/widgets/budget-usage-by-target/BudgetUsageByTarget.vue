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
    computed, defineExpose, defineProps, reactive, toRefs,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import {
    PProgressBar,
} from '@spaceone/design-system';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getConvertedBudgetFilter } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { BudgetDataModel } from '@/services/dashboards/widgets/type';



type Data = BudgetDataModel['results'];
interface FullData {
    results: Data;
    more: boolean;
}

const budgetQueryHelper = new QueryHelper();
const props = defineProps<WidgetProps>();
const state = reactive({
    ...toRefs(useWidgetState<FullData>(props)),
    tableFields: computed<Field[]>(() => [
        { label: 'Target', name: 'target', textOptions: { type: 'reference', referenceType: 'projectGroup' } },
        { label: 'Total spent', name: 'total_spent', textOptions: { type: 'cost' } },
        { label: 'Total budget', name: 'total_budget', textOptions: { type: 'cost' } },
        { label: ' ', name: 'progress' },
        { label: 'Rate', name: 'rate', textOptions: { type: 'percent' } },
    ]),
    tableItems: computed<Data[]>(() => state.data?.map((d) => {
        const percentage = d.total_spent / d.total_budget * 100;
        return {
            ...d,
            target: d.project_id ?? d.project_group_id,
            progress: percentage,
            rate: percentage,
        };
    }) ?? []),
    dateRange: computed<DateRange>(() => ({
        start: state.settings?.date_range?.start,
        end: state.settings?.date_range?.end,
    })),
    thisPage: 1,
    widgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.BUDGET._NAME,
        params: {},
        query: {
            filters: budgetQueryHelper.setFilters(getConvertedBudgetFilter(state.consoleFilters)).rawQueryStrings,
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
const fetchData = async (): Promise<FullData> => {
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters(state.consoleFilters);
        if (state.pageSize) apiQueryHelper.setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);
        const { results } = await SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze({
            query: {
                granularity: state.granularity,
                group_by: [state.groupBy, GROUP_BY.PROJECT_GROUP, GROUP_BY.PROJECT],
                start: '2022-02', // TODO: should be change to state.dateRange.start
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
                sort: [{ key: 'total_spent', desc: true }], // TODO: should be changed after api updated
                ...apiQueryHelper.data,
            },
        });
        return results;
    } catch (e) {
        ErrorHandler.handleError(e);
        return { results: [], more: false };
    }
};

const initWidget = async (data?: FullData): Promise<FullData> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.loading = false;
    return state.data;
};
const refreshWidget = async (thisPage = 1): Promise<FullData> => {
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

defineExpose<WidgetExpose<FullData>>({
    initWidget,
    refreshWidget,
});
</script>

<style lang="postcss" scoped>
.widget-data-table {
    width: 100%;
    height: 100%;
}
</style>
