<template>
    <cost-dashboard-simple-card-widget
        title="Budget Usage"
        unit-type="PERCENT"
        :value="usageRate"
        :description="`${currencyMoneyFormatter(availableCost, currency, currencyRates)} Available`"
        :loading="loading"
    >
        <template #title-extra>
            <p-i name="ic_budget" width="1em" height="1em"
                 class="mr-1"
            />
            {{ budgetCount }} budgets
        </template>
        <template #default>
            <budget-usage-progress-bar :usage-rate="usageRate" class="budget-progress-bar" />
            <p class="progress-bar-label">
                <span class="usage-cost">
                    {{ currencyMoneyFormatter(usageCost, currency, currencyRates) }} <span class="spent">Spent</span>
                </span>
                <span class="limit-cost">
                    {{ currencyMoneyFormatter(limitCost, currency, currencyRates) }}
                </span>
            </p>
        </template>
    </cost-dashboard-simple-card-widget>
</template>

<script lang="ts">
import BudgetUsageProgressBar
    from '@/services/billing/cost-management/modules/BudgetUsageProgressBar.vue';
import CostDashboardSimpleCardWidget
    from '@/services/billing/cost-management/widgets/modules/CostDashboardSimpleCardWidget.vue';
import { PI } from '@spaceone/design-system';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { CURRENCY } from '@/store/modules/display/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import dayjs from 'dayjs';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import {
    getConvertedBudgetFilter,
} from '@/services/billing/cost-management/cost-analysis/lib/helper';

export default {
    name: 'BudgetUsage',
    components: {
        CostDashboardSimpleCardWidget,
        BudgetUsageProgressBar,
        PI,
    },
    props: {
        filters: {
            type: Object,
            default: () => ({}),
        },
        period: {
            type: Object,
            default: () => ({}),
        },
        currency: {
            type: String,
            default: CURRENCY.USD,
            validator(value: CURRENCY) {
                return Object.values(CURRENCY).includes(value);
            },
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const state = reactive({
            loading: true,
            budgetCount: 0,
            usageRate: 0,
            usageCost: 0,
            limitCost: 0,
            availableCost: computed(() => {
                if (state.limitCost - state.usageCost > 0) return state.limitCost - state.usageCost;
                return 0;
            }),
        });

        const budgetQueryHelper = new QueryHelper();
        const fetchData = async () => {
            budgetQueryHelper.setFilters(getConvertedBudgetFilter(props.filters));
            try {
                const { results } = await SpaceConnector.client.costAnalysis.budgetUsage.analyze({
                    include_budget_count: true,
                    include_project_info: false,
                    filter: [
                    ],
                    start: dayjs.utc(props.period?.start).format('YYYY-MM'),
                    end: dayjs.utc(props.period?.end).format('YYYY-MM'),
                    ...budgetQueryHelper.apiQuery,
                });
                return results;
            } catch (e) {
                return [];
            }
        };

        const getData = async () => {
            try {
                state.loading = true;
                const results = await fetchData();
                state.usageCost = results[0]?.usd_cost || 0;
                state.usageRate = Number(results[0]?.usage.toFixed(2)) || 0;
                state.limitCost = results[0]?.limit || 0;
                state.budgetCount = results[0]?.budget_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        watch([() => props.period, () => props.filters], () => {
            getData();
        }, { immediate: true });

        return {
            ...toRefs(state),
            currencyMoneyFormatter,
        };
    },
};
</script>
<style lang="postcss" scoped>
.budget-progress-bar {
    margin-top: 1rem;
}

>>> .progress-bar {
    .background-bar {
        height: 0.75rem;
    }
    .tracker-bar {
        height: 0.75rem;
        margin-top: -0.75rem;
    }
}

.progress-bar-label {
    @apply flex;
    margin-top: 0.25rem;
    justify-content: space-between;

    .usage-cost {
        @apply text-indigo-500 font-bold;
        font-size: 1.125rem;
        line-height: 155%;
    }
    .spent {
        @apply text-gray-600 font-normal;
        font-size: 0.875rem;
        line-height: 150%;
    }
    .limit-cost {
        @apply text-gray-800;
        font-size: 0.875rem;
        line-height: 150%;
    }
}
</style>
