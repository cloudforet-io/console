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
            <span v-if="field.name && value.path === 'limit'">
                {{ currencyMoneyFormatter(value[value.path], currency, currencyRates) }}
            </span>
            <span v-else-if="field.name && value.path === 'usd_cost'" class="text-blue-700">
                <router-link :to="value.link" class="link-text">
                    {{ currencyMoneyFormatter(value[value.path], currency, currencyRates) }}
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
} from '@/services/cost-explorer/budget/type';
import { Period } from '@/services/cost-explorer/type';
import { Location } from 'vue-router';
import { getStackedChartData } from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';
import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/lib/config';
import dayjs from 'dayjs';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { CURRENCY } from '@/store/modules/display/config';
import { i18n } from '@/translations';

const defaultTableKey = [{ name: 'Actual Cost', path: 'usd_cost' }, { name: 'Current vs Budget.', path: 'ratio' }];
const monthlyPlanningTableKey = { name: 'Budgeted', path: 'limit' };

const firstColumnData = {
    date: '',
    limit: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGETED'),
    usd_cost: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.ACTUAL_COST'),
    ratio: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_SPENT'),
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

interface BudgetCostType {
    key: string;
    value?: string[]|null;
}

interface BudgetTarget {
    projectId?: string;
    projectGroupId?: string;
}

export default {
    name: 'BudgetDetailSummaryTable',
    components: {
        PDataTable,
    },
    props: {
        currency: {
            type: String,
            default: CURRENCY.USD,
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
    },
    setup() {
        const getAccumulatedBudgetUsageData = (budgetUsageData: BudgetUsageData[], period: Period) => getStackedChartData(budgetUsageData, period, 'month');

        const getBudgetRatio = (budgetTimeUnit, usdCost, totalBudgetLimit, monthlyLimit) => {
            if (totalBudgetLimit === 0 || monthlyLimit === 0) return '-';
            return (budgetTimeUnit === BUDGET_TIME_UNIT.TOTAL) ? `${Math.round((usdCost / totalBudgetLimit) * 100)}%`
                : `${Math.round((usdCost / monthlyLimit) * 100)}%`;
        };

        const getBudgetUsageDataWithRatioAndLink = (accumulatedBudgetData, budgetTimeUnit: BudgetTimeUnit, totalBudgetLimit: number, costType: BudgetCostType, budgetTarget: BudgetTarget) => {
            const costTypeFilters = {
                [costType.key]: costType.value,
            };
            let targetFilters = {};
            if (budgetTarget.projectGroupId) targetFilters = { project_group_id: [budgetTarget.projectGroupId] };
            else if (budgetTarget.projectId) targetFilters = { project_id: [budgetTarget.projectId] };
            return accumulatedBudgetData.map((d) => {
                const period = {
                    start: dayjs.utc(d.date).startOf('month').format('YYYY-MM-DD'),
                    end: dayjs.utc(d.date).endOf('month').format('YYYY-MM-DD'),
                };
                const ratio = getBudgetRatio(budgetTimeUnit, d.usd_cost, totalBudgetLimit, d.limit);
                // const ratio = (budgetTimeUnit === BUDGET_TIME_UNIT.TOTAL) ? `${Math.round((d.usd_cost / totalBudgetLimit) * 100)}%`
                //     : `${Math.round((d.usd_cost / d.limit) * 100)}%`;
                const link = {
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    query: {
                        granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                        groupBy: arrayToQueryString([GROUP_BY.PRODUCT]),
                        period: objectToQueryString(period),
                        filters: objectToQueryString({ ...costTypeFilters, ...targetFilters }),
                    },
                };
                return {
                    ...d, ratio, link,
                };
            });
        };

        const getEnrichedBudgetUsageData = (budgetUsageData: BudgetUsageData[], period: Period, budgetTimeUnit: BudgetTimeUnit,
            totalBudgetLimit: number, costType: BudgetCostType, budgetTarget: BudgetTarget): EnrichedBudgetUsageData[] => {
            const _budgetUsageData = cloneDeep(budgetUsageData);
            const accumulatedBudgetData = getAccumulatedBudgetUsageData(_budgetUsageData, period);
            const budgetUsageDataWithRatioAndLink = getBudgetUsageDataWithRatioAndLink(accumulatedBudgetData, budgetTimeUnit,
                totalBudgetLimit, costType, budgetTarget);
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
            budgetCostType: computed<BudgetCostType|null>(() => ({
                key: getKeyOfCostType(state.budgetData?.cost_types),
                value: getValueOfCostType(state.budgetData?.cost_types, getKeyOfCostType(state.budgetData?.cost_types)),
            })),
            budgetTarget: computed<BudgetTarget>(() => ({
                projectId: state.budgetData?.project_id,
                projectGroupId: state.budgetData?.project_group_id,
            })),
            totalBudgetLimit: computed<number>(() => state.budgetData?.limit ?? 0),
            enrichedBudgetUsageData: computed<EnrichedBudgetUsageData[]>(
                () => getEnrichedBudgetUsageData(state.budgetUsageData, state.budgetPeriod,
                    state.budgetTimeUnit, state.totalBudgetLimit,
                    state.budgetCostType, state.budgetTarget),
            ),
            data: [],
            fields: computed(() => state.enrichedBudgetUsageData.map(d => ({
                name: d.date,
                label: d.date ? dayjs.utc(d.date).format('MMM YYYY') : ' ',
                // textAlign: 'right',
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
            currencyMoneyFormatter,
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
