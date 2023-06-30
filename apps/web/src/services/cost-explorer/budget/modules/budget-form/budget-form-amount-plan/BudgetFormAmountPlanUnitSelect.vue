<script lang="ts" setup>
import { PFieldTitle, PSelectCard } from '@spaceone/design-system';
import type { PropType } from 'vue';
import {
    computed,
    reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useI18n } from 'vue-i18n';

import type { BudgetTimeUnit } from '@/services/cost-explorer/budget/type';

interface Plan {
    title: TranslateResult;
    desc: TranslateResult;
    unit: Extract<BudgetTimeUnit, 'MONTHLY'|'TOTAL'>;
}

const props = defineProps({
    selectedUnit: {
        type: String as PropType<'TOTAL'|'MONTHLY'>,
        default: 'TOTAL',
        required: true,
        validator(unit: BudgetTimeUnit) {
            return ['TOTAL', 'MONTHLY'].includes(unit);
        },
    },
});
const emit = defineEmits<{(e: 'update:selectedUnit', value: BudgetTimeUnit): void}>();
const { t } = useI18n();

const state = reactive({
    plans: computed<Plan[]>(() => [
        {
            title: t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.TOTAL_AMOUNT'),
            desc: t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.TOTAL_AMOUNT_DESC'),
            unit: 'TOTAL',
        },
        {
            title: t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.MONTHLY_PLAN'),
            desc: t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.MONTHLY_PLAN_DESC'),
            unit: 'MONTHLY',
        },
    ]),
});

const handleUnitChange = (value?: BudgetTimeUnit) => {
    if (value && props.selectedUnit !== value) {
        emit('update:selectedUnit', value);
    }
};

</script>

<template>
    <div class="budget-form-amount-plan-unit-select">
        <p-select-card v-for="({title, desc, unit}, index) in state.plans"
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
