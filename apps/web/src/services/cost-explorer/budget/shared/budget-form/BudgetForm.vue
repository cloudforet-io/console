<script setup lang="ts">

import {
    computed, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { PButton } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { BudgetAmountPlanInfo } from '@/services/cost-explorer/budget/shared/budget-form/budget-form-amount-plan/BudgetFormAmountPlan.vue';
import BudgetFormAmountPlan
    from '@/services/cost-explorer/budget/shared/budget-form/budget-form-amount-plan/BudgetFormAmountPlan.vue';
import type { BudgetBaseInfo } from '@/services/cost-explorer/budget/shared/budget-form/BudgetFormBaseInfo.vue';
import BudgetFormBaseInfo from '@/services/cost-explorer/budget/shared/budget-form/BudgetFormBaseInfo.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';

const router = useRouter();
const allReferenceStore = useAllReferenceStore();

const state = reactive({
    project: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroup: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    dataSource: computed(() => allReferenceStore.getters.costDataSource),
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
        await SpaceConnector.clientV2.costAnalysis.budget.create({
            ...state.baseInfo,
            ...state.amountPlanInfo,
        });

        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.ALT_S_CREATE_BUDGET'), '');
        router.push({
            name: COST_EXPLORER_ROUTE.BUDGET._NAME,
        });
    } catch (e:any) {
        const ALREADY_EXIST_ERROR_CODE = 'ERROR_BUDGET_ALREADY_EXIST';
        if (e.code === ALREADY_EXIST_ERROR_CODE) {
            const selectedProjectOrProjectGroupName = state.baseInfo.project_group_id
                ? state.projectGroup[state.baseInfo.project_group_id]?.label
                : state.project[state.baseInfo.project_id]?.label;
            ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.BUDGET.ALT_E_CREATE_BUDGET_ALREADY_EXIST', {
                dataSourceName: state.dataSource[state.baseInfo.data_source_id]?.label,
                name: selectedProjectOrProjectGroupName,
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

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        allReferenceStore.load('project'),
        allReferenceStore.load('projectGroup'),
        allReferenceStore.load('costDataSource'),
    ]);
})();
</script>

<template>
    <div>
        <budget-form-base-info @update="handleChangeBaseInfo" />
        <budget-form-amount-plan class="mt-4"
                                 :project-group-id="state.baseInfo.project_group_id"
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

