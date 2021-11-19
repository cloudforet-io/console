<template>
    <p-field-group required :label="month" class="budget-form-amount-plan-month-input">
        <template v-if="isMonthToDate" #label-extra>
            <span>(MTD)</span>
        </template>
        <p-text-input v-model="amount">
            <template #right-extra>
                ($)
            </template>
        </p-text-input>
    </p-field-group>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import { PFieldGroup, PTextInput } from '@spaceone/design-system';

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
    setup() {
        const state = reactive({
            amount: 100,
        });

        return {
            ...toRefs(state),
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
