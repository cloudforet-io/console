<template>
    <div class="budget-form-amount-plan-period-select">
        <p-field-group class="period-select"
                       :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_START_MONTH')"
                       required
        >
            <p-datetime-picker data-type="yearToMonth" />
        </p-field-group>
        <p-field-group class="period-select"
                       :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_END_MONTH')"
                       required
        >
            <p-datetime-picker data-type="yearToMonth" />
        </p-field-group>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import { PDatetimePicker, PFieldGroup } from '@spaceone/design-system';

export default {
    name: 'BudgetFormAmountPlanPeriodSelect',
    components: {
        PFieldGroup,
        PDatetimePicker,
    },
    setup() {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.budget-form-amount-plan-period-select {
    .period-select {
        display: inline-block;
        margin-right: 1rem;
    }

    @screen mobile {
        .period-select {
            width: 100%;
        }
    }
}
</style>
