<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import dayjs from 'dayjs';

import { PSelectDropdown, PI } from '@cloudforet/mirinae';
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

const emit = defineEmits<{(e: 'update:select-month-modal-visible', value: boolean): void; (e: 'update:query', value: any): void;}>();

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

interface BudgetMainToolsetState {
  yearList: SelectDropdownMenuItem[];
  selectedYear: string;
  budgetCycleList: SelectDropdownMenuItem[];
  selectedBudgetCycle: string;
  projectList: SelectDropdownMenuItem[];
  selectedProjectList: SelectDropdownMenuItem[];
  serviceAccountList: SelectDropdownMenuItem[];
  selectedServiceAccountList: SelectDropdownMenuItem[];
  utilizationList: SelectDropdownMenuItem[];
  selectedUtilization: string;
}

const storeState = reactive({
    serviceAccount: computed(() => allReferenceGetters.serviceAccount),
    project: computed<ProjectReferenceMap>(() => allReferenceGetters.project),
});

const state = reactive<BudgetMainToolsetState>({
    yearList: [
        { name: 'nextYear', label: dayjs.utc().add(1, 'year').format('YYYY') },
        { name: 'thisYear', label: dayjs.utc().format('YYYY') },
        { name: 'lastYear', label: dayjs.utc().subtract(1, 'year').format('YYYY') },
    ],
    selectedYear: '',
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
    utilizationList: [
        { name: 'all', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.ALL') },
        { name: 'divider', type: 'divider' },
        { name: 'budgetExceeded', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_EXCEEDED') },
        { name: 'overNintyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_SPENT_USAGE', { percent: 90 }) },
        { name: 'overEightyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_SPENT_USAGE', { percent: 80 }) },
        { name: 'overSeventyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_SPENT_USAGE', { percent: 70 }) },
        { name: 'overSixtyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_SPENT_USAGE', { percent: 60 }) },
        { name: 'overFiftyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_SPENT_USAGE', { percent: 50 }) },
        { name: 'overFourtyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_SPENT_USAGE', { percent: 40 }) },
        { name: 'overThirtyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_SPENT_USAGE', { percent: 30 }) },
        { name: 'overTwentyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_SPENT_USAGE', { percent: 20 }) },
        { name: 'overTenPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_SPENT_USAGE', { percent: 10 }) },
    ],
    selectedUtilization: 'all',
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

watch(() => props.modalVisible, () => {
    if (!props.modalVisible) {
        state.selectedYear = '';
    }
}, { immediate: true });

watch(() => state, () => {
    emit('update:query', {
        year: state.selectedYear,
        projectList: state.selectedProjectList,
        serviceAccountList: state.selectedServiceAccountList.map((serviceAccount) => serviceAccount.name),
        cycle: state.selectedBudgetCycle,
        utilization: state.selectedUtilization,
    });
}, { deep: true, immediate: true });

const handleProjectList = (projectIds) => {
    state.selectedProjectList = projectIds;
};
</script>

<template>
    <div class="mt-3 flex gap-2 items-center">
        <p-select-dropdown style-type="rounded"
                           :menu="state.yearList"
                           :selected.sync="state.selectedYear"
                           selection-label="Year"
        />
        <project-select-dropdown style-type="rounded"
                                 appearance-type="badge"
                                 selection-label="Project"
                                 :project-group-selectable="false"
                                 multi-selectable
                                 show-dropdown-left-area
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
        >
            <template #dropdown-left-area>
                <p-i name="ic_service_service-account"
                     width="1rem"
                     height="1rem"
                />
            </template>
        </p-select-dropdown>
        <p-select-dropdown style-type="rounded"
                           :menu="state.budgetCycleList"
                           :selected.sync="state.selectedBudgetCycle"
                           selection-label="Cycle"
        />
        <p-select-dropdown style-type="rounded"
                           selection-label="Utilization"
                           :menu="state.utilizationList"
                           :selected.sync="state.selectedUtilization"
                           :page-size="12"
        />
    </div>
</template>
