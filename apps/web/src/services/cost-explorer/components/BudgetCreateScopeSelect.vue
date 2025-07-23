<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PSelectDropdown, PRadio,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

import { useBudgetListQuery } from '@/services/cost-explorer/composables/use-budget-list-query';
import { useBudgetCreatePageStore } from '@/services/cost-explorer/stores/budget-create-page-store';
import { useServiceAccountListQuery } from '@/services/service-account/composables/queries/use-service-account-list-query';


const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;

const referenceMap = useAllReferenceDataModel();

const state = reactive({
    isSelectable: false,
    isRadioDisable: false,
    scopeList: [
        { name: 'project', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.PROJECT') },
        { name: 'serviceAccount', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SERVICE_ACCOUNT') },
    ],
    selectedScope: 0,
    serviceAccountList: computed<string[]>(() => serviceAccountListData.value?.map((result) => result.service_account_id) ?? []),
    existingServiceAccountIds: computed<string[]>(() => budgetListData.value?.map((result) => result.service_account_id) ?? []),
    refinedServiceAccountList: computed<SelectDropdownMenuItem[]>(() => state.serviceAccountList
        .map((serviceAccountId) => ({
            name: serviceAccountId,
            label: referenceMap.serviceAccount[serviceAccountId]?.label || serviceAccountId,
        }))),
    selectedServiceAccount: '',
});

const { budgetListData } = useBudgetListQuery();
const { data: serviceAccountListData } = useServiceAccountListQuery({
    params: computed(() => ({
        project_id: budgetCreatePageState.project,
    })),
});

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
        <div class="flex flex-col mt-1">
            <div v-for="(scope, idx) in state.scopeList"
                 :key="`budget-scope-${idx}`"
                 class="flex items-center"
            >
                <p-radio
                    v-model="budgetCreatePageState.scope.type"
                    :value="scope.name"
                    :disabled="!state.isRadioDisable"
                    class="min-w-[8.75rem] mb-2"
                >
                    {{ scope.label }}
                </p-radio>

                <p-select-dropdown
                    v-if="scope.name === 'serviceAccount' && state.isSelectable"
                    block
                    :menu="state.refinedServiceAccountList"
                    :selected.sync="budgetCreatePageState.scope.serviceAccount"
                />
            </div>
        </div>
    </p-field-group>
</template>
