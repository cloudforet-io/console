<script lang="ts" setup>

import { commaFormatter, getNumberFromString } from '@cloudforet/core-lib';
import { PFieldGroup, PTextInput } from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { useFormValidator } from '@/common/composables/form-validator';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import type { MonthAmountInput } from '@/services/cost-explorer/budget/type';

interface Props {
    amount: number|undefined;
    month: string;
    isMonthToDate: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    amount: undefined,
    month: '',
    isMonthToDate: false,
});
const emit = defineEmits<{(e: 'update:amount', value?: number): void;
    (e: 'update', value: MonthAmountInput): void;
}>();

const { t } = useI18n();


const { i18nDayjs } = useI18nDayjs();

const {
    forms: { _amount },
    invalidTexts, invalidState, setForm, resetValidations,
} = useFormValidator({
    _amount: props.amount,
}, {
    _amount: (val) => (val !== undefined ? '' : t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.REQUIRED_AMOUNT')),
});

const setAmount = (amount?: number) => {
    setForm('_amount', amount);
    emit('update:amount', amount);
};

const state = reactive({
    formattedMonth: computed(() => i18nDayjs.value.utc(props.month).format('MMMM YYYY')),
    formattedAmount: computed<string>({
        get: () => commaFormatter(_amount.value),
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
                   class="budget-form-amount-plan-month-input"
                   :invalid-texts="invalidTexts._amount"
                   :invalid="invalidState._amount"
    >
        <template v-if="isMonthToDate"
                  #label-extra
        >
            <span>(MTD)</span>
        </template>
        <p-text-input v-model:value="state.formattedAmount"
                      placeholder="1,000"
                      :invalid="invalidState._amount"
        >
            <template #right-extra>
                ($)
            </template>
        </p-text-input>
    </p-field-group>
</template>

<style lang="postcss" scoped>
.budget-form-amount-plan-month-input {
    display: inline-block;
    .p-text-input {
        width: 100%;
    }
}
</style>
