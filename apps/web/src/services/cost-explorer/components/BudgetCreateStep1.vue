<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, reactive, watch, watchEffect,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PTextInput, PButton,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { BudgetListParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/list';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import type { ServiceAccountListParameters } from '@/api-clients/identity/service-account/schema/api-verbs/list';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import BudgetCreateManagerSelect from '@/services/cost-explorer/components/BudgetCreateManagerSelect.vue';
import BudgetCreateScopeSelect from '@/services/cost-explorer/components/BudgetCreateScopeSelect.vue';
import { useBudgetCreatePageStore } from '@/services/cost-explorer/stores/budget-create-page-store';


const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;
const allReferenceStore = useAllReferenceStore();

interface BudgetCreateStep1State {
    scope: Record<string, any>;
    isContinueAble: boolean;
    name: string;
    projectList: any[];
    selectedProject: string;
    serviceAccountList: string[];
    budgetList: BudgetModel[];
    budgetNames: string[];
    existingProjectIds: string[];
    existingBudgetYears: number[];
    projectInvalidText: ComputedRef<string|TranslateResult>;
    projectInvalid: ComputedRef<boolean>;
}

const project = computed<ProjectReferenceMap>(() => allReferenceStore.getters.project);

const state = reactive<BudgetCreateStep1State>({
    scope: {},
    isContinueAble: false,
    name: '',
    projectList: [],
    selectedProject: '',
    serviceAccountList: [],
    budgetList: [],
    budgetNames: [],
    existingProjectIds: [],
    existingBudgetYears: [],
    projectInvalidText: computed<string|TranslateResult>(() => {
        if (budgetCreatePageState.scope.type === 'project'
        && state.existingProjectIds.includes(budgetCreatePageState.project)) return i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.PROJECT_VALIDATION');
        return '';
    }),
    projectInvalid: computed(() => !state.existingProjectIds.includes(budgetCreatePageState.project) && budgetCreatePageState.project.length > 0),
});

const emit = defineEmits<{(e: 'click-next'): void, (e: 'click-cancel'): void }>();


watch(() => budgetCreatePageState, () => {
    if (budgetCreatePageState.name && budgetCreatePageState.project && budgetCreatePageState.scope.type === 'project') {
        state.isContinueAble = true;
    } else if (budgetCreatePageState.name && budgetCreatePageState.project && budgetCreatePageState.scope.type === 'serviceAccount'
    && budgetCreatePageState.scope.serviceAccount && budgetCreatePageState.scope.serviceAccount.length > 0
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

const handleUpdateName = (value: string) => {
    budgetCreatePageStore.setName(value);
};

const handleProjectId = (projectIds: string[]) => {
    budgetCreatePageStore.setProject(projectIds[0]);
};

const handleNext = () => {
    emit('click-next');
};

const handleCancel = () => {
    emit('click-cancel');
};

const getServiceAccountIncludedinProjectInfo = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.identity.serviceAccount.list<ServiceAccountListParameters, ListResponse<ServiceAccountModel>>({
            query: {
                filter: [
                    {
                        k: 'project_id',
                        v: budgetCreatePageState.project,
                        o: 'eq',
                    },
                    {
                        k: 'service_account_mgr_id',
                        v: '',
                        o: 'not',
                    },
                ],
            },
        });
        state.serviceAccountList = results?.filter((result: any) => result.service_account_mgr_id)
            .map((info:any) => info.service_account_mgr_id) ?? [];
    } catch (error) {
        ErrorHandler.handleError(error);
    }
};

const fetchBudget = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.costAnalysis.budget.list<BudgetListParameters, ListResponse<BudgetModel>>();
        state.budgetList = results;
        state.budgetNames = results?.map((result) => result.name) ?? [];
        state.existingProjectIds = results?.map((result) => result.project_id) ?? [];
    } catch (error) {
        ErrorHandler.handleError(error);
    }
};

watch(() => budgetCreatePageState.project, async () => {
    await getServiceAccountIncludedinProjectInfo();
}, { deep: true, immediate: true });

watchEffect(async () => {
    await fetchBudget();
});
</script>

<template>
    <div class="flex flex-col">
        <div class="contents-container">
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_NAME')"
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
                <!-- :invalid="!state.projectInvalid"
                           :invalid-text="state.projectInvalidText" -->
                <project-select-dropdown
                    show-delete-all-button
                    :project-group-selectable="false"
                    :selected-project-ids="budgetCreatePageState.project ? [budgetCreatePageState.project] : []"
                    hide-create-button
                    @update:selected-project-ids="handleProjectId"
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
                      @click="handleNext"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.CONTINUE') }}
            </p-button>
        </div>
    </div>
</template>
