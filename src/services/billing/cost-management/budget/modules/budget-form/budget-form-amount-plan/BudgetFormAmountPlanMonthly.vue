<template>
    <div class="budget-form-amount-plan-monthly">
        <div class="header">
            <div class="title">
                <p>
                    <p-label>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.MONTHLY_PLAN') }}</p-label> ($USD)
                </p>
                <budget-form-amount-plan-last-months-cost />
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
import { Period } from '@/services/billing/cost-management/type';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

interface Props {
    period: Period;
}

export default {
    name: 'BudgetFormAmountPlanMonthly',
    components: {
        BudgetFormAmountPlanLastMonthsCost,
        BudgetFormAmountPlanMonthInput,
        PLabel,
        PButton,
        PDivider,
    },
    props: {
        period: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props) {
        const { i18nDayjs } = useI18nDayjs();

        const state = reactive({
            months: computed<string[]>(() => {
                const { start, end } = props.period;
                if (!start || !end) return [];

                const months: string[] = [];
                let month = i18nDayjs.value(start as string);
                const monthEnd = i18nDayjs.value(end as string);
                while (month.isSameOrBefore(monthEnd, 'month')) {
                    months.push(i18nDayjs.value(month).format('MMMM YYYY'));
                    month = month.add(1, 'month');
                }
                return months;
            }),
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
