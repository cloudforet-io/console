<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { debounce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PFieldGroup, PSelectDropdown, PStatus } from '@cloudforet/mirinae';
import type {
    AutocompleteHandler, SelectDropdownMenuItem,
} from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';


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
    targetLabelText: computed(() => {
        if (storeState.isAdminMode) return i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.WORKSPACE');
        return i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.PROJECT');
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
const workspaceHandler: AutocompleteHandler = async (keyword: string, pageStart = 1, pageLimit = 10) => {
    try {
        state.loading = true;
        const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
            query: {
                keyword,
                filter: [
                    { k: 'is_dormant', v: false, o: 'eq' },
                ],
            },
        });
        const refinedMenuItems = (results ?? []).map((d) => ({
            name: d.workspace_id,
            label: d.name,
            is_dormant: d.is_dormant,
            tags: d.tags,
        }));
        const totalCount = pageStart - 1 + Number(pageLimit);
        const slicedResults = refinedMenuItems?.slice(pageStart - 1, totalCount);
        return {
            results: slicedResults,
            more: totalCount < refinedMenuItems.length,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            results: [],
            more: false,
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
    <p-field-group :label="state.targetLabelText"
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
            >
                <template #menu-item--format="{item}">
                    <div class="menu-item-wrapper"
                         :class="{'is-dormant': item?.is_dormant}"
                    >
                        <div class="label">
                            <workspace-logo-icon :text="item?.label || ''"
                                                 :theme="item?.tags?.theme"
                                                 size="xs"
                            />
                            <span class="label-text">{{ item.label }}</span>
                            <p-status v-if="item?.is_dormant"
                                      v-bind="workspaceStateFormatter(WORKSPACE_STATE.DORMANT)"
                                      class="capitalize state"
                            />
                        </div>
                    </div>
                </template>
            </p-select-dropdown>
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
    .menu-item-wrapper {
        @apply flex justify-between;
        max-width: 100%;

        .label {
            @apply flex items-center gap-2;
        }
        .state {
            @apply text-label-sm;
        }
        .label-text {
            @apply truncate;
            max-width: 23.75rem;
        }
        &.is-dormant {
            .label-text {
                max-width: 18.75rem;
            }
        }
    }
}

@screen mobile {
    .budget-create-target-select {
        width: 100%;
    }
}
</style>
