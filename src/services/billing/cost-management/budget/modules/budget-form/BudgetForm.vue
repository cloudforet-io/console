<template>
    <div>
        <budget-form-base-info :budget-id="budgetId" @change="handleChangeBaseInfo" />
        <budget-form-amount-planning :budget-id="budgetId" @change="handleChangeAmountPlanning" />
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import BudgetFormBaseInfo from '@/services/billing/cost-management/budget/modules/budget-form/BudgetFormBaseInfo.vue';
import BudgetFormAmountPlanning
    from '@/services/billing/cost-management/budget/modules/budget-form/BudgetFormAmountPlanning.vue';

export default {
    name: 'BudgetForm',
    components: { BudgetFormAmountPlanning, BudgetFormBaseInfo },
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
