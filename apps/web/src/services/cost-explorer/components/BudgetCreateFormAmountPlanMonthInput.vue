<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { PFieldGroup, PTextInput } from '@cloudforet/mirinae';
import { getNumberFromString, numberFormatter } from '@cloudforet/utils';

import { i18n } from '@/translations';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';

import { useFormValidator } from '@/common/composables/form-validator';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import type { MonthAmountInput } from '@/services/cost-explorer/types/budget-form-type';


interface Props {
    amount?: number;
    month: string;
    isMonthToDate: boolean;
    currency?: Currency;
}

const props = withDefaults(defineProps<Props>(), {
    amount: undefined,
    month: '',
    isMonthToDate: false,
    currency: CURRENCY.USD,
});

const emit = defineEmits<{(e: 'update:amount', amount: number|undefined): void;
    (e: 'update', monthAmountInput: MonthAmountInput): void;
}>();

const { i18nDayjs } = useI18nDayjs();

const {
    forms: { _amount },
    invalidTexts, invalidState, setForm, resetValidations,
} = useFormValidator({
    _amount: props.amount,
}, {
    _amount: (val) => (val !== undefined ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.REQUIRED_AMOUNT')),
});

const setAmount = (amount?: number) => {
    setForm('_amount', amount);
    emit('update:amount', amount);
};

const state = reactive({
    formattedMonth: computed(() => i18nDayjs.value.utc(props.month).format('MMMM YYYY')),
    formattedAmount: computed<string>({
        get: () => numberFormatter(_amount.value),
        set: (val: string) => { setAmount(getNumberFromString(val)); },
    }),
});

watch(() => props.amount, (amount) => {
    if (_amount.value !== amount) {
        setForm('_amount', amount);
        resetValidations();
    }
});
watch(() => _amount.value, (amount) => {
    if (props.amount !== amount) {
        emit('update', {
            amount: _amount.value,
            isValid: !invalidState._amount,
        });
    }
});

</script>

<template>
    <p-field-group required
                   :label="state.formattedMonth"
                   class="budget-create-form-amount-plan-month-input"
                   :invalid-texts="invalidTexts._amount"
                   :invalid="invalidState._amount"
    >
        <template v-if="isMonthToDate"
                  #label-extra
        >
            <span>(MTD)</span>
        </template>
        <p-text-input v-model="state.formattedAmount"
                      placeholder="1,000"
                      :invalid="invalidState._amount"
        >
            <template #right-extra>
                ({{ CURRENCY_SYMBOL[props.currency] }})
            </template>
        </p-text-input>
    </p-field-group>
</template>

<style lang="postcss" scoped>
.budget-create-form-amount-plan-month-input {
    display: inline-block;
    .p-text-input {
        width: 100%;
    }
}
</style>
