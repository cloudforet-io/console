<template>
    <p-data-table :fields="fields" :items="data"
                  :skeleton-rows="3"
                  :stripe="false"
                  :selectable="false"
                  :disable-copy="true"
                  :disable-hover="true"
                  class="budget-summary-table"
    >
        <template #col-format="{field, value, index}">
            <span v-if="field.name && value.path === 'usd_cost'">
                <router-link :to="value.link" class="link-text">
                    {{ value[value.path] }}
                </router-link>
            </span>
            <span v-else>{{ value[value.path] }}</span>
        </template>
    </p-data-table>
</template>

<script lang="ts">
import { PDataTable } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import cloneDeep from 'lodash/cloneDeep';
import { store } from '@/store';
import {
    BUDGET_TIME_UNIT, BudgetData,
    BudgetTimeUnit,
    BudgetUsageData,
    CostType,
} from '@/services/billing/cost-management/budget/type';
import { Period } from '@/services/billing/cost-management/type';
import { Location } from 'vue-router';
import { getAccumulatedChartData } from '@/services/billing/cost-management/widgets/lib/widget-data-helper';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';
import { CHART_TYPE } from '@/services/billing/cost-management/widgets/lib/config';
import { GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
import dayjs from 'dayjs';

const defaultTableKey = [{ name: 'Actual Cost', path: 'usd_cost' }, { name: 'Current vs Budget.', path: 'ratio' }];
const monthlyPlanningTableKey = { name: 'Budgeted', path: 'limit' };

const firstColumnData = {
    date: '', limit: 'Budgeted', usd_cost: 'Actual Cost', ratio: 'Current vs. Budgeted',
};

const getKeyOfCostType = (costType: Record<CostType, string[]|null>) => Object.keys(costType).filter(k => (costType[k] !== null))[0];
const getValueOfCostType = (costType: Record<CostType, string[]|null>, costTypeKey: string) => costType[costTypeKey];


interface EnrichedBudgetUsageData {
    date: string;
    limit: number|string;
    usd_cost: number;
    ratio: number;
    link?: Location | string;
}

export default {
    name: 'BudgetDetailSummaryTable',
    components: {
        PDataTable,
    },
    setup() {
        const getAccumulatedBudgetUsageData = (budgetUsageData: BudgetUsageData[], period: Period) => getAccumulatedChartData(budgetUsageData, period, 'month');

        const getBudgetUsageDataWithRatioAndLink = (accumulatedBudgetData, budgetTimeUnit: BudgetTimeUnit, totalBudgetLimit: number, costTypeKey: string, costTypeValue: string[]|null) => {
            const filters = {
                [costTypeKey]: costTypeValue,
            };
            return accumulatedBudgetData.map((d) => {
                const period = {
                    start: dayjs.utc(d.date).startOf('month').format('YYYY-MM-DD'),
                    end: dayjs.utc(d.date).endOf('month').format('YYYY-MM-DD'),
                };
                const ratio = (budgetTimeUnit === BUDGET_TIME_UNIT.TOTAL) ? `${Math.round((d.usd_cost / totalBudgetLimit) * 100)}%`
                    : `${Math.round((d.usd_cost / d.limit) * 100)}%`;
                const link = {
                    name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                    query: {
                        chartType: primitiveToQueryString(CHART_TYPE.DONUT),
                        granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                        groupBy: arrayToQueryString([GROUP_BY.PRODUCT]),
                        period: objectToQueryString(period),
                        filters: objectToQueryString(filters),
                    },
                };
                return {
                    ...d, ratio, link,
                };
            });
        };

        const getEnrichedBudgetUsageData = (budgetUsageData: BudgetUsageData[], period: Period, budgetTimeUnit: BudgetTimeUnit,
            totalBudgetLimit: number, costTypeKey: string, costTypeValue: string[]|null): EnrichedBudgetUsageData[] => {
            const _budgetUsageData = cloneDeep(budgetUsageData);
            const accumulatedBudgetData = getAccumulatedBudgetUsageData(_budgetUsageData, period);
            const budgetUsageDataWithRatioAndLink = getBudgetUsageDataWithRatioAndLink(accumulatedBudgetData, budgetTimeUnit,
                totalBudgetLimit, costTypeKey, costTypeValue);
            return [firstColumnData, ...budgetUsageDataWithRatioAndLink] as unknown as EnrichedBudgetUsageData[];
        };

        const state = reactive({
            budgetData: computed<BudgetData>(() => store.state.service.budget.budgetData),
            budgetUsageData: computed<BudgetUsageData[]>(() => store.state.service.budget.budgetUsageData),
            budgetTimeUnit: computed<BudgetTimeUnit>(() => state.budgetData?.time_unit),
            budgetPeriod: computed<Period>(() => ({
                start: state.budgetData?.start,
                end: state.budgetData?.end,
            })),
            budgetCostTypeKey: computed<string>(() => getKeyOfCostType(state.budgetData?.cost_types)),
            budgetCostTypeValue: computed<string[]|null>(() => getValueOfCostType(state.budgetData?.cost_types, state.budgetCostTypeKey)),
            totalBudgetLimit: computed<number>(() => state.budgetData?.limit),
            enrichedBudgetUsageData: computed<EnrichedBudgetUsageData[]>(
                () => getEnrichedBudgetUsageData(state.budgetUsageData, state.budgetPeriod, state.budgetTimeUnit, state.totalBudgetLimit, state.budgetCostTypeKey, state.budgetCostTypeValue),
            ),
            data: [],
            fields: computed(() => state.enrichedBudgetUsageData.map(d => ({
                name: d.date,
                label: d.date ? dayjs(d.date).format('MMM YYYY') : ' ',
            }))),
            loading: true,
        });

        const setTableItems = (name, path) => {
            const items = { name };
            state.enrichedBudgetUsageData.forEach((d) => {
                items[d.date] = { ...d, path };
            });
            return items;
        };

        const setTableKeysAndItems = () => {
            // set keys and items
            const tableKeys = state.budgetTimeUnit === BUDGET_TIME_UNIT.TOTAL ? defaultTableKey : [monthlyPlanningTableKey, ...defaultTableKey];
            tableKeys.forEach((key) => {
                state.data.push(setTableItems(key.name, key.path));
            });
        };
        setTableKeysAndItems();

        return {
            ...toRefs(state),
        };
    },
};
</script>
<style lang="postcss" scoped>
.budget-summary-table {
    td {
        .link-text {
            &:hover {
                text-decoration: underline;
            }
        }
    }
}
</style>
