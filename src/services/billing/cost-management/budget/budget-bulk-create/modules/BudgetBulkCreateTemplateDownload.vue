<template>
    <p-pane-layout>
        <p-panel-top>
            Download Template
            <template #extra>
                (optional)
            </template>
        </p-panel-top>

        <p-icon-text-button name="ic_download" style-type="secondary-dark">
            Template with the following values
        </p-icon-text-button>
        OR
        <p-icon-text-button name="ic_download" style-type="gray-border" :outline="true">
            Template with headers only
        </p-icon-text-button>

        <budget-period-select />

        <p-field-group label="How to budget" required>
            <p-radio v-for="({type, name, description}) in budgetPlans" :key="type"
                     v-model="selectedPlan"
                     :value="type"
                     class="plan"
            >
                <span class="name">{{ name }}</span>
                <span class="desc">{{ description }}</span>
            </p-radio>
        </p-field-group>

        <budget-target-select @update="handleUpdateTarget" />

        <budget-cost-type-select @update="handleUpdateCostTypes" />
    </p-pane-layout>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import {
    PFieldGroup, PIconTextButton, PPaneLayout, PPanelTop, PRadio,
} from '@spaceone/design-system';

import BudgetPeriodSelect from '@/services/billing/cost-management/budget/modules/BudgetPeriodSelect.vue';
import BudgetTargetSelect from '@/services/billing/cost-management/budget/modules/BudgetTargetSelect.vue';
import BudgetCostTypeSelect from '@/services/billing/cost-management/budget/modules/BudgetCostTypeSelect.vue';

export default {
    name: 'BudgetBulkCreateTemplateDownload',
    components: {
        BudgetCostTypeSelect,
        BudgetTargetSelect,
        BudgetPeriodSelect,
        PPaneLayout,
        PPanelTop,
        PIconTextButton,
        PFieldGroup,
        PRadio,
    },
    setup() {
        const state = reactive({
            budgetPlans: [
                { type: 'total', name: 'Total Amount', description: 'Create a budget that tracks against total amount' },
                { type: 'monthly', name: 'Monthly Planning', description: 'Specific your budgeted amount for each budget period' },
            ],
            selectedPlan: 'total',
        });

        const handleUpdateTarget = () => {
        };

        const handleUpdateCostTypes = () => {
        };

        return {
            ...toRefs(state),
            handleUpdateTarget,
            handleUpdateCostTypes,
        };
    },
};
</script>
