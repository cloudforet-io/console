<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButton } from '@cloudforet/mirinae';


import type { BudgetCreateParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/create';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetCreateFormAmountPlan
    from '@/services/cost-explorer/components/BudgetCreateFormAmountPlan.vue';
import BudgetCreateFormBaseInfo from '@/services/cost-explorer/components/BudgetCreateFormBaseInfo.vue';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import type { BudgetAmountPlanInfo } from '@/services/cost-explorer/types/budget-form-type';


type BudgetBaseInfo = Pick<BudgetModel, 'name'|'provider_filter'|'project_id'|'data_source_id'|'workspace_id'>;

const router = useRouter();
const appContextStore = useAppContextStore();
const storeState = reactive({
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    baseInfo: {} as BudgetBaseInfo,
    isBaseInfoValid: false,
    amountPlanInfo: {} as BudgetAmountPlanInfo,
    isAmountPlanInfoValid: false,
    isAllValid: computed<boolean>(() => state.isBaseInfoValid && state.isAmountPlanInfoValid),
    loading: false,
});

const createBudget = async () => {
    if (state.loading) return;

    state.loading = true;
    try {
        const params: BudgetCreateParameters = {
            name: state.baseInfo.name,
            provider_filter: state.baseInfo.provider_filter,
            data_source_id: state.baseInfo.data_source_id,
            resource_group: storeState.isAdminMode ? 'WORKSPACE' : 'PROJECT',
            //
            planned_limits: state.amountPlanInfo.planned_limits,
            limit: state.amountPlanInfo.limit,
            time_unit: state.amountPlanInfo.time_unit,
            start: state.amountPlanInfo.start,
            end: state.amountPlanInfo.end,
        };
        if (storeState.isAdminMode) {
            params.workspace_id = state.baseInfo.workspace_id;
        } else {
            params.project_id = state.baseInfo.project_id;
        }
        await SpaceConnector.clientV2.costAnalysis.budget.create<BudgetCreateParameters>(params);

        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.ALT_S_CREATE_BUDGET'), '');
        await router.push({
            name: storeState.isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.BUDGET._NAME : COST_EXPLORER_ROUTE.BUDGET._NAME,
        }).catch(() => {});
    } catch (e:any) {
        const ALREADY_EXIST_ERROR_CODE = 'ERROR_BUDGET_ALREADY_EXIST';
        if (e.code === ALREADY_EXIST_ERROR_CODE) {
            const targetId = storeState.isAdminMode ? state.baseInfo.workspace_id : state.baseInfo.project_id;
            ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.BUDGET.ALT_E_CREATE_BUDGET_ALREADY_EXIST', {
                dataSourceName: state.baseInfo.data_source_id,
                name: targetId,
            }));
        } else {
            ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.BUDGET.ALT_E_CREATE_BUDGET'));
        }
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
        <budget-create-form-base-info @update="handleChangeBaseInfo" />
        <budget-create-form-amount-plan
            class="mt-4"
            :workspace-id="state.baseInfo.workspace_id"
            :project-id="state.baseInfo.project_id"
            :provider-filter="state.baseInfo.provider_filter"
            :data-source-id="state.baseInfo.data_source_id"
            @update="handleChangeAmountPlanning"
        />
        <div class="text-right mt-4">
            <p-button style-type="secondary"
                      class="mr-4"
                      @click="SpaceRouter.router.go(-1)"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      :loading="state.loading"
                      :disabled="!state.isAllValid"
                      @click="handleClickConfirm"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CONFIRM') }}
            </p-button>
        </div>
    </div>
</template>
