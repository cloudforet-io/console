<template>
    <div class="budget-form-amount-plan-total">
        <p-field-group required :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_BUDGET_TOTAL')"
                       :invalid-text="invalidTexts.amount"
                       :invalid="invalidState.amount"
        >
            <template #right-extra>
                ($USD)
            </template>
            <p-text-input v-model="formattedAmount" placeholder="1,000"
                          :invalid="invalidState.amount"
            >
                <template #right-extra>
                    ($)
                </template>
            </p-text-input>
        </p-field-group>
        <budget-form-amount-plan-last-months-cost />
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { PFieldGroup, PTextInput } from '@spaceone/design-system';

import BudgetFormAmountPlanLastMonthsCost
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanLastMonthsCost.vue';
import { useFormValidator } from '@/common/composables/form-validator';
import { commaFormatter, getNumberFromString } from '@spaceone/console-core-lib';

export default {
    name: 'BudgetFormAmountPlanTotal',
    components: {
        BudgetFormAmountPlanLastMonthsCost,
        PFieldGroup,
        PTextInput,
    },
    setup(props, { emit }) {
        const {
            forms: { amount },
            invalidTexts, invalidState, setForm,
        } = useFormValidator({
            amount: undefined as number|undefined,
        }, {
            amount: val => (val !== undefined ? '' : 'Required'),
        });

        const state = reactive({
            formattedAmount: computed<string>({
                get: () => commaFormatter(amount.value),
                set: (val: string) => { setForm('amount', getNumberFromString(val)); },
            }),
        });

        watch(() => amount.value, (value) => {
            emit('update', value, invalidState.amount.value);
        });

        return {
            invalidTexts,
            invalidState,
            ...toRefs(state),
        };
    },
};
</script>
<style>
.p-text-input {
    width: 28.5rem;
}

@screen mobile {
    .p-text-input {
        width: 100%;
    }
}
</style>
