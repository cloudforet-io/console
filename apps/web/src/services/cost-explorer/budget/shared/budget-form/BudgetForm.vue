<script lang="ts">

import {
    computed, reactive, toRefs,
} from 'vue';

import { PButton } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { BudgetAmountPlanInfo } from '@/services/cost-explorer/budget/shared/budget-form/budget-form-amount-plan/BudgetFormAmountPlan.vue';
import BudgetFormAmountPlan
    from '@/services/cost-explorer/budget/shared/budget-form/budget-form-amount-plan/BudgetFormAmountPlan.vue';
import type { BudgetBaseInfo } from '@/services/cost-explorer/budget/shared/budget-form/BudgetFormBaseInfo.vue';
import BudgetFormBaseInfo from '@/services/cost-explorer/budget/shared/budget-form/BudgetFormBaseInfo.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';

export default {
    name: 'BudgetForm',
    components: {
        BudgetFormAmountPlan,
        BudgetFormBaseInfo,
        PButton,
    },
    props: {
        budgetId: {
            type: String,
            default: undefined,
        },
    },
    setup() {
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

                showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.ALT_S_CREATE_BUDGET'), '');
                SpaceRouter.router.push({
                    name: COST_EXPLORER_ROUTE.BUDGET._NAME,
                });
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.BUDGET.ALT_E_CREATE_BUDGET'));
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

        return {
            ...toRefs(state),
            handleChangeBaseInfo,
            handleChangeAmountPlanning,
            handleClickConfirm,
        };
    },
};
</script>

<template>
    <div>
        <budget-form-base-info :budget-id="budgetId"
                               @update="handleChangeBaseInfo"
        />
        <budget-form-amount-plan class="mt-4"
                                 :budget-id="budgetId"
                                 :project-group-id="baseInfo.project_group_id"
                                 :project-id="baseInfo.project_id"
                                 :cost-types="baseInfo.cost_types"
                                 @update="handleChangeAmountPlanning"
        />
        <div class="text-right mt-4">
            <p-button style-type="secondary"
                      class="mr-4"
                      @click="$router.go(-1)"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      :loading="loading"
                      :disabled="!isAllValid"
                      @click="handleClickConfirm"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CONFIRM') }}
            </p-button>
        </div>
    </div>
</template>

