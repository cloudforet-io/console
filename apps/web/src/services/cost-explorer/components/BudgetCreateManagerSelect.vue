<script setup lang="ts">
import { watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PFieldGroup } from '@cloudforet/mirinae';

import type { ServiceAccountGetParameters } from '@/api-clients/identity/service-account/schema/api-verbs/get';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useBudgetCreatePageStore } from '@/services/cost-explorer/stores/budget-create-page-store';

const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;

const handleSelectId = (selectedId: string|undefined) => {
    if (selectedId) budgetCreatePageStore.setBudgetManager(selectedId);
};

const handleFormatBudgetManager = (value: Record<string, any>) => {
    if (Array.isArray(value.USER) && value.USER.length === 0) {
        budgetCreatePageStore.setBudgetManager('');
    }
};

const fetchSelectedServiceAccount = async (serviceAccountId: string) => {
    try {
        const result = await SpaceConnector.clientV2.identity.serviceAccount.get<ServiceAccountGetParameters, ServiceAccountModel>({
            service_account_id: serviceAccountId,
        });
        if (result.service_account_mgr_id.length > 0) {
            budgetCreatePageStore.setBudgetManager(result.service_account_mgr_id);
        }
    } catch (error) {
        ErrorHandler.handleError(error);
    }
};

watch(() => budgetCreatePageState.scope.serviceAccount, async () => {
    if (budgetCreatePageState.scope.serviceAccount) {
        await fetchSelectedServiceAccount(budgetCreatePageState.scope.serviceAccount);
    }
}, { immediate: true, deep: true });
</script>

<template>
    <p-field-group required
                   :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.BUDGET_MANAGER')"
    >
        <user-select-dropdown
            show-user-list
            :show-user-group-list="false"
            :selected-id="budgetCreatePageState.budgetManager"
            :show-delete-all-button="false"
            @update:selected-id="handleSelectId"
            @formatted-selected-ids="handleFormatBudgetManager"
        />
    </p-field-group>
</template>
