<template>
    <p-data-table :fields="fields" :items="data"
                  :skeleton-rows="3"
                  :stripe="false"
                  :disable-copy="true"
    />
</template>

<script lang="ts">
import { PDataTable } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import cloneDeep from 'lodash/cloneDeep';
import { store } from '@/store';
import { BUDGET_TIME_UNIT, BudgetTimeUnit, BudgetUsageData } from '@/services/billing/cost-management/budget/type';
import { Period } from '@/services/billing/cost-management/cost-analysis/store/type';
import { getAccumulatedChartData } from '@/services/billing/cost-management/widgets/lib/widget-data-helper';

const defaultTableKey = [{ name: 'Actual Cost', path: 'usd_cost' }, { name: 'Current vs Budget.', path: 'ratio' }];
const monthlyPlanningTableKey = { name: 'Budgeted', path: 'limit' };

const firstColumnData = {
    date: '', limit: 'Budgeted', usd_cost: 'Actual Cost', ratio: 'Current vs. Budgeted',
};

interface EnrichedBudgetUsageData {
    date: string;
    limit: number|string;
    usd_cost: number;
    ratio: number;
}

export default {
    name: 'BudgetDetailSummaryTable',
    components: {
        PDataTable,
    },
    setup() {
        const getAccumulatedBudgetUsageData = (budgetUsageData: BudgetUsageData[], period: Period) => getAccumulatedChartData(budgetUsageData, period, 'month');

        const getEnrichedBudgetUsageData = (budgetUsageData: BudgetUsageData[], period: Period, budgetTimeUnit: BudgetTimeUnit, totalBudgetLimit: number): EnrichedBudgetUsageData[] => {
            const _budgetUsageData = cloneDeep(budgetUsageData);
            const accumulatedBudgetData = getAccumulatedBudgetUsageData(_budgetUsageData, period);
            const budgetUsageDataWithRatio = accumulatedBudgetData.map((d) => {
                const ratio = (budgetTimeUnit === BUDGET_TIME_UNIT.TOTAL) ? `${Math.round((d.usd_cost / totalBudgetLimit) * 100)}%`
                    : `${Math.round((d.usd_cost / d.limit) * 100)}%`;
                return {
                    ...d, ratio,
                };
            });
            return [firstColumnData, ...budgetUsageDataWithRatio] as unknown as EnrichedBudgetUsageData[];
        };
        const state = reactive({
            budgetUsageData: computed<BudgetUsageData[]>(() => store.state.service.budget.budgetUsageData),
            budgetTimeUnit: computed<BudgetTimeUnit>(() => store.state.service.budget.budgetData?.time_unit),
            budgetPeriod: computed<Period>(() => ({
                start: store.state.service.budget.budgetData?.start,
                end: store.state.service.budget.budgetData?.end,
            })),
            totalBudgetLimit: computed<number>(() => store.state.service.budget.budgetData?.limit),
            enrichedBudgetUsageData: computed<EnrichedBudgetUsageData[]>(
                () => getEnrichedBudgetUsageData(state.budgetUsageData, state.budgetPeriod, state.budgetTimeUnit, state.totalBudgetLimit),
            ),
            data: [],
            fields: computed(() => state.enrichedBudgetUsageData.map(d => ({
                name: d.date,
                label: d.date,
            }))),
            loading: true,
        });

        const setItems = (name, path) => {
            const items = { name };
            state.enrichedBudgetUsageData.forEach((d) => {
                items[d.date] = d[path];
            });
            return items;
        };

        const setTableData = () => {
            // set keys and items
            const tableKeys = state.budgetTimeUnit === BUDGET_TIME_UNIT.TOTAL ? defaultTableKey : [monthlyPlanningTableKey, ...defaultTableKey];
            tableKeys.forEach((key) => {
                state.data.push(setItems(key.name, key.path));
            });
        };
        setTableData();

        return {
            ...toRefs(state),
        };
    },
};
</script>
