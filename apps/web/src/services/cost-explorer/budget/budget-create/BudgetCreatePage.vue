<script setup lang="ts">

import { PHeading } from '@spaceone/design-system';

import BudgetForm from '@/services/cost-explorer/budget/shared/budget-form/BudgetForm.vue';


const handleFormConfirm = () => {

};

</script>

<template>
    <div>
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE_BUDGET')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <budget-form @confirm="handleFormConfirm" />
    </div>
</template>
