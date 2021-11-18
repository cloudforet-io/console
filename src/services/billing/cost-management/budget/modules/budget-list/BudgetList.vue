<template>
    <div>
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
                    planned_limits: [],
                    notifications: [
                        {
                            threshold: 90,
                            unit: 'ACTUAL_COST',
                            notification_type: 'WARNING',
                        },
                    ],
                    budget_id: 'budget-675a56fe8175',
                    name: 'Belkin Budget',
                    limit: 50000,
                    total_usage_usd_cost: 0,
                    cost_types: {},
                    time_unit: 'TOTAL',
                    start: '2022-01-01',
                    end: '2022-12-31',
                    tags: {},
                    project_id: 'project-18655561c535',
                    project_group_id: '',
                    domain_id: 'domain-58010aa2e451',
                    created_at: '2021-11-08T05:52:33.425Z',
                    updated_at: '2021-11-08T05:52:33.425Z',
                },
                {
                    planned_limits: [],
                    notifications: [
                        {
                            threshold: 232132,
                            unit: 'ACTUAL_COST',
                            notification_type: 'WARNING',
                        },
                    ],
                    budget_id: 'budget-df7f905dbc8f',
                    name: 'Belkin Snow - Budget',
                    limit: 0,
                    total_usage_usd_cost: 0,
                    cost_types: {
                        region_code: null,
                        product: null,
                        provider: [
                            'aws',
                        ],
                        account: null,
                    },
                    time_unit: 'MONTHLY',
                    start: '2021-01-01',
                    end: '2021-12-31',
                    tags: {},
                    project_id: 'project-18655561c535',
                    project_group_id: '',
                    domain_id: 'domain-58010aa2e451',
                    created_at: '2021-11-01T15:55:38.759Z',
                    updated_at: '2021-11-01T15:55:38.759Z',
                },
            ],
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
