<template>
    <cost-dashboard-simple-card-widget
        title="Budget Usage"
        unit-type="PERCENT"
        :value="data.usage"
        :loading="loading"
        :description="`$${data.limit - data.usd_cost} Available`"
    >
        <template #title-extra>
            <p-i name="ic_budget" width="1em" height="1em"
                 class="mr-1"
            />
            {{ data.budget_count }} budgets
        </template>
        <template #default>
            <budget-usage-progress-bar :usage-rate="data.usage" class="budget-progress-bar" />
            <p class="progress-bar-label">
                <span class="usd-cost">$ {{ data.usd_cost }} <span class="spent">Spent</span>
                </span>
                <span class="limit">$ {{ data.limit }}</span>
            </p>
        </template>
    </cost-dashboard-simple-card-widget>
</template>

<script lang="ts">
import BudgetUsageProgressBar
    from '@/services/billing/cost-management/modules/BudgetUsageProgressBar.vue';
import CostDashboardSimpleCardWidget
    from '@/services/billing/cost-management/widgets/modules/CostDashboardSimpleCardWidget.vue';
import { reactive, toRefs } from '@vue/composition-api';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { PI } from '@spaceone/design-system';
import ErrorHandler from '@/common/composables/error/errorHandler';

interface BudgetUsageData {
    usd_cost: number;
    usage: number;
    limit: number;
    budget_count?: number;
}

export default {
    name: 'BudgetUsage',
    components: {
        CostDashboardSimpleCardWidget,
        BudgetUsageProgressBar,
        PI,
    },

    setup() {
        const state = reactive({
            data: {} as BudgetUsageData,
            loading: true,
        });

        const getData = async () => {
            try {
                const { results } = await SpaceConnector.client.costAnalysis.budgetUsage.analyze({
                    include_budget_count: true,
                    include_project_info: false,
                    filter: [],
                    start: '2020-12',
                    end: '2021-11',
                });
                state.data = results.map(d => ({
                    usd_cost: d.usd_cost.toFixed(2),
                    usage: Number(d.usage.toFixed(2)),
                    limit: d.limit.toFixed(2),
                    budget_count: d.budget_count,
                }))[0];
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        (() => {
            getData();
        })();


        return {
            ...toRefs(state),
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
    margin-top: 1rem;
    justify-content: space-between;

    .usd-cost {
        @apply text-indigo-500 font-bold;
        font-size: 1.125rem;
        line-height: 155%;
    }
    .spent {
        @apply text-gray-600 font-normal;
        font-size: 0.875rem;
        line-height: 150%;
    }
    .limit {
        @apply text-gray-800;
        font-size: 0.875rem;
        line-height: 150%;
    }
}
</style>
