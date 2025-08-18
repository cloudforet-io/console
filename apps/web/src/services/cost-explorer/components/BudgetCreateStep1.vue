<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PFieldGroup, PTextInput, PButton,
    PSelectDropdown,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import BudgetCreateManagerSelect from '@/services/cost-explorer/components/BudgetCreateManagerSelect.vue';
import BudgetCreateScopeSelect from '@/services/cost-explorer/components/BudgetCreateScopeSelect.vue';
import { useBudgetQuery } from '@/services/cost-explorer/composables/use-budget-query';
import { useBudgetCreatePageStore } from '@/services/cost-explorer/stores/budget-create-page-store';



const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;
const allReferenceStore = useAllReferenceStore();

interface BudgetCreateStep1State {
    scope: Record<string, any>;
    isContinueAble: boolean;
    name: string;
    projectList: any[];
    selectedProject: ComputedRef<string>;
    budgetNames: ComputedRef<string[]>;
    existingProjectIds: ComputedRef<string[]>;
    existingBudgetYears: number[];
    projectInvalidText: ComputedRef<string|TranslateResult>;
    projectInvalid: ComputedRef<boolean>;
}

const { budgetList } = useBudgetQuery();

const project = computed<ProjectReferenceMap>(() => allReferenceStore.getters.project);

const state = reactive<BudgetCreateStep1State>({
    scope: {},
    isContinueAble: false,
    name: '',
    projectList: [],
    selectedProject: computed(() => budgetCreatePageState.project),
    budgetNames: computed(() => budgetList.value?.map((result) => result.name) ?? []),
    existingProjectIds: computed(() => budgetList.value?.map((result) => result.project_id) ?? []),
    existingBudgetYears: [],
    projectInvalidText: computed<string|TranslateResult>(() => {
        if (budgetCreatePageState.scope.type === 'project'
        && state.existingProjectIds.includes(budgetCreatePageState.project)) return i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.PROJECT_VALIDATION');
        return '';
    }),
    projectInvalid: computed(() => !state.existingProjectIds.includes(budgetCreatePageState.project) && budgetCreatePageState.project.length > 0),
});

const emit = defineEmits<{(e: 'click-next'): void, (e: 'click-cancel'): void }>();

const handleUpdateName = (value: string) => {
    budgetCreatePageStore.setName(value);
};

const handleNext = () => {
    emit('click-next');
};

const handleCancel = () => {
    emit('click-cancel');
};

const handleUpdateProject = (value: string) => {
    budgetCreatePageStore.setProject(value);
};

watch(() => budgetCreatePageState, () => {
    if (budgetCreatePageState.name && budgetCreatePageState.project && budgetCreatePageState.scope.type === 'project'
    && budgetCreatePageState.name.length > 0 && !state.budgetNames.includes(budgetCreatePageState.name)) {
        state.isContinueAble = true;
    } else if (budgetCreatePageState.name && budgetCreatePageState.project && budgetCreatePageState.scope.type === 'serviceAccount'
    && budgetCreatePageState.scope.serviceAccount && budgetCreatePageState.scope.serviceAccount.length > 0
    && budgetCreatePageState.name.length > 0 && !state.budgetNames.includes(budgetCreatePageState.name)
    ) {
        state.isContinueAble = true;
    } else {
        state.isContinueAble = false;
    }
}, { deep: true, immediate: true });

watch(() => project, () => {
    state.projectList = Object.values(project.value).map((pj) => ({
        name: pj.key,
        label: pj.label,
    }));
}, { deep: true, immediate: true });
</script>

<template>
    <div class="flex flex-col">
        <div class="contents-container">
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_NAME')"
                           :invalid="budgetCreatePageState.name.length < 0 || state.budgetNames.includes(budgetCreatePageState.name)"
                           :invalid-text="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.NAME_INVALID_TEXT')"
                           required
            >
                <p-text-input block
                              :invalid="budgetCreatePageState.name.length < 0 || state.budgetNames.includes(budgetCreatePageState.name)"
                              :value="budgetCreatePageState.name"
                              @update:value="handleUpdateName"
                />
            </p-field-group>
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.PROJECT')"
                           required
            >
                <p-select-dropdown
                    :menu="state.projectList"
                    :selected.sync="state.selectedProject"
                    appearance-type="badge"
                    use-fixed-menu-style
                    show-select-marker
                    is-filterable
                    show-clear-selection
                    :page-size="15"
                    class="filterable-select-dropdown"
                    @update:selected="handleUpdateProject"
                />
            </p-field-group>
            <budget-create-scope-select />
            <budget-create-manager-select />
        </div>
        <div class="mt-8 flex justify-end gap-4">
            <p-button style-type="transparent"
                      @click="handleCancel"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.CANCEL') }}
            </p-button>
            <p-button icon-right="ic_arrow-right"
                      :disabled="!state.isContinueAble"
                      style-type="substitutive"
                      @click="handleNext"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.CONTINUE') }}
            </p-button>
        </div>
    </div>
</template>
