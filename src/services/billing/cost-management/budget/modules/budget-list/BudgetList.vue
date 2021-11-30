<template>
    <div class="budget-list">
        <budget-list-card v-for="budget in budgets" :key="budget.budget_id" :budget="budget" />
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import BudgetListCard from '@/services/billing/cost-management/budget/modules/budget-list/BudgetListCard.vue';

export default {
    name: 'BudgetList',
    components: { BudgetListCard },
    setup() {
        const state = reactive({
            budgets: [
                {
                    planned_limits: [
                        {
                            date: '2020-12',
                            limit: 3000000,
                        },
                        {
                            date: '2021-01',
                            limit: 2000000,
                        },
                        {
                            date: '2021-02',
                            limit: 4000000,
                        },
                        {
                            date: '2021-03',
                            limit: 3000000,
                        },
                        {
                            date: '2021-04',
                            limit: 4000000,
                        },
                        {
                            date: '2021-05',
                            limit: 5000000,
                        },
                        {
                            date: '2021-06',
                            limit: 6000000,
                        },
                        {
                            date: '2021-07',
                            limit: 3000000,
                        },
                        {
                            date: '2021-08',
                            limit: 2000000,
                        },
                        {
                            date: '2021-09',
                            limit: 3000000,
                        },
                        {
                            date: '2021-10',
                            limit: 4000000,
                        },
                        {
                            date: '2021-11',
                            limit: 3000000,
                        },
                    ],
                    notifications: [
                        {
                            threshold: 90,
                            unit: 'PERCENT',
                            notification_type: 'CRITICAL',
                        },
                    ],
                    budget_id: 'budget-605cf6b75484',
                    name: 'Belkin Budget',
                    limit: 42000000,
                    total_usage_usd_cost: 30608102,
                    cost_types: {
                        account: null,
                        region_code: null,
                        product: null,
                        provider: [
                            'aws',
                        ],
                    },
                    time_unit: 'MONTHLY',
                    start: '2020-12-01',
                    end: '2021-11-30',
                    tags: {},
                    project_id: 'project-18655561c535',
                    project_group_id: '',
                    domain_id: 'domain-58010aa2e451',
                    created_at: '2021-11-23T11:07:31.303Z',
                    updated_at: '2021-11-23T11:07:31.303Z',
                },
                {
                    planned_limits: [],
                    notifications: [
                        {
                            threshold: 90,
                            unit: 'PERCENT',
                            notification_type: 'CRITICAL',
                        },
                    ],
                    budget_id: 'budget-a615f604b9bd',
                    name: 'Belkin Budget',
                    limit: 10000000,
                    total_usage_usd_cost: 30608102,
                    cost_types: {
                        region_code: null,
                        provider: [
                            'aws',
                        ],
                        product: null,
                        account: null,
                    },
                    time_unit: 'TOTAL',
                    start: '2020-12-01',
                    end: '2021-11-30',
                    tags: {},
                    project_id: 'project-18655561c535',
                    project_group_id: '',
                    domain_id: 'domain-58010aa2e451',
                    created_at: '2021-11-24T09:38:34.498Z',
                    updated_at: '2021-11-24T09:38:34.498Z',
                },
            ],
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
<style lang="postcss" scoped>
.budget-list {
    @apply grid grid-cols-2 gap-4;

    @screen mobile {
        @apply grid-cols-1;
    }
}
</style>
