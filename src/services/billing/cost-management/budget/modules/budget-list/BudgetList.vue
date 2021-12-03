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
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { BudgetData } from '@/services/billing/cost-management/budget/type';

export default {
    name: 'BudgetList',
    components: { BudgetListCard },
    setup() {
        const state = reactive({
            budgets: [] as BudgetData[],
        });

        const listBudget = async () => {
            const { results } = await SpaceConnector.client.costAnalysis.budget.list();
            state.budgets = results;
        };

        (async () => {
            await listBudget();
        })();
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
