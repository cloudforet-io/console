<template>
    <router-link :to="linkLocation" class="budget-list-card">
        {{ budget.name }}
    </router-link>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';
import { Location } from 'vue-router';

import { BudgetData } from '@/services/billing/cost-management/budget/type';
import { BILLING_ROUTE } from '@/services/billing/routes';

interface Props {
    budget: BudgetData;
}

export default {
    name: 'BudgetListCard',
    props: {
        budget: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props) {
        const state = reactive({
            linkLocation: computed<Location>(() => ({
                name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET.DETAIL._NAME,
                params: {
                    id: props.budget.budget_id,
                },
            })),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
/*
.budget-list-card {
}
*/
</style>
