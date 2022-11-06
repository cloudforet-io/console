<template>
    <div>
        <p-page-title :title="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE_BUDGET')"
                      child
                      @goBack="$router.go(-1)"
        />
        <budget-form @confirm="handleFormConfirm" />
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from 'vue';

import { PPageTitle } from '@spaceone/design-system';

import BudgetForm from '@/services/cost-explorer/budget/modules/budget-form/BudgetForm.vue';

export default {
    name: 'BudgetCreatePage',
    components: {
        BudgetForm,
        PPageTitle,
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
