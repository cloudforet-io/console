<template>
    <fragment>
        <p class="toggle">
            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.ORIGINAL_DATA') }}
            <p-collapsible-toggle :toggle-type="'switch'"
                                  :is-collapsed.sync="showFormattedBudgetData"
                                  class="collapsible-toggle"
            />
        </p>
        <p-data-table :fields="fields"
                      :items="data"
                      :skeleton-rows="3"
                      :stripe="false"
                      :selectable="false"
                      :disable-copy="true"
                      :disable-hover="true"
                      class="budget-summary-table"
        >
            <template #col-format="{field, value}">
                <span v-if="field.name && value.path === 'limit'">
                    {{
                        showFormattedBudgetData ? currencyMoneyFormatter(value[value.path], currency, currencyRates)
                        : currencyMoneyFormatter(value[value.path], currency, currencyRates, false, 1000000000)
                    }}
                </span>
                <span v-else-if="field.name && value.path === 'usd_cost'"
                      class="text-blue-700"
                >
                    <router-link :to="value.link"
                                 class="link-text"
                    >
                        {{
                            showFormattedBudgetData ? currencyMoneyFormatter(value[value.path], currency, currencyRates)
                            : currencyMoneyFormatter(value[value.path], currency, currencyRates, false, 1000000000)
                        }}
                    </router-link>
                </span>
                <span v-else>{{ value[value.path] }}</span>
            </template>
        </p-data-table>
    </fragment>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';
import type { Location } from 'vue-router';

import { PCollapsibleToggle, PDataTable } from '@spaceone/design-system';
import dayjs from 'dayjs';
import cloneDeep from 'lodash/cloneDeep';

import { i18n } from '@/translations';

import { CURRENCY } from '@/store/modules/settings/config';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import type {
    BudgetTimeUnit,
    BudgetUsageData,
    CostType,
} from '@/services/cost-explorer/budget/type';
import {
    BUDGET_TIME_UNIT,
} from '@/services/cost-explorer/budget/type';
import { getStackedChartData } from '@/services/cost-explorer/cost-analysis/lib/widget-data-helper';
import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/lib/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { useBudgetPageStore } from '@/services/cost-explorer/store/budget-page-store';
import type { Period } from '@/services/cost-explorer/type';

const defaultTableKey = [{ name: 'Actual Cost', path: 'usd_cost' }, { name: 'Current vs Budget.', path: 'ratio' }];
const monthlyPlanningTableKey = { name: 'Budgeted', path: 'limit' };

const firstColumnData = {
    date: '',
    limit: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGETED'),
    usd_cost: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.ACTUAL_COST'),
    ratio: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_SPENT'),
};

const getKeyOfCostType = (costType: Record<CostType, string[]|null>) => Object.keys(costType).filter((k) => (costType[k] !== null))[0];
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
        PCollapsibleToggle,
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
        const budgetPageStore = useBudgetPageStore();
        const budgetPageState = budgetPageStore.$state;

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
                        granularity: primitiveToQueryString(GRANULARITY.MONTHLY),
                        group_by: arrayToQueryString([GROUP_BY.PRODUCT]),
                        period: objectToQueryString(period),
                        filters: objectToQueryString({ ...costTypeFilters, ...targetFilters }),
                    },
                };
                return {
                    ...d, ratio, link,
                };
            });
        };

        const getEnrichedBudgetUsageData = (
            budgetUsageData: BudgetUsageData[],
            period: Period,
            budgetTimeUnit: BudgetTimeUnit,
            totalBudgetLimit: number,
            costType: BudgetCostType,
            budgetTarget: BudgetTarget,
        ): EnrichedBudgetUsageData[] => {
            const _budgetUsageData = cloneDeep(budgetUsageData);
            const accumulatedBudgetData = getAccumulatedBudgetUsageData(_budgetUsageData, period);
            const budgetUsageDataWithRatioAndLink = getBudgetUsageDataWithRatioAndLink(
                accumulatedBudgetData,
                budgetTimeUnit,
                totalBudgetLimit,
                costType,
                budgetTarget,
            );
            return [firstColumnData, ...budgetUsageDataWithRatioAndLink] as unknown as EnrichedBudgetUsageData[];
        };

        const state = reactive({
            budgetUsageData: computed(() => budgetPageState.budgetUsageData),
            budgetData: computed(() => budgetPageState.budgetData),
            budgetTimeUnit: computed<BudgetTimeUnit>(() => state.budgetData?.time_unit),
            budgetPeriod: computed<Period>(() => ({
                start: state.budgetData?.start,
                end: state.budgetData?.end,
            })),
            budgetCostType: computed<BudgetCostType|null>(() => ({
                key: getKeyOfCostType(state.budgetData.cost_types ?? {}),
                value: getValueOfCostType(state.budgetData.cost_types ?? {}, getKeyOfCostType(state.budgetData.cost_types ?? {})),
            })),
            budgetTarget: computed<BudgetTarget>(() => ({
                projectId: state.budgetData?.project_id,
                projectGroupId: state.budgetData?.project_group_id,
            })),
            totalBudgetLimit: computed<number>(() => state.budgetData?.limit ?? 0),
            enrichedBudgetUsageData: computed<EnrichedBudgetUsageData[]>(
                () => getEnrichedBudgetUsageData(
                    state.budgetUsageData,
                    state.budgetPeriod,
                    state.budgetTimeUnit,
                    state.totalBudgetLimit,
                    state.budgetCostType,
                    state.budgetTarget,
                ),
            ),
            data: [],
            fields: computed(() => state.enrichedBudgetUsageData.map((d) => ({
                name: d.date,
                label: d.date ? dayjs.utc(d.date).format('MMM YYYY') : ' ',
                // textAlign: 'right',
            }))),
            loading: true,
            showFormattedBudgetData: true,
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
.toggle {
    @apply font-bold flex items-center;
    font-size: 0.875rem;
    line-height: 125%;
    margin-bottom: 0.75rem;
    gap: 0.5rem;
}
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
