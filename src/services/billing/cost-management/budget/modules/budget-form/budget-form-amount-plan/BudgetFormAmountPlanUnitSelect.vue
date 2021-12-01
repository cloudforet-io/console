<template>
    <div class="budget-form-amount-plan-unit-select">
        <p-select-card v-for="({title, desc, unit}) in plans"
                       :key="unit"
                       :value="unit"
                       :selected="selectedUnit"
                       @change="handleUnitChange"
        >
            <p-label class="title">
                {{ title }}
            </p-label>
            <p class="desc">
                {{ desc }}
            </p>
        </p-select-card>
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';

import { TranslateResult } from 'vue-i18n';

import { PLabel, PSelectCard } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { BudgetTimeUnit } from '@/services/billing/cost-management/budget/type';


interface Plan {
    title: TranslateResult;
    desc: TranslateResult;
    unit: Extract<BudgetTimeUnit, 'MONTHLY'|'TOTAL'>;
}

export default {
    name: 'BudgetFormAmountPlanUnitSelect',
    components: {
        PSelectCard,
        PLabel,
    },
    props: {
        selectedUnit: {
            type: String,
            default: 'TOTAL',
            required: true,
            validator(unit: BudgetTimeUnit) {
                return ['TOTAL', 'MONTHLY'].includes(unit);
            },
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            plans: computed<Plan[]>(() => [
                {
                    title: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.TOTAL_AMOUNT'),
                    desc: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.TOTAL_AMOUNT_DESC'),
                    unit: 'TOTAL',
                },
                {
                    title: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.MONTHLY_PLAN'),
                    desc: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.MONTHLY_PLAN_DESC'),
                    unit: 'MONTHLY',
                },
            ]),
        });

        const handleUnitChange = (value?: BudgetTimeUnit) => {
            if (value && props.selectedUnit !== value) {
                emit('update:selectedUnit', value);
            }
        };

        return {
            ...toRefs(state),
            handleUnitChange,
        };
    },
};
</script>

<style lang="postcss" scoped>
.budget-form-amount-plan-unit-select {
    @apply flex;
    column-gap: 0.5rem;

    .p-select-card {
        max-width: 21rem;
        padding-top: 0.75rem;
        padding-bottom: 0.75rem;
    }
    .title {
        color: inherit;
    }
    .desc {
        @apply text-gray-400 text-xs;
        text-align: center;
        padding: 0 3rem;
        line-height: 1.5;
    }
}

@screen mobile {
    .budget-form-amount-plan-unit-select {
        @apply flex-col;
        row-gap: 0.5rem;
    }
}

</style>
