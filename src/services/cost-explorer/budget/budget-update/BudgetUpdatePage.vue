<template>
    <div>
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.UPDATE_BUDGET')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
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

import { PHeading } from '@spaceone/design-system';

import BudgetForm from '@/services/cost-explorer/budget/modules/budget-form/BudgetForm.vue';

export default {
    name: 'BudgetUpdatePage',
    components: {
        BudgetForm,
        PHeading,
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
