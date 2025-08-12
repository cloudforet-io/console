<script setup lang="ts">
import { computed, watch } from 'vue';

import { PFieldGroup } from '@cloudforet/mirinae';

import { useServiceAccountApi } from '@/api-clients/identity/service-account/composables/use-service-account-api';
import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useBudgetCreatePageStore } from '@/services/cost-explorer/stores/budget-create-page-store';

const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;

const { key: workspaceUserListKey, params: workspaceUserListParams } = useServiceQueryKey('identity', 'workspace-user', 'list', {
    params: computed(() => ({
        query: {
            filter: [
                {
                    k: 'email_verified',
                    v: true,
                    o: 'eq',
                },
            ],
        },
    })),
});
const { workspaceUserAPI } = useWorkspaceUserApi();
const { data: workspaceUserList } = useScopedQuery({
    queryKey: workspaceUserListKey,
    queryFn: () => workspaceUserAPI.list(workspaceUserListParams.value),
    select: (data) => data.results,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
}, ['WORKSPACE']);

const { serviceAccountAPI } = useServiceAccountApi();
const userPool = computed(() => (workspaceUserList.value ?? []).map((user) => user.user_id));


const handleSelectId = (selectedId: string|undefined) => {
    if (selectedId) budgetCreatePageStore.setBudgetManager(selectedId);
};

const handleFormatBudgetManager = (value: Record<string, any>) => {
    if (Array.isArray(value.USER) && value.USER.length === 0) {
        budgetCreatePageStore.setBudgetManager('');
    }
};

const { key: serviceAccountGetKey, params: serviceAccountGetParams } = useServiceQueryKey('identity', 'service-account', 'get', {
    contextKey: computed(() => budgetCreatePageState.scope.serviceAccount),
    params: computed(() => ({
        service_account_id: budgetCreatePageState.scope.serviceAccount ?? '',
    })),
});

const { data: serviceAccountId } = useScopedQuery({
    queryKey: serviceAccountGetKey,
    queryFn: () => serviceAccountAPI.get(serviceAccountGetParams.value),
    select: (data) => data.service_account_mgr_id,
    enabled: computed(() => !!budgetCreatePageState.scope.serviceAccount),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
}, ['WORKSPACE']);

watch(() => serviceAccountId.value, async () => {
    if (serviceAccountId.value && userPool.value.includes(serviceAccountId.value)) {
        budgetCreatePageStore.setBudgetManager(serviceAccountId.value ?? '');
    }
}, { immediate: true, deep: true });
</script>

<template>
    <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.BUDGET_MANAGER')">
        <user-select-dropdown
            show-user-list
            :show-user-group-list="false"
            :selected-id="budgetCreatePageState.budgetManager"
            :show-delete-all-button="false"
            :user-pool="userPool"
            @update:selected-id="handleSelectId"
            @formatted-selected-ids="handleFormatBudgetManager"
        />
    </p-field-group>
</template>
