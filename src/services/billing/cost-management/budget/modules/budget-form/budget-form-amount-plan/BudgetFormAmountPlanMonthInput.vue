<template>
    <p-field-group required :label="month" class="budget-form-amount-plan-month-input"
                   :invalid-texts="invalidTexts._amount"
                   :invalid="invalidState._amount"
    >
        <template v-if="isMonthToDate" #label-extra>
            <span>(MTD)</span>
        </template>
        <p-text-input v-model="formattedAmount" placeholder="1,000"
                      :invalid="invalidState._amount"
        >
            <template #right-extra>
                ($)
            </template>
        </p-text-input>
    </p-field-group>
</template>

<script lang="ts">
import {
    computed, watch,
} from '@vue/composition-api';

import { PFieldGroup, PTextInput } from '@spaceone/design-system';
import { commaFormatter, getNumberFromString } from '@spaceone/console-core-lib';
import { useFormValidator } from '@/common/composables/form-validator';

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
        const {
            forms: { _amount },
            invalidTexts, invalidState, setForm, resetValidations,
        } = useFormValidator({
            _amount: props.amount,
        }, {
            _amount: val => (val !== undefined ? '' : 'Required'),
        });

        const setAmount = (amount?: number) => {
            setForm('_amount', amount);
            emit('update:amount', amount);
        };

        const formattedAmount = computed<string>({
            get: () => commaFormatter(_amount.value),
            set: (val: string) => { setAmount(getNumberFromString(val)); },
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
                    isValid: !invalidState._amount.value,
                });
            }
        });

        return {
            _amount,
            invalidTexts,
            invalidState,
            formattedAmount,
            setAmount,
        };
    },
};
</script>

<style lang="postcss" scoped>
.budget-form-amount-plan-month-input {
    display: inline-block;
    .p-text-input {
        width: 100%;
    }
}
</style>
