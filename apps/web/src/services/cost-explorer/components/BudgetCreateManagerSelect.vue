<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PCheckboxGroup, PCheckbox, PButton, PPopover,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useUserReferenceStore } from '@/store/reference/user-reference-store';

import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useBudgetCreatePageStore } from '../stores/budget-create-page-store';

interface BudgetCreateManagerSelectState {
    budgetManagerList: SelectDropdownMenuItem[];
    excludedSelectedIds: ComputedRef<string[]>;
}

interface Props {
    serviceAccountList: string[];
}

const props = defineProps<Props>();

const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;

const userReferenceStore = useUserReferenceStore();

const userReferenceItems = computed(() => userReferenceStore.state.items);

const state = reactive<BudgetCreateManagerSelectState>({
    budgetManagerList: [
        { name: 'workspaceOwners', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.WORKSPACE_OWNERS') },
        { name: 'projectMember', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.PROJECT_MEMBER') },
        { name: 'serviceAccountManagers', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SERVICE_ACCOUNT_MANAGERS') },
        { name: 'others', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.OTHERS') },
    ],
    excludedSelectedIds: computed(() => {
        if (userReferenceItems.value && budgetCreatePageState.selectedBudgetManagerList.includes('workspaceOwners')) {
            const workspaceOwnerIds = Object.values(userReferenceItems.value)
                .filter((user) => user.data.roleInfo?.role_type === ROLE_TYPE.WORKSPACE_OWNER).map((user) => user.key);
            return [...workspaceOwnerIds, ...props.serviceAccountList];
        }
        return [];
    }),
});
watch(() => budgetCreatePageState.selectedBudgetManagerList, () => {
    budgetCreatePageStore.$patch((_state) => {
        if (budgetCreatePageState.selectedBudgetManagerList.includes('workspaceOwners')) {
            _state.state.recipients.role_types.push(ROLE_TYPE.WORKSPACE_OWNER);
        } if (budgetCreatePageState.selectedBudgetManagerList.includes('projectMember')
        || budgetCreatePageState.selectedBudgetManagerList.includes('serviceAccountManagers')
        || budgetCreatePageState.selectedBudgetManagerList.includes('others')) {
            _state.state.recipients.role_types.push(ROLE_TYPE.WORKSPACE_MEMBER);
        } if (!budgetCreatePageState.selectedBudgetManagerList.includes('workspaceOwners')) {
            _state.state.recipients.role_types = _state.state.recipients.role_types.filter((role_type) => role_type !== ROLE_TYPE.WORKSPACE_OWNER);
        } if (!budgetCreatePageState.selectedBudgetManagerList.includes('projectMember')
        && !budgetCreatePageState.selectedBudgetManagerList.includes('serviceAccountManagers')
        && !budgetCreatePageState.selectedBudgetManagerList.includes('others')) {
            _state.state.recipients.role_types = _state.state.recipients.role_types.filter((role_type) => role_type !== ROLE_TYPE.WORKSPACE_MEMBER);
        }
        _state.state.recipients.role_types = [...new Set(_state.state.recipients.role_types)];
    });
}, { deep: true, immediate: true });

watch([() => props.serviceAccountList, () => budgetCreatePageState.selectedBudgetManagerList], () => {
    budgetCreatePageState.recipients.service_account_manager = props.serviceAccountList;
});

const handleUpdateSelectedIds = (selectedIds: string[]) => {
    budgetCreatePageState.recipients.users = selectedIds;
};
</script>

<template>
    <p-field-group required
                   :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.BUDGET_MANAGER')"
                   :help-text="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.BUDGET_MANAGER_DESCRIPTION')"
    >
        <p-checkbox-group direction="vertical">
            <p-checkbox v-for="(budgetManager, idx) in state.budgetManagerList"
                        :key="`budget-manager-${idx}`"
                        v-model="budgetCreatePageState.selectedBudgetManagerList"
                        :value="budgetManager.name"
                        :disabled="(budgetCreatePageState.scope.type === 'serviceAccount'
                            && (budgetManager.name === 'projectMember' || budgetManager.name === 'serviceAccountManagers'))"
            >
                <span>{{ budgetManager.label }}</span>
                <p-popover>
                    <template #content>
                        <p class="flex flex-col gap-2">
                            <span v-for="(serviceAccount, i) in props.serviceAccountList"
                                  :key="`service-account-${i}`"
                            >
                                {{ serviceAccount }}
                            </span>
                        </p>
                    </template>
                    <p-button v-if="budgetManager.name === 'serviceAccountManagers'"
                              highlight
                              class="ml-2"
                              size="sm"
                              style-type="tertiary"
                              :disabled="(budgetCreatePageState.scope.type === 'serviceAccount') || props.serviceAccountList.length === 0"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SHOW_THE_LIST') }}
                    </p-button>
                </p-popover>
            </p-checkbox>
            <user-select-dropdown v-if="budgetCreatePageState.selectedBudgetManagerList.includes('others')"
                                  :excluded-selected-ids="state.excludedSelectedIds"
                                  selection-type="multiple"
                                  appearance-type="badge"
                                  @update:selected-ids="handleUpdateSelectedIds"
            />
        </p-checkbox-group>
    </p-field-group>
</template>

<style scoped lang="postcss">
.user-select-dropdown {
    width: 20em;
}
</style>
