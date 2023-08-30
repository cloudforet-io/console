<script lang="ts">

import {
    computed, reactive, toRefs, watch,
} from 'vue';

import { PFieldGroup, PTextInput } from '@spaceone/design-system';

import { commaFormatter, getNumberFromString } from '@cloudforet/core-lib';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

interface Props {
    amount: number|undefined;
    month: string;
    isMonthToDate: boolean;
}

export interface MonthAmountInput {
    amount?: number;
    isValid?: boolean;
}

export default {
    name: 'BudgetFormAmountPlanMonthInput',
    components: {
        PFieldGroup,
        PTextInput,
    },
    model: {
        prop: 'amount',
        event: 'update:amount',
    },
    props: {
        amount: {
            type: Number,
            default: undefined,
        },
        month: {
            type: String,
            default: '',
        },
        isMonthToDate: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit }) {
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

        return {
            _amount,
            invalidTexts,
            invalidState,
            ...toRefs(state),
            setAmount,
        };
    },
};
</script>

<template>
    <p-field-group required
                   :label="formattedMonth"
                   class="budget-form-amount-plan-month-input"
                   :invalid-texts="invalidTexts._amount"
                   :invalid="invalidState._amount"
    >
        <template v-if="isMonthToDate"
                  #label-extra
        >
            <span>(MTD)</span>
        </template>
        <p-text-input v-model="formattedAmount"
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
