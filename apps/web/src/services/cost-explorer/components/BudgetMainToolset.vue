<script lang="ts" setup>
import type { ComputedRef } from 'vue';
import {
    computed, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import { PSelectDropdown, PI, PDivider } from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';


const emit = defineEmits<{(e: 'update:select-month-modal-visible', value: boolean): void; (e: 'update:query', value: any): void;}>();

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const appContextStore = useAppContextStore();

interface BudgetMainToolsetState {
    targetList: SelectDropdownMenuItem[];
    selectedTarget: string;
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
    workspaceList: ComputedRef<SelectDropdownMenuItem[]>;
    selectedWorkspaceList: SelectDropdownMenuItem[];
}

const storeState = reactive({
    serviceAccount: computed(() => allReferenceGetters.serviceAccount),
    project: computed<ProjectReferenceMap>(() => allReferenceGetters.project),
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
    workspace: computed(() => allReferenceGetters.workspace),
});

const state = reactive<BudgetMainToolsetState>({
    targetList: [
        { name: 'all', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.ALL') },
        { name: 'project', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.PROJECT') },
        { name: 'serviceAccount', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.SERVICE_ACCOUNT') },
    ],
    selectedTarget: 'all',
    yearList: [
        { name: 'all', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.ALL') },
        { type: 'divider', name: 'divider' },
        { name: dayjs.utc().add(1, 'year').format('YYYY'), label: dayjs.utc().add(1, 'year').format('YYYY') },
        { name: dayjs.utc().format('YYYY'), label: dayjs.utc().format('YYYY') },
        { name: dayjs.utc().subtract(1, 'year').format('YYYY'), label: dayjs.utc().subtract(1, 'year').format('YYYY') },
    ],
    selectedYear: 'all',
    budgetCycleList: [
        { name: 'all', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.ALL') },
        { type: 'divider', name: 'divider' },
        { name: 'monthly', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.MONTHLY') },
        { name: 'fixedTerm', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.FIXED_TERM') },
    ],
    selectedBudgetCycle: 'all',
    projectList: [],
    selectedProjectList: [],
    serviceAccountList: [],
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
        { name: 'overFortyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_SPENT_USAGE', { percent: 40 }) },
        { name: 'overThirtyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_SPENT_USAGE', { percent: 30 }) },
        { name: 'overTwentyPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_SPENT_USAGE', { percent: 20 }) },
        { name: 'overTenPercentSpent', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.BUDGET_SPENT_USAGE', { percent: 10 }) },
    ],
    selectedUtilization: 'all',
    workspaceList: computed(() => Object.values(storeState.workspace).map((c: any) => ({
        name: c.key,
        label: c.label,
    }))),
    selectedWorkspaceList: [],
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

watch(() => state, () => {
    emit('update:query', {
        target: state.selectedTarget,
        workspaceList: state.selectedWorkspaceList.map((w) => w.name) ?? [],
        projectList: state.selectedProjectList.map((p) => p.name) ?? [],
        serviceAccountList: state.selectedServiceAccountList.map((s) => s.name),
        year: state.selectedYear,
        cycle: state.selectedBudgetCycle,
        utilization: state.selectedUtilization,
    });
}, { deep: true, immediate: true });

</script>

<template>
    <div class="budget-main-toolset">
        <p-select-dropdown selection-label="Target"
                           style-type="rounded"
                           :menu="state.targetList"
                           :selected.sync="state.selectedTarget"
        />
        <div class="flex gap-1 items-center">
            <p-i name="ic_filter"
                 width="14"
                 height="14"
            />
            <span class="font-bold text-sm">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.FILTER') }}:</span>
        </div>
        <p-select-dropdown v-if="storeState.isAdminMode"
                           selection-label="Workspace"
                           style-type="rounded"
                           show-select-marker
                           multi-selectable
                           show-clear-selection
                           appearance-type="badge"
                           is-filterable
                           selection-highlight
                           :menu="state.workspaceList"
                           :selected.sync="state.selectedWorkspaceList"
                           class="filterable-select-dropdown"
        />
        <p-select-dropdown style-type="rounded"
                           :menu="state.projectList"
                           :selected.sync="state.selectedProjectList"
                           selection-label="Project"
                           appearance-type="badge"
                           use-fixed-menu-style
                           show-select-marker
                           is-filterable
                           multi-selectable
                           show-clear-selection
                           show-delete-all-button
                           selection-highlight
                           :page-size="15"
                           class="filterable-select-dropdown"
        >
            <template #dropdown-left-area>
                <p-i name="ic_project"
                     width="1rem"
                     height="1rem"
                />
            </template>
        </p-select-dropdown>
        <p-select-dropdown style-type="rounded"
                           :menu="state.serviceAccountList"
                           :selected.sync="state.selectedServiceAccountList"
                           :disabled="state.selectedTarget === 'project'"
                           selection-label="Service Account"
                           appearance-type="badge"
                           use-fixed-menu-style
                           show-select-marker
                           is-filterable
                           multi-selectable
                           show-clear-selection
                           show-delete-all-button
                           selection-highlight
                           :page-size="15"
                           class="filterable-select-dropdown"
        >
            <template #dropdown-left-area>
                <p-i name="ic_service_service-account"
                     width="1rem"
                     height="1rem"
                />
            </template>
        </p-select-dropdown>
        <p-divider
            class="divider"
        />
        <p-select-dropdown style-type="rounded"
                           :menu="state.budgetCycleList"
                           :selected.sync="state.selectedBudgetCycle"
                           selection-label="Cycle"
        />
        <p-select-dropdown style-type="rounded"
                           :menu="state.yearList"
                           :selected.sync="state.selectedYear"
                           selection-label="Period (Year)"
        />
        <p-select-dropdown style-type="rounded"
                           selection-label="Utilization"
                           :menu="state.utilizationList"
                           :selected.sync="state.selectedUtilization"
                           :page-size="12"
        />
    </div>
</template>

<style scoped lang="postcss">
.budget-main-toolset {
    @apply mt-3 flex items-center gap-2;

    .p-select-dropdown {
        min-width: unset;
    }
}

.filterable-select-dropdown {
    width: initial;
}

.divider {
    height: 1rem;
    width: 0.0625rem;
}
</style>
