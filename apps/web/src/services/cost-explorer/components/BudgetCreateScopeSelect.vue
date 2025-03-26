<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PFieldGroup, PSelectDropdown, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { useBudgetCreatePageStore } from '../stores/budget-create-page-store';

const allReferenceStore = useAllReferenceStore();
const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;

const serviceAccount = computed(() => allReferenceStore.getters.serviceAccount);

const state = reactive({
    isSelectable: false,
    scopeList: [
        { name: 'project', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.PROJECT') },
        { name: 'serviceAccount', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SERVICE_ACCOUNT') },
    ],
    selectedScope: 0,
    serviceAccountList: computed(() => Object.values(serviceAccount.value)),
    refinedServiceAccountList: computed(() => state.serviceAccountList.map((service_account) => ({
        name: service_account.key,
        label: service_account.name,
    }))),
    selectedServiceAccount: '',
});

watch(() => budgetCreatePageState.scope, () => {
    state.isSelectable = budgetCreatePageState.scope.type === 1;
    if (budgetCreatePageState.scope.type === 0) {
        budgetCreatePageState.scope.serviceAccount = '';
    }
}, { deep: true, immediate: true });

// watch([() => state.selectedScope, () => state.selectedServiceAccount], () => {
//     budgetCreatePageStore.$patch((_state) => {
//         _state.state.scope.type = state.selectedScope;
//         _state.state.scope.serviceAccount = state.selectedServiceAccount;
//     });
// }, { immediate: true });
</script>

<template>
    <p-field-group required
                   :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.SCOPE')"
    >
        <p-radio-group>
            <p-radio v-for="(scope, idx) in state.scopeList"
                     :key="`budget-scope-${idx}`"
                     v-model="budgetCreatePageState.scope.type"
                     :value="idx"
                     class="mb-1"
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
