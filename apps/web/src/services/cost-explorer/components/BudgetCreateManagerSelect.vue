<script setup lang="ts">
import { reactive, watch } from 'vue';

import {
    PFieldGroup, PCheckboxGroup, PCheckbox, PSelectDropdown, PLink,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useBudgetCreatePageStore } from '../stores/budget-create-page-store';

interface BudgetCreateManagerSelectState {
    budgetManagerList: SelectDropdownMenuItem[];
    selectedBudgetManagerList: string[];
}

interface Props {
    scope: string;
}

const props = withDefaults(defineProps<Props>(), {
    scope: '',
});

const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;

const state = reactive<BudgetCreateManagerSelectState>({
    budgetManagerList: [
        { name: 'workspaceOwners', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.WORKSPACE_OWNERS') },
        { name: 'projectMember', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.PROJECT_MEMBER') },
        { name: 'serviceAccountManagers', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SERVICE_ACCOUNT_MANAGERS') },
        { name: 'others', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.OTHERS') },
    ],
    selectedBudgetManagerList: [],
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
        // _state.state.selectedBudgetManagerList = state.selectedBudgetManagerList;
    });
}, { deep: true, immediate: true });

// watch(() => budgetCreatePageState.recipients, () => {

// })

// watch(() => budgetCreatePageState.selectedBudgetManagerList, () => {
//     state.selectedBudgetManagerList = budgetCreatePageState.selectedBudgetManagerList;
// }, { deep: true, immediate: true });
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
                        :disabled="(props.scope === 'serviceAccount' && (budgetManager.name === 'projectMember' || budgetManager.name === 'serviceAccountManagers'))"
            >
                <span>{{ budgetManager.label }}</span>
                <p-link v-if="budgetManager.name === 'serviceAccountManagers'"
                        highlight
                        class="ml-2"
                        :disabled="(props.scope === 'serviceAccount')"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SHOW_THE_LIST') }}
                </p-link>
                <p-select-dropdown v-if="budgetManager.name === 'others'"
                                   size="sm"
                                   class="ml-2"
                />
            </p-checkbox>
        </p-checkbox-group>
    </p-field-group>
</template>
