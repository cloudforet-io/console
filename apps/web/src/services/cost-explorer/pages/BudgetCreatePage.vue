<script setup lang="ts">
import type { ComputedRef } from 'vue';
import { computed, onUnmounted, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import { PCenteredLayoutHeader } from '@cloudforet/mirinae';



import { i18n } from '@/translations';

import ConfirmBackModal from '@/common/components/modals/ConfirmBackModal.vue';

import BudgetCreateStep1 from '@/services/cost-explorer/components/BudgetCreateStep1.vue';
import BudgetCreateStep2 from '@/services/cost-explorer/components/BudgetCreateStep2.vue';
import BudgetCreateStep3 from '@/services/cost-explorer/components/BudgetCreateStep3.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { useBudgetCreatePageStore } from '@/services/cost-explorer/stores/budget-create-page-store';

interface BudgetCreateState {
    steps: ComputedRef<{
        step: number;
        title: TranslateResult | string;
        description: TranslateResult | string;
    }[]>;
    closeConfirmModalVisible: boolean;
}

const router = useRouter();


const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;

const state = reactive<BudgetCreateState>({
    steps: computed(() => [
        {
            step: 1,
            title: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE_BUDGET'),
            description: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.STEP1_DESC'),
        },
        {
            step: 2,
            title: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE_BUDGET'),
            description: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.STEP2_DESCRIPTION'),
        },
        {
            step: 3,
            title: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SET_BUDGET_ALERTS'),
            description: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.STEP3_DESCRIPTION'),
        },
    ]),
    closeConfirmModalVisible: false,
});

const handleClickSecondPage = () => {
    budgetCreatePageStore.setCurrentStep(2);
};

const handleClickThirdPage = () => {
    budgetCreatePageState.currentStep = 3;
};

const openCancelModal = () => {
    state.closeConfirmModalVisible = true;
};

const handleClickClose = () => {
    budgetCreatePageStore.reset();
    router.push({
        name: COST_EXPLORER_ROUTE.BUDGET._NAME,
    });
};

onUnmounted(() => {
    budgetCreatePageStore.reset();
});
</script>

<template>
    <div class="budget-create-page"
         :class="[`step-${budgetCreatePageState.currentStep}`]"
    >
        <p-centered-layout-header :title="state.steps[budgetCreatePageState.currentStep - 1].title"
                                  :description="state.steps[budgetCreatePageState.currentStep - 1].description"
                                  :total-steps="state.steps.length"
                                  :current-step="budgetCreatePageState.currentStep"
                                  show-step
                                  show-close-button
                                  @close="openCancelModal"
        />
        <budget-create-step1 v-if="budgetCreatePageState.currentStep === 1"
                             @click-next="handleClickSecondPage"
                             @click-cancel="openCancelModal"
        />
        <budget-create-step2 v-else-if="budgetCreatePageState.currentStep === 2"
                             @click-next="handleClickThirdPage"
        />
        <budget-create-step3 v-else-if="budgetCreatePageState.currentStep === 3" />
        <confirm-back-modal :visible.sync="state.closeConfirmModalVisible"
                            @cancel="state.closeConfirmModalVisible = false"
                            @close="state.closeConfirmModalVisible = false"
                            @confirm="handleClickClose"
        />
    </div>
</template>

<style scoped lang="postcss">
.budget-create-page {
    margin: 9rem auto;
    &.step-1 {
        width: 62.5rem;
    }
    &.step-2 {
        width: 62.5rem;
    }
    &.step-3 {
        width: 62.5rem;
    }
}
</style>
