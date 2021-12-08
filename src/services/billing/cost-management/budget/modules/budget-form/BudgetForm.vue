<template>
    <div>
        <budget-form-base-info :budget-id="budgetId" @update="handleChangeBaseInfo" />
        <budget-form-amount-plan class="mt-4" :budget-id="budgetId" @update="handleChangeAmountPlanning" />
        <div class="text-right mt-4">
            <p-button style-type="primary-dark" :outline="true" class="mr-4"
                      @click="$router.go(-1)"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary-dark" :disabled="!isAllValid">
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CONFIRM') }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';

import { PButton } from '@spaceone/design-system';

import BudgetFormBaseInfo, { BudgetBaseInfo } from '@/services/billing/cost-management/budget/modules/budget-form/BudgetFormBaseInfo.vue';
import BudgetFormAmountPlan
, { BudgetAmountPlanInfo } from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlan.vue';

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
        const state = reactive({
            baseInfo: {} as BudgetBaseInfo,
            isBaseInfoValid: false,
            amountPlanInfo: {} as BudgetAmountPlanInfo,
            isAmountPlanInfoValid: false,
            isAllValid: computed(() => state.isBaseInfoValid && state.isAmountPlanInfoValid),
        });

        const handleChangeBaseInfo = (baseInfo: BudgetBaseInfo, isValid: boolean) => {
            state.baseInfo = baseInfo;
            state.isBaseInfoValid = isValid;
        };

        const handleChangeAmountPlanning = (amountPlanInfo: BudgetAmountPlanInfo, isValid: boolean) => {
            state.amountPlanInfo = amountPlanInfo;
            state.isAmountPlanInfoValid = isValid;
        };

        return {
            ...toRefs(state),
            handleChangeBaseInfo,
            handleChangeAmountPlanning,
        };
    },
};
</script>
