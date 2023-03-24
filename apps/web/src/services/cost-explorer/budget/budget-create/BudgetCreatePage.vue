<template>
    <div>
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE_BUDGET')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <budget-form @confirm="handleFormConfirm" />
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from 'vue';

import { PHeading } from '@spaceone/design-system';

import BudgetForm from '@/services/cost-explorer/budget/modules/budget-form/BudgetForm.vue';

export default {
    name: 'BudgetCreatePage',
    components: {
        BudgetForm,
        PHeading,
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
