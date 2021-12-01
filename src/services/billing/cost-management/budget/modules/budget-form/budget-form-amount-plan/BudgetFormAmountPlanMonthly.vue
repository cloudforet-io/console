<template>
    <div class="budget-form-amount-plan-monthly">
        <div class="header">
            <div class="title">
                <p>
                    <p-label>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.MONTHLY_PLAN') }}</p-label> ($USD)
                </p>
                <budget-form-amount-plan-last-months-cost :data="lastMonthsCost" />
            </div>
            <p-button style-type="gray-border" :outline="true">
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.AUTO_FILL') }}
            </p-button>
        </div>
        <p-divider class="my-6" />
        <div class="input-wrapper">
            <budget-form-amount-plan-month-input v-for="(month, index) in months" :key="month"
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
import BudgetFormAmountPlanMonthInput
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanMonthInput.vue';
import BudgetFormAmountPlanLastMonthsCost
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanLastMonthsCost.vue';

export default {
    name: 'BudgetFormAmountPlanMonthly',
    components: {
        BudgetFormAmountPlanLastMonthsCost,
        BudgetFormAmountPlanMonthInput,
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
.budget-form-amount-plan-monthly {
    max-width: 87rem;
    .header {
        display: flex;
        margin-bottom: 0.5rem;
        .title {
            flex-grow: 1;
            flex-shrink: 0;
        }
        .p-button {
            margin-top: auto;
        }
    }
    .input-wrapper {
        @apply grid grid-cols-6;
        column-gap: 1rem;
        overflow: hidden;
        margin-bottom: 1.5rem;
    }

    @screen tablet {
        .input-wrapper {
            @apply grid-cols-4;
        }
    }

    @screen mobile {
        .header {
            @apply relative;
            .title {
                @apply flex-shrink;
            }
            .p-button {
                @apply absolute;
                bottom: 0;
                right: 0;
            }
        }
        .input-wrapper {
            @apply grid-cols-2;
        }
    }
}

</style>
