<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { cloneDeep } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import {
    PSelectDropdown, PTextButton, PStatus,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { VariableModelFactory } from '@/lib/variable-models';
import type {
    ManagedVariableModelKey,
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import {
    MANAGED_VARIABLE_MODEL_KEY_MAP,
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import type {
    VariableModelMenuHandlerInfo,
} from '@/lib/variable-models/variable-model-menu-handler';
import {
    getVariableModelMenuHandler,
} from '@/lib/variable-models/variable-model-menu-handler';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import CostAnalysisFiltersAddMoreButton
    from '@/services/cost-explorer/components/CostAnalysisFiltersAddMoreButton.vue';
import { GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';
import { getWorkspaceInfo, workspaceStateFormatter } from '@/services/preference/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/preference/constants/workspace-constant';

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageGetters = costAnalysisPageStore.getters;
const costAnalysisPageState = costAnalysisPageStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;

interface VariableOption {
    key: ManagedVariableModelKey;
    dataKey?: string;
}

const GROUP_BY_TO_VAR_MODELS: Record<string, VariableOption> = {
    [GROUP_BY.WORKSPACE]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.workspace },
    [GROUP_BY.PROJECT]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.project },
    [GROUP_BY.PROJECT_GROUP]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.project_group },
    [GROUP_BY.PRODUCT]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost, dataKey: 'product' },
    [GROUP_BY.PROVIDER]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.provider },
    [GROUP_BY.SERVICE_ACCOUNT]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.service_account },
    [GROUP_BY.REGION]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.region },
    [GROUP_BY.USAGE_TYPE]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost, dataKey: 'usage_type' },
};

const getInitialSelectedItemsMap = (): Record<string, SelectDropdownMenuItem[]> => ({
});

const props = defineProps<{
    visible: boolean;
}>();

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
});
const state = reactive({
    loading: true,
    enabledFilters: computed<SelectDropdownMenuItem[]>(() => {
        if (!costAnalysisPageState.enabledFiltersProperties) return [];
        return costAnalysisPageState.enabledFiltersProperties.map((d) => {
            // NOTE: only for project group case (not in group by but in filters)
            if (d === GROUP_BY.PROJECT_GROUP) return { name: d, label: 'Project Group' };
            const targetItem = costAnalysisPageGetters.defaultGroupByItems.find((item) => item.name === d);
            if (targetItem) return targetItem;
            return { name: d, label: d };
        });
    }),
    primaryCostStatOptions: computed<Record<string, any>>(() => ({
        data_source_id: costAnalysisPageGetters.selectedDataSourceId,
    })),
    selectedItemsMap: {} as Record<string, SelectDropdownMenuItem[]>,
    handlerMap: computed(() => {
        const handlerMaps = {};
        state.enabledFilters.forEach(({ name }) => {
            handlerMaps[name] = getMenuHandler(name, {}, state.primaryCostStatOptions);
        });
        return handlerMaps;
    }),
});

/* Util */
const getMenuHandler = (groupBy: string, listQueryOptions: Partial<Record<ManagedVariableModelKey, any>>, primaryOptions: Record<string, any>): AutocompleteHandler => {
    try {
        let variableModelInfo: VariableModelMenuHandlerInfo;
        const _variableOption = GROUP_BY_TO_VAR_MODELS[groupBy];
        if (_variableOption) {
            variableModelInfo = {
                variableModel: new VariableModelFactory({ type: 'MANAGED', managedModelKey: _variableOption.key }),
                dataKey: _variableOption.dataKey,
            };
        } else {
            const CostVariableModel = new VariableModelFactory({ type: 'MANAGED', managedModelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.cost });
            CostVariableModel[groupBy] = CostVariableModel.generateProperty({ key: groupBy });
            variableModelInfo = {
                variableModel: CostVariableModel,
                dataKey: groupBy,
            };
        }
        const handler = getVariableModelMenuHandler([variableModelInfo], listQueryOptions, primaryOptions);

        return async (...args) => {
            if (!groupBy) return { results: [] };
            try {
                state.loading = true;
                const results = await handler(...args);
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                return { results: [] };
            } finally {
                state.loading = false;
            }
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return async () => ({ results: [] });
    }
};
const initSelectedFilters = () => {
    const _filters = costAnalysisPageState.filters;
    const _selectedItemsMap = {};
    Object.keys(_filters ?? {}).forEach((groupBy) => {
        _selectedItemsMap[groupBy] = _filters?.[groupBy].map((d) => ({ name: d, label: d })) ?? [];
        if (costAnalysisPageState.enabledFiltersProperties?.indexOf(groupBy) === -1) {
            costAnalysisPageStore.setEnabledFiltersProperties([
                ...(costAnalysisPageState.enabledFiltersProperties ?? []),
                groupBy,
            ]);
        }
    });
    state.selectedItemsMap = _selectedItemsMap;
};

/* Event */
const handleUpdateFiltersDropdown = (groupBy: string, selectedItems: SelectDropdownMenuItem[]) => {
    const selectedItemsMap = cloneDeep(state.selectedItemsMap);
    selectedItemsMap[groupBy] = selectedItems;
    state.selectedItemsMap = selectedItemsMap;

    costAnalysisPageStore.setFilters({
        ...costAnalysisPageState.filters,
        [groupBy]: selectedItems.map((d) => d.name as string),
    });
};
const handleDisabledFilters = (all?: boolean, disabledFilter?: string) => {
    if (all) {
        state.selectedItemsMap = getInitialSelectedItemsMap();
        costAnalysisPageStore.setFilters({});
    } else if (disabledFilter) {
        const _filters = cloneDeep(costAnalysisPageState.filters);
        delete _filters?.[disabledFilter];
        costAnalysisPageStore.setFilters(_filters);
    }
};
const handleClickResetFilters = () => {
    state.selectedItemsMap = getInitialSelectedItemsMap();

    const _originConsoleFilters: ConsoleFilter[]|undefined = costAnalysisPageGetters.selectedQuerySet?.options?.filters;
    const _originFilters: Record<string, string[]> = {};
    if (_originConsoleFilters?.length) {
        _originConsoleFilters.forEach((d) => {
            _originFilters[d.k as string] = d.v as string[];
        });
    }
    costAnalysisPageStore.setFilters(_originFilters);
};

watch(() => props.visible, (visible) => {
    if (!visible) return;
    initSelectedFilters();
}, { immediate: true });

</script>

<template>
    <div class="cost-analysis-filters-popper">
        <p-select-dropdown
            v-for="groupBy in state.enabledFilters"
            :key="`filters-dropdown-${groupBy.name}`"
            class="filters-popper-dropdown"
            is-filterable
            :handler="state.handlerMap[groupBy.name]"
            :selected="state.selectedItemsMap[groupBy.name] ?? []"
            :loading="state.loading"
            multi-selectable
            style-type="rounded"
            appearance-type="badge"
            show-select-marker
            use-fixed-menu-style
            selection-highlight
            :init-selected-with-handler="props.visible && !!GROUP_BY_TO_VAR_MODELS[groupBy.name]"
            :selection-label="groupBy.label"
            :show-delete-all-button="false"
            :page-size="10"
            @update:selected="handleUpdateFiltersDropdown(groupBy.name, $event)"
        >
            <template v-if="groupBy.name === GROUP_BY.WORKSPACE"
                      #menu-item--format="{item}"
            >
                <div class="menu-item-wrapper"
                     :class="{'is-dormant': getWorkspaceInfo(item?.name || '', storeState.workspaceList)?.is_dormant}"
                >
                    <div class="label">
                        <workspace-logo-icon :text="item?.label || ''"
                                             :theme="getWorkspaceInfo(item?.name || '', storeState.workspaceList)?.tags?.theme"
                                             size="xs"
                        />
                        <span class="label-text">{{ item.label }}</span>
                        <p-status v-if="getWorkspaceInfo(item?.name || '', storeState.workspaceList)?.is_dormant"
                                  v-bind="workspaceStateFormatter(WORKSPACE_STATE.DORMANT)"
                                  class="capitalize state"
                        />
                    </div>
                </div>
            </template>
        </p-select-dropdown>
        <cost-analysis-filters-add-more-button @disable-filter="handleDisabledFilters(false, $event)"
                                               @disable-all-filters="handleDisabledFilters(true, $event)"
        />
        <p-text-button icon-left="ic_refresh"
                       style-type="highlight"
                       class="reset-button"
                       @click="handleClickResetFilters"
        >
            {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.RESET') }}
        </p-text-button>
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-filters-popper {
    @apply flex items-center flex-wrap;
    flex: 1;
    gap: 0.5rem;
    .filters-popper-dropdown {
        width: initial;
    }

    .reset-button {
        display: inline-block;
        vertical-align: middle;
        padding: 0.5rem 0;
    }

    .menu-item-wrapper {
        @apply flex justify-between;
        max-width: 18rem;

        .label {
            @apply flex items-center gap-2;
        }
        .state {
            @apply text-label-sm;
        }
        .label-text {
            @apply truncate;
            max-width: 8.375rem;
        }
        &.is-dormant {
            .label-text {
                max-width: 4.125rem;
            }
        }
    }
}

/* custom design-system component - p-context-menu */
:deep(.p-context-menu) {
    /*
        CAUTION:
        When the parent has a specific style attribute called 'transform,' 'fixed' behaves like 'absolute,' causing the context-menu's top position not to work correctly,
        so it is manually forced to be specified.
    */
    top: initial !important;
    left: initial !important;
}
</style>
