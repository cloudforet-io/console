<template>
    <div>
        <budget-list-card v-for="(budget, index) in budgets" :key="index" />
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
            budgets: [{}, {}, {}],
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
