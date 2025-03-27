<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PFieldGroup, PTextInput, PButton,
} from '@cloudforet/mirinae';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { useBudgetCreatePageStore } from '../stores/budget-create-page-store';
import BudgetCreateManagerSelect from './BudgetCreateManagerSelect.vue';
import BudgetCreateScopeSelect from './BudgetCreateScopeSelect.vue';


const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;
const allReferenceStore = useAllReferenceStore();

interface BudgetCreateStep1State {
    projectId: string;
    scope: Record<string, any>;
    isContinueAble: boolean;
    name: string;
    projectList: any[];
    selectedProject: string;
}

const project = computed<ProjectReferenceMap>(() => allReferenceStore.getters.project);

const state = reactive<BudgetCreateStep1State>({
    projectId: '',
    scope: {},
    isContinueAble: false,
    name: '',
    projectList: [],
    selectedProject: '',
});

const emit = defineEmits<{(e: 'click-next'): void }>();

watch(() => state.name, () => {
    // console.log(state.name);
    // budgetCreatePageStore.setName(state.name);
}, { deep: true, immediate: true });

watch(() => budgetCreatePageState, () => {
    if (budgetCreatePageState.name && budgetCreatePageState.project && budgetCreatePageState.scope.type === 0
    && budgetCreatePageState.recipients.role_types.length > 0) {
        state.isContinueAble = true;
    } else if (budgetCreatePageState.name && budgetCreatePageState.project && budgetCreatePageState.scope.type === 1
        && budgetCreatePageState.scope.serviceAccount.length > 0 && budgetCreatePageState.recipients.role_types.length > 0
    ) {
        state.isContinueAble = true;
    } else {
        state.isContinueAble = false;
    }
    if (budgetCreatePageState.project.length > 0) {
        // state.selectedProject = budgetCreatePageState.project;
    }
}, { deep: true, immediate: true });

watch(() => project, () => {
    state.projectList = Object.values(project.value).map((pj) => ({
        name: pj.key,
        label: pj.label,
    }));
}, { deep: true, immediate: true });


const handleUpdateName = (value: string) => {
    budgetCreatePageStore.setName(value);
};

const handleProjectId = (projectIds: string[]) => {
    budgetCreatePageStore.setProject(projectIds[0]);
};

const handleNext = () => {
    emit('click-next');
};
</script>

<template>
    <div class="flex flex-col">
        <div class="contents-container">
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_NAME')"
                           required
            >
                <p-text-input block
                              :value="budgetCreatePageState.name"
                              @update:value="handleUpdateName"
                />
            </p-field-group>
            <p-field-group label="Project"
                           required
            >
                <project-select-dropdown
                    show-delete-all-button
                    @update:selected-project-ids="handleProjectId"
                />
            </p-field-group>
            <budget-create-scope-select :project-id="state.projectId"
                                        @update:scope="handleUpdateScope"
            />
            <budget-create-manager-select :scope="state.scope" />
        </div>
        <div class="mt-8 flex justify-end gap-4">
            <p-button style-type="transparent">
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.CANCEL') }}
            </p-button>
            <p-button icon-right="ic_arrow-right"
                      :disabled="!state.isContinueAble"
                      @click="handleNext"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.CONTINUE') }}
            </p-button>
        </div>
    </div>
</template>
