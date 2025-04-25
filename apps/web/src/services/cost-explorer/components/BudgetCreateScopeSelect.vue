<script setup lang="ts">
import {
    computed, reactive, watch, watchEffect,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PSelectDropdown, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { BudgetListParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/list';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import type { ServiceAccountListParameters } from '@/api-clients/identity/service-account/schema/api-verbs/list';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useBudgetCreatePageStore } from '@/services/cost-explorer/stores/budget-create-page-store';

const allReferenceStore = useAllReferenceStore();
const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;

const serviceAccount = computed(() => allReferenceStore.getters.serviceAccount);

const state = reactive({
    isSelectable: false,
    isRadioDisable: false,
    scopeList: [
        { name: 'project', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.PROJECT') },
        { name: 'serviceAccount', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SERVICE_ACCOUNT') },
    ],
    selectedScope: 0,
    serviceAccountList: [] as string[],
    existingServiceAccountIds: [],
    refinedServiceAccountList: computed<SelectDropdownMenuItem[]>(() => state.serviceAccountList
        .map((serviceAccountId) => ({
            name: serviceAccountId,
            label: serviceAccount.value[serviceAccountId].label,
        }))),
    selectedServiceAccount: '',
});

const fetchBudget = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.costAnalysis.budget.list<BudgetListParameters, ListResponse<BudgetModel>>();
        state.existingServiceAccountIds = results?.map((result) => result.service_account_id) ?? [];
    } catch (error) {
        ErrorHandler.handleError(error);
    }
};

watchEffect(async () => {
    await fetchBudget();
});

watch(() => budgetCreatePageState.project, async () => {
    const { results } = await SpaceConnector.clientV2.identity.serviceAccount.list<ServiceAccountListParameters, ListResponse<ServiceAccountModel>>({
        project_id: budgetCreatePageState.project,
    });
    state.serviceAccountList = results?.map((result) => result.service_account_id) ?? [];
}, { deep: true, immediate: true });

watch(() => budgetCreatePageState.scope, () => {
    state.isSelectable = budgetCreatePageState.scope.type === 'serviceAccount';
    if (budgetCreatePageState.scope.type === 'project') {
        budgetCreatePageState.scope.serviceAccount = '';
    }
}, { deep: true, immediate: true });

watch(() => budgetCreatePageState.project, () => {
    if (budgetCreatePageState.project.length > 0) {
        state.isRadioDisable = true;
    } else {
        state.isRadioDisable = false;
    }
}, { deep: true, immediate: true });
</script>

<template>
    <p-field-group required
                   :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SCOPE')"
    >
        <p-radio-group>
            <p-radio v-for="(scope, idx) in state.scopeList"
                     :key="`budget-scope-${idx}`"
                     v-model="budgetCreatePageState.scope.type"
                     :value="scope.name"
                     class="mb-1"
                     :disabled="!state.isRadioDisable"
            >
                <span class="radio-item">
                    {{ scope.label }}
                </span>
            </p-radio>
        </p-radio-group>
        <p-select-dropdown block
                           :disabled="!state.isSelectable"
                           :menu="state.refinedServiceAccountList"
                           :selected.sync="budgetCreatePageState.scope.serviceAccount"
        />
    </p-field-group>
</template>
