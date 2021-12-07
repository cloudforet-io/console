<template>
    <p-field-group required :label="month" class="budget-form-amount-plan-month-input">
        <template v-if="isMonthToDate" #label-extra>
            <span>(MTD)</span>
        </template>
        <p-text-input v-model="formattedAmount" placeholder="1,000">
            {{ commaFormatter(amount) }}
            <template #right-extra>
                ($)
            </template>
        </p-text-input>
    </p-field-group>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';

import { PFieldGroup, PTextInput } from '@spaceone/design-system';
import { commaFormatter } from '@spaceone/console-core-lib';

interface Props {
    month: string;
    isMonthToDate: boolean;
}

export default {
    name: 'BudgetFormAmountPlanMonthInput',
    components: {
        PFieldGroup,
        PTextInput,
    },
    props: {
        month: {
            type: String,
            default: '',
        },
        isMonthToDate: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props) {
        const state = reactive({
            amount: props.isMonthToDate ? 1000 : undefined,
            formattedAmount: computed<string>({
                get: () => commaFormatter(state.amount),
                set: (val: string) => {
                    const amountStr = val.match(/\d+/g)?.join('');
                    state.amount = amountStr ? parseInt(amountStr) : undefined;
                },
            }),
        });

        return {
            ...toRefs(state),
            commaFormatter,
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
