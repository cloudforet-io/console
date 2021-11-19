<template>
    <div>
        <budget-form-base-info :budget-id="budgetId" @change="handleChangeBaseInfo" />
        <budget-form-amount-plan class="mt-4" :budget-id="budgetId" @change="handleChangeAmountPlanning" />
        <div class="text-right mt-4">
            <p-button style-type="primary-dark" :outline="true" class="mr-4">
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary-dark">
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CONFIRM') }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import { PButton } from '@spaceone/design-system';

import BudgetFormBaseInfo from '@/services/billing/cost-management/budget/modules/budget-form/BudgetFormBaseInfo.vue';
import BudgetFormAmountPlan
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlan.vue';

export default {
    name: 'BudgetForm',
    components: {
        BudgetFormAmountPlan,
        BudgetFormBaseInfo,
        PButton,
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
