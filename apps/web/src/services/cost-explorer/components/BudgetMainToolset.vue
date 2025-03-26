<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { PSelectDropdown, PCheckbox } from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

interface Props {
  modalVisible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modalVisible: false,
});

const emit = defineEmits<{(e: 'update:select-month-modal-visible', value: boolean): void; (e: 'update:query', value: any): void}>();

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

interface BudgetMainToolsetState {
  periodList: SelectDropdownMenuItem[];
  selectedPeriod: string;
  budgetCycleList: SelectDropdownMenuItem[];
  selectedBudgetCycle: string;
  projectList: SelectDropdownMenuItem[];
  selectedProjectList: SelectDropdownMenuItem[];
  serviceAccountList: SelectDropdownMenuItem[];
  selectedServiceAccountList: SelectDropdownMenuItem[];
  budgetUsedList: SelectDropdownMenuItem[];
  selectedBudgetUsed: string;
  isExpiredBudgetsHidden?: boolean;
}

const storeState = reactive({
    serviceAccount: computed(() => allReferenceGetters.serviceAccount),
    project: computed<ProjectReferenceMap>(() => allReferenceGetters.project),
});

const state = reactive<BudgetMainToolsetState>({
    periodList: [
        { name: 'this_month', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.THIS_MONTH') },
        { name: 'last_month', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.LAST_MONTH') },
        { name: 'last_three_months', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.LAST_3_MONTHS') },
        { name: 'last_six_months', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.LAST_6_MONTHS') },
        { name: 'last_twelve_months', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.LAST_12_MONTHS') },
        { name: 'this_year', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.THIS_YEAR') },
        { name: 'last_year', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.LAST_YEAR') },
        { type: 'divider', name: 'divider' },
        { name: 'custom', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.CUSTOM') },
    ],
    selectedPeriod: '',
    budgetCycleList: [
        { name: 'all', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.ALL') },
        { name: 'monthly', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.MONTHLY') },
        { name: 'fixedTerm', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.FIXED_TERM') },
    ],
    selectedBudgetCycle: 'all',
    projectList: [{
        type: 'item', name: 'all', label: 'All',
    }, {
        type: 'divider', name: 'divider',
    }],
    selectedProjectList: [],
    serviceAccountList: [{
        type: 'item', name: 'all', label: 'All',
    }, {
        type: 'divider', name: 'divider',
    }],
    selectedServiceAccountList: [],
    budgetUsedList: [
        { name: 'all', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.ALL') },
        { name: 'budgetExceeded', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_EXCEEDED') },
        { name: 'overNintyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.OVER_NINTY_PERCENT_SPENT') },
        { name: 'overEightyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.OVER_EIGHTY_PERCENT_SPENT') },
        { name: 'overSeventyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.OVER_SEVENTY_PERCENT_SPENT') },
        { name: 'overSixtyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.OVER_SIXTY_PERCENT_SPENT') },
        { name: 'overFiftyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.OVER_FIFTY_PERCENT_SPENT') },
        { name: 'overFourtyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.OVER_FOURTY_PERCENT_SPENT') },
        { name: 'overThirtyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.OVER_THIRTY_PERCENT_SPENT') },
        { name: 'overTwentyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.OVER_TWENTY_PERCENT_SPENT') },
        { name: 'overTenPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.OVER_TEN_PERCENT_SPENT') },
    ],
    selectedBudgetUsed: 'all',
    isExpiredBudgetsHidden: false,
});

watch(() => storeState.serviceAccount, () => {
    state.serviceAccountList = [...state.serviceAccountList, ...Object.values(storeState.serviceAccount).map((serviceAccount: any, idx: number) => ({
        name: Object.keys(storeState.serviceAccount)[idx],
        label: serviceAccount.label,
    }))];
}, { deep: true, immediate: true });

watch(() => storeState.project, () => {
    state.projectList = [...state.projectList, ...Object.values(storeState.project).map((project, idx) => ({
        name: Object.keys(storeState.project)[idx],
        label: project.label,
    }))];
}, { deep: true, immediate: true });

watch(() => state.selectedProjectList, () => {
    if (state.selectedProjectList.map((project: any) => project.name).includes('all')) {
        state.selectedProjectList = state.projectList.slice(2, state.projectList.length);
    }
}, { deep: true, immediate: true });

watch(() => state.selectedServiceAccountList, () => {
    if (state.selectedServiceAccountList.map((serviceAccount: any) => serviceAccount.name).includes('all')) {
        state.selectedServiceAccountList = state.serviceAccountList.slice(2, state.serviceAccountList.length);
    }
}, { deep: true, immediate: true });

watch(() => state.selectedPeriod, () => {
    if (state.selectedPeriod === 'custom') {
        emit('update:select-month-modal-visible', true);
    }
}, { immediate: true });

watch(() => props.modalVisible, () => {
    if (!props.modalVisible) {
        state.selectedPeriod = '';
    }
}, { immediate: true });

watch(() => state, () => {
    emit('update:query', {
        period: state.selectedPeriod,
        cycle: state.selectedBudgetCycle,
        projectList: state.selectedProjectList,
        serviceAccountList: state.selectedServiceAccountList.map((serviceAccount) => serviceAccount.name),
        budgetUsed: state.selectedBudgetUsed,
    });
}, { deep: true, immediate: true });

const handleProjectList = (projectIds) => {
    state.selectedProjectList = projectIds;
};
</script>

<template>
    <div class="mt-3 flex gap-2 items-center">
        <p-select-dropdown style-type="rounded"
                           :menu="state.periodList"
                           :selected.sync="state.selectedPeriod"
                           selection-label="Period"
        />
        <p-select-dropdown style-type="rounded"
                           :menu="state.budgetCycleList"
                           :selected.sync="state.selectedBudgetCycle"
                           selection-label="Cycle"
        />
        <project-select-dropdown style-type="rounded"
                                 appearance-type="badge"
                                 selection-label="Project"
                                 multi-selectable
                                 @update:selected-project-ids="handleProjectList"
        />
        <p-select-dropdown style-type="rounded"
                           :menu="state.serviceAccountList"
                           :selected.sync="state.selectedServiceAccountList"
                           selection-label="Service Account"
                           appearance-type="badge"
                           use-fixed-menu-style
                           show-select-marker
                           multi-selectable
                           show-clear-selection
                           selection-highlight
                           :page-size="15"
        />
        <p-select-dropdown style-type="rounded"
                           selection-label="Budget Used %"
                           :menu="state.budgetUsedList"
                           :selected.sync="state.selectedBudgetUsed"
                           :page-size="11"
        />
        <p-checkbox v-model="state.isExpiredBudgetsHidden">
            Hide EXPIRED Budgets
        </p-checkbox>
    </div>
</template>
