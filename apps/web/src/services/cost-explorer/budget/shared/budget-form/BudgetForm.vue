<script setup lang="ts">

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButton } from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { SpaceRouter } from '@/router';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetFormAmountPlan
    from '@/services/cost-explorer/budget/shared/budget-form/budget-form-amount-plan/BudgetFormAmountPlan.vue';
import BudgetFormBaseInfo from '@/services/cost-explorer/budget/shared/budget-form/BudgetFormBaseInfo.vue';
import type { BudgetAmountPlanInfo, BudgetBaseInfo } from '@/services/cost-explorer/budget/type';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';


const { t } = useI18n();
const state = reactive({
    baseInfo: {} as BudgetBaseInfo,
    isBaseInfoValid: false,
    amountPlanInfo: {} as BudgetAmountPlanInfo,
    isAmountPlanInfoValid: false,
    isAllValid: computed(() => state.isBaseInfoValid && state.isAmountPlanInfoValid),
    loading: false,
});

const createBudget = async () => {
    if (state.loading) return;

    state.loading = true;
    try {
        await SpaceConnector.client.costAnalysis.budget.create({
            ...state.baseInfo,
            ...state.amountPlanInfo,
        });

        showSuccessMessage(t('BILLING.COST_MANAGEMENT.BUDGET.ALT_S_CREATE_BUDGET'), '');
        SpaceRouter.router.push({
            name: COST_EXPLORER_ROUTE.BUDGET._NAME,
        });
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('BILLING.COST_MANAGEMENT.BUDGET.ALT_E_CREATE_BUDGET'));
    } finally {
        state.loading = false;
    }
};

/* Handlers */
const handleChangeBaseInfo = (baseInfo: BudgetBaseInfo, isValid: boolean) => {
    state.baseInfo = baseInfo;
    state.isBaseInfoValid = isValid;
};

const handleChangeAmountPlanning = (amountPlanInfo: BudgetAmountPlanInfo, isValid: boolean) => {
    state.amountPlanInfo = amountPlanInfo;
    state.isAmountPlanInfoValid = isValid;
};

const handleClickConfirm = () => {
    createBudget();
};
</script>

<template>
    <div>
        <budget-form-base-info @update="handleChangeBaseInfo" />
        <budget-form-amount-plan class="mt-4"
                                 :project-group-id="state.baseInfo.project_group_id"
                                 :project-id="state.baseInfo.project_id"
                                 :cost-types="state.baseInfo.cost_types"
                                 @update="handleChangeAmountPlanning"
        />
        <div class="text-right mt-4">
            <p-button style-type="secondary"
                      class="mr-4"
                      @click="SpaceRouter.router.go(-1)"
            >
                {{ t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      :loading="state.loading"
                      :disabled="!state.isAllValid"
                      @click="handleClickConfirm"
            >
                {{ t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CONFIRM') }}
            </p-button>
        </div>
    </div>
</template>

