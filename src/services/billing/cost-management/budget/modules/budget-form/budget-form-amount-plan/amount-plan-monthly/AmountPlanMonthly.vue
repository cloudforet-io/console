<template>
    <div class="amount-plan-monthly">
        <div class="header">
            <div class="title">
                <p>
                    <p-label>Monthly Budget Planning</p-label> ($USD)
                </p>
                <last-months-cost :data="lastMonthsCost" />
            </div>
            <p-button style-type="gray-border" size="lg" :outline="true">
                Auto-fill budget
            </p-button>
        </div>
        <p-divider class="my-6" />
        <div class="input-wrapper">
            <monthly-amount-input v-for="(month, index) in months" :key="month"
                                  class="input"
                                  :month="month"
                                  :is-month-to-date="index === 0"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';

import { PButton, PDivider, PLabel } from '@spaceone/design-system';
import MonthlyAmountInput
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/amount-plan-monthly/MonthlyAmountInput.vue';
import LastMonthsCost
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/LastMonthsCost.vue';

export default {
    name: 'AmountPlanMonthly',
    components: {
        LastMonthsCost,
        MonthlyAmountInput,
        PLabel,
        PButton,
        PDivider,
    },
    setup() {
        const state = reactive({
            months: ['January 2021', 'February 2021', 'March 2021', 'April 2021', 'May 2021', 'June 2021', 'July 2021',
                'August 2021', 'September 2021', 'October 2021', 'November 2021', 'December 2021'],
            lastMonthsCost: computed(() => [
                { month: 'January 2021', cost: 408.88 },
                { month: 'February 2021', cost: 408.88 },
                { month: 'March 2021', cost: 408.88 },
            ]),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
<style lang="postcss" scoped>
.amount-plan-monthly {
    .header {
        display: flex;
        margin-bottom: 0.5rem;
        .title {
            flex-grow: 1;
            flex-shrink: 0;
        }
    }
    .input-wrapper {
        @apply grid grid-cols-4 gap-4;
    }
}
</style>
