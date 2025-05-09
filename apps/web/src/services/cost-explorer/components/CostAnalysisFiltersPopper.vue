<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { cloneDeep } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import {
    PSelectDropdown, PTextButton,
} from '@cloudforet/mirinae';
import type { AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';


import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import getRandomId from '@/lib/random-id-generator';
import { VariableModelFactory } from '@/lib/variable-models';
import type {
    ManagedVariableModelKey,
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import {
    MANAGED_VARIABLE_MODEL_KEY_MAP, MANAGED_VARIABLE_MODELS,
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import type {
    VariableModelMenuHandlerInfo,
} from '@/lib/variable-models/variable-model-menu-handler';
import {
    getVariableModelMenuHandler,
} from '@/lib/variable-models/variable-model-menu-handler';

import {
    useCostDataSourceFilterMenuItems,
} from '@/common/composables/data-source/use-cost-data-source-filter-menu-items';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { getWorkspaceInfo } from '@/services/advanced/composables/refined-table-data';
import CostAnalysisFiltersAddMoreButton
    from '@/services/cost-explorer/components/CostAnalysisFiltersAddMoreButton.vue';
import { GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';


const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageGetters = costAnalysisPageStore.getters;
const costAnalysisPageState = costAnalysisPageStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;
const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();

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
    [GROUP_BY.REGION]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost, dataKey: 'region' },
    [GROUP_BY.USAGE_TYPE]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost, dataKey: 'usage_type' },
};

const GROUP_BY_TO_VAR_MODELS_FOR_UNIFIED_COST: Record<string, VariableOption> = {
    [GROUP_BY.WORKSPACE]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.workspace },
    [GROUP_BY.PROJECT]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.project },
    [GROUP_BY.PROJECT_GROUP]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.project_group },
    [GROUP_BY.PRODUCT]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.unified_cost, dataKey: 'product' },
    [GROUP_BY.PROVIDER]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.provider },
    [GROUP_BY.SERVICE_ACCOUNT]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.service_account },
    [GROUP_BY.REGION]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.unified_cost, dataKey: 'region' },
    [GROUP_BY.USAGE_TYPE]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.unified_cost, dataKey: 'usage_type' },
};

const getInitialSelectedItemsMap = (): Record<string, MenuItem[]> => ({});

const props = defineProps<{
    visible: boolean;
}>();

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const { managedGroupByItems, additionalInfoGroupByItems } = useCostDataSourceFilterMenuItems({
    isAdminMode: computed(() => storeState.isAdminMode),
    costDataSource: computed(() => storeState.costDataSource[costAnalysisPageGetters.selectedDataSourceId ?? '']),
});
const state = reactive({
    randomId: '',
    loading: true,
    enabledFilters: computed<MenuItem[]>(() => {
        if (!costAnalysisPageState.enabledFiltersProperties) return [];
        return costAnalysisPageState.enabledFiltersProperties.map((d) => {
            // NOTE: only for project group case (not in group by but in filters)
            if (d === GROUP_BY.PROJECT_GROUP) return { name: d, label: 'Project Group' };

            const defaultGroupByItems = [
                ...managedGroupByItems.value,
                ...additionalInfoGroupByItems.value,
            ];
            const targetItem = defaultGroupByItems.find((item) => item.name === d);
            if (targetItem) return targetItem;
            return { name: d, label: d };
        });
    }),
    isUnifiedCost: computed(() => costAnalysisPageGetters.isUnifiedCost),
    primaryCostOptions: computed<Record<string, any>>(() => ({
        ...(!state.isUnifiedCost && { data_source_id: costAnalysisPageGetters.selectedDataSourceId }),
    })),
    selectedItemsMap: {} as Record<string, MenuItem[]>,
    handlerMap: computed(() => {
        const handlerMaps = {};
        state.enabledFilters.forEach((filter) => {
            handlerMaps[filter.name] = getMenuHandler(filter.name, { presetKeys: filter?.presetKeys }, state.primaryCostOptions);
        });
        return handlerMaps;
    }),
});

/* Util */
const getMenuHandler = (groupBy: string, modelOptions: Record<string, any>, primaryQueryOptions: Record<string, any>): AutocompleteHandler => {
    try {
        let variableModelInfo: VariableModelMenuHandlerInfo;
        const _variableOption = state.isUnifiedCost ? GROUP_BY_TO_VAR_MODELS_FOR_UNIFIED_COST[groupBy] : GROUP_BY_TO_VAR_MODELS[groupBy];
        let _queryOptions: Record<string, any> = {};
        if (groupBy === MANAGED_VARIABLE_MODELS.workspace.meta.idKey) {
            _queryOptions.is_dormant = false;
        }
        if (_variableOption) {
            variableModelInfo = {
                variableModel: new VariableModelFactory({ type: 'MANAGED', managedModelKey: _variableOption.key }),
                dataKey: _variableOption.dataKey,
            };
            if (_variableOption.key === MANAGED_VARIABLE_MODEL_KEY_MAP.cost) _queryOptions = { ..._queryOptions, ...primaryQueryOptions };
        } else {
            const CostVariableModel = new VariableModelFactory({ type: 'MANAGED', managedModelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.cost });
            CostVariableModel[groupBy] = CostVariableModel.generateProperty({ key: groupBy, presetValues: modelOptions?.presetKeys });
            variableModelInfo = {
                variableModel: CostVariableModel,
                dataKey: groupBy,
            };
            _queryOptions = { ..._queryOptions, ...primaryQueryOptions };
        }
        const handler = getVariableModelMenuHandler([variableModelInfo], _queryOptions);

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
const initSelectedFilters = (isReset = false) => {
    const _filters = isReset ? costAnalysisPageGetters.convertedOriginFilter : costAnalysisPageState.filters;
    const _selectedItemsMap = {};
    Object.keys(_filters ?? {}).forEach((groupBy) => {
        if (storeState.isAdminMode && !costAnalysisPageState.isAllWorkspaceSelected && groupBy === GROUP_BY.WORKSPACE) {
            _selectedItemsMap[groupBy] = [];
            return;
        }
        _selectedItemsMap[groupBy] = _filters?.[groupBy].map((d) => ({ name: d, label: d })) ?? [];
        const isGroupByExist = costAnalysisPageState.enabledFiltersProperties?.indexOf(groupBy) === -1;
        if (isGroupByExist) {
            costAnalysisPageStore.setEnabledFiltersProperties([
                ...(costAnalysisPageState.enabledFiltersProperties ?? []),
                groupBy,
            ]);
        }
    });
    state.selectedItemsMap = _selectedItemsMap;
};

/* Event */
const handleUpdateFiltersDropdown = (groupBy: string, selectedItems: MenuItem[]) => {
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
    initSelectedFilters(true);
    const _originConsoleFilters: ConsoleFilter[]|undefined = costAnalysisPageGetters.selectedQuerySet?.options?.filters;
    const _originFilters: Record<string, string[]> = {};
    if (_originConsoleFilters?.length) {
        _originConsoleFilters.forEach((d) => {
            _originFilters[d.k as string] = d.v as string[];
        });
    }
    costAnalysisPageStore.setFilters(_originFilters);
    state.randomId = getRandomId();
};

watch([() => costAnalysisPageGetters.selectedQueryId, () => costAnalysisPageGetters.isUnifiedCost, () => costAnalysisPageGetters.selectedDataSourceId], () => {
    initSelectedFilters();
}, { immediate: true });

</script>

<template>
    <div class="cost-analysis-filters-popper">
        <p-select-dropdown
            v-for="groupBy in state.enabledFilters"
            :key="`filters-dropdown-${groupBy.name}-${state.randomId}`"
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
                <div class="menu-item-wrapper">
                    <div class="label">
                        <workspace-logo-icon :text="item?.label || ''"
                                             :theme="getWorkspaceInfo(item?.name || '', storeState.workspaceList)?.tags?.theme"
                                             size="xs"
                        />
                        <span class="label-text">{{ item.label }}</span>
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
    }
}
</style>
