<template>
    <div>
        <p-page-title :title="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.UPDATE_BUDGET')"
                      child
                      @goBack="$router.go(-1)"
        />
        <budget-form :budget-id="budgetId"
                     @confirm="handleFormConfirm"
        />
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from 'vue';

import BudgetForm from '@/services/cost-explorer/budget/modules/budget-form/BudgetForm.vue';

export default {
    name: 'BudgetUpdatePage',
    components: {
        BudgetForm,
    },
    props: {
        budgetId: {
            type: String,
            default: '',
        },
    },
    setup() {
        const state = reactive({
        });

        const handleFormConfirm = () => {

        };

        return {
            ...toRefs(state),
            handleFormConfirm,
        };
    },
};
</script>
