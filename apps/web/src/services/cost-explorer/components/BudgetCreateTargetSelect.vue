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

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';



const emit = defineEmits<{(e: 'update', target: string, isValid: boolean): void; }>();

const appContextStore = useAppContextStore();
const storeState = reactive({
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    loading: false,
    selectedWorkspaceItems: [] as SelectDropdownMenuItem[],
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
    selectedTargets(value: string[]) { return value.length ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REQUIRED_TARGET'); },
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
        <p-select-dropdown v-if="storeState.isAdminMode"
                           is-filterable
                           :handler="workspaceHandler"
                           :selected="state.selectedWorkspaceItems"
                           :loading="state.loading"
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
