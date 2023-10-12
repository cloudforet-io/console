<template>
    <div class="budget-form-amount-plan-unit-select">
        <p-select-card v-for="({title, desc, unit}, index) in plans"
                       :key="unit"
                       :tab-index="index"
                       :value="unit"
                       :selected="selectedUnit"
                       @change="handleUnitChange"
        >
            <p-field-title class="title">
                {{ title }}
            </p-field-title>
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
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PFieldTitle, PSelectCard } from '@spaceone/design-system';

import { i18n } from '@/translations';

import type { BudgetTimeUnit } from '@/services/cost-explorer/budget/type';

interface Plan {
    title: TranslateResult;
    desc: TranslateResult;
    unit: Extract<BudgetTimeUnit, 'MONTHLY'|'TOTAL'>;
}

export default {
    name: 'BudgetFormAmountPlanUnitSelect',
    components: {
        PSelectCard,
        PFieldTitle,
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
        margin-bottom: 0.25rem;
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
