<script setup lang="ts">

import { computed, reactive, watch } from 'vue';

import { PFieldGroup, PTextInput } from '@spaceone/design-system';

import { commaFormatter, getNumberFromString } from '@cloudforet/core-lib';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

const emit = defineEmits<{(e: 'update', amount: number|undefined, isAllvalid: boolean): void; }>();


const {
    forms: { amount },
    invalidTexts, invalidState, setForm, isAllValid,
} = useFormValidator({
    amount: undefined as number|undefined,
}, {
    amount: (val) => (val ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.REQUIRED_AMOUNT')),
});

const state = reactive({
    formattedAmount: computed<string>({
        get: () => commaFormatter(amount.value),
        set: (val: string) => { setForm('amount', getNumberFromString(val)); },
    }),
});

watch(() => amount.value, (value) => {
    emit('update', value, isAllValid.value);
});

</script>

<template>
    <div class="budget-form-amount-plan-total">
        <p-field-group required
                       :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_BUDGET_TOTAL')"
                       :invalid-text="invalidTexts.amount"
                       :invalid="invalidState.amount"
        >
            <template #right-extra>
                ($USD)
            </template>
            <p-text-input v-model="state.formattedAmount"
                          placeholder="1,000"
                          :invalid="invalidState.amount"
            >
                <template #right-extra>
                    ($)
                </template>
            </p-text-input>
        </p-field-group>
        <slot name="last-3-months" />
    </div>
</template>

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
