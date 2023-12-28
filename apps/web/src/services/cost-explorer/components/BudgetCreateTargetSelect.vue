<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { PFieldGroup, PSelectDropdown } from '@spaceone/design-system';
import type {
    AutocompleteHandler, SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import { debounce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';


const emit = defineEmits<{(e: 'update', target: string, isValid: boolean): void; }>();

const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();
const storeState = reactive({
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    loading: false,
    selectedWorkspaceItems: [] as SelectDropdownMenuItem[],
    targetHasDataSource: computed<boolean>(() => {
        const selectedWorkspaceId = state.selectedWorkspaceItems[0]?.name;
        if (!selectedWorkspaceId) return false;
        const costDataSourceList = Object.entries(storeState.costDataSource).filter(([, v]) => [selectedWorkspaceId, '*'].includes(v.data.workspace_id));
        return costDataSourceList.length > 0;
    }),
});
const {
    forms: {
        selectedTargets,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
    validate,
} = useFormValidator({
    selectedTargets: [] as string[],
}, {
    selectedTargets(value: string[]) {
        if (storeState.isAdminMode && value.length && !state.targetHasDataSource) return i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.NO_DATA_SOURCE');
        return value.length ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REQUIRED_TARGET');
    },
});

/* Util */
const workspaceHandler: AutocompleteHandler = async (keyword: string) => {
    try {
        state.loading = true;
        const { results, total_count } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
            query: {
                keyword,
            },
        });
        return {
            results: results?.map((d) => ({ name: d.workspace_id, label: d.name })) ?? [],
            totalCount: total_count ?? 0,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            results: [],
            totalCount: 0,
        };
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleSelectWorkspace = (selected: SelectDropdownMenuItem[]) => {
    state.selectedWorkspaceItems = selected;
    setForm('selectedTargets', selected.map((d) => d.name));
};

watch([() => selectedTargets.value, () => isAllValid.value], debounce(([targets, isValid]) => {
    const target: string = targets[0];
    emit('update', target, isValid);
}, 300) as any, { immediate: true });
</script>

<template>
    <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_TARGET')"
                   :invalid="invalidState.selectedTargets"
                   :invalid-text="invalidTexts.selectedTargets"
                   required
                   class="budget-create-target-select"
    >
        <template #default="{ invalid }">
            <p-select-dropdown v-if="storeState.isAdminMode"
                               is-filterable
                               :handler="workspaceHandler"
                               :selected="state.selectedWorkspaceItems"
                               :loading="state.loading"
                               :invalid="invalid"
                               show-select-marker
                               use-fixed-menu-style
                               :page-size="10"
                               @update:selected="handleSelectWorkspace"
            />
            <project-select-dropdown v-else
                                     :selected-project-ids="selectedTargets"
                                     :invalid="invalidState.selectedTargets"
                                     project-selectable
                                     :project-group-selectable="false"
                                     @update:selected-project-ids="setForm('selectedTargets', $event)"
                                     @close="validate('selectedTargets')"
            />
        </template>
    </p-field-group>
</template>

<style lang="postcss" scoped>
.budget-create-target-select {
    width: 30rem;
}

@screen mobile {
    .budget-create-target-select {
        width: 100%;
    }
}
</style>
