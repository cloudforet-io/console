<template>
    <p-field-group required :label="month" class="monthly-amount-input">
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
    name: 'BudgetPlanMonthlyAmount',
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
.monthly-amount-input {
    display: inline-block;
}
</style>
