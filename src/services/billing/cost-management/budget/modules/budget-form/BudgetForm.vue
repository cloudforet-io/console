<template>
    <div>
        <budget-form-base-info :budget-id="budgetId" @change="handleChangeBaseInfo" />
        <budget-form-amount-plan :budget-id="budgetId" @change="handleChangeAmountPlanning" />
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import BudgetFormBaseInfo from '@/services/billing/cost-management/budget/modules/budget-form/BudgetFormBaseInfo.vue';
import BudgetFormAmountPlan
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlan.vue';

export default {
    name: 'AmountPlanning',
    components: {
        BudgetFormAmountPlan,
        BudgetFormBaseInfo,
    },
    props: {
        budgetId: {
            type: String,
            default: undefined,
        },
    },
    setup() {
        const state = reactive({});

        const handleChangeBaseInfo = () => {

        };

        const handleChangeAmountPlanning = () => {

        };

        return {
            ...toRefs(state),
            handleChangeBaseInfo,
            handleChangeAmountPlanning,
        };
    },
};
</script>
