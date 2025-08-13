<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { cloneDeep } from 'lodash';

import type {
    ConsoleFilter, ConsoleFilterValue,
} from '@cloudforet/core-lib/query/type';
import {
    PSelectDropdown, PTextButton,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { MenuAttachHandler } from '@cloudforet/mirinae/types/hooks/use-context-menu-attach/use-context-menu-attach';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { useResourceMenuHandlerMap } from '@/query/resource-query/resource-menu-handler';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import getRandomId from '@/lib/random-id-generator';
import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import {
    useCostDataSourceFilterMenuItems,
} from '@/common/composables/data-source/use-cost-data-source-filter-menu-items';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { getWorkspaceInfo } from '@/services/advanced/composables/refined-table-data';
import CostAnalysisFiltersAddMoreButton
    from '@/services/cost-explorer/components/CostAnalysisFiltersAddMoreButton.vue';
import { useCostQuerySetQuery } from '@/services/cost-explorer/composables/use-cost-query-set-query';
import { GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';
import { useCostQuerySetStore } from '@/services/cost-explorer/stores/cost-query-set-store';


const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;
const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();
const costQuerySetStore = useCostQuerySetStore();
const costQuerySetState = costQuerySetStore.state;
const costQuerySetGetters = costQuerySetStore.getters;

const resourceMenuHandlerMap = useResourceMenuHandlerMap();

// Cost Query Set Query
const { selectedQuerySet } = useCostQuerySetQuery({
    data_source_id: computed(() => costQuerySetGetters.dataSourceId),
    isUnifiedCostOn: computed(() => costQuerySetState.isUnifiedCostOn),
    selectedQuerySetId: computed(() => costQuerySetState.selectedQuerySetId),
});

const MANAGED_RESOURCE_ID_KEYS: string[] = [
    RESOURCE_CONFIG_MAP.workspace.idKey,
    RESOURCE_CONFIG_MAP.project.idKey,
    RESOURCE_CONFIG_MAP.projectGroup.idKey,
    RESOURCE_CONFIG_MAP.provider.idKey,
    RESOURCE_CONFIG_MAP.serviceAccount.idKey,
];

const getInitialSelectedItemsMap = (): Record<string, MenuItem[]> => ({});

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const { managedGroupByItems, additionalInfoGroupByItems } = useCostDataSourceFilterMenuItems({
    isAdminMode: computed(() => storeState.isAdminMode),
    costDataSource: computed(() => storeState.costDataSource[costQuerySetState.selectedDataSourceId ?? '']),
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
    isUnifiedCost: computed(() => costQuerySetState.isUnifiedCostOn),
    primaryCostOptions: computed<ConsoleFilter[]>(() => {
        if (state.isUnifiedCost) return [];
        return [{
            k: 'data_source_id',
            v: costQuerySetState.selectedDataSourceId ?? '',
            o: '=',
        }];
    }),
    selectedItemsMap: {} as Record<string, MenuItem[]>,
    handlerMap: computed(() => {
        const handlerMaps = {};
        state.enabledFilters.forEach((filter) => {
            handlerMaps[filter.name] = getMenuHandler(filter.name, state.primaryCostOptions);
        });
        return handlerMaps;
    }),
    isSelectedInitiated: false,
});
const convertedOriginFilter = computed<Record<string, ConsoleFilterValue | ConsoleFilterValue[]>>(() => {
    const originFilters:ConsoleFilter[] = selectedQuerySet.value?.options?.filters ?? [];
    const _selectedItemsMap: Record<string, ConsoleFilterValue | ConsoleFilterValue[]> = {};
    (originFilters ?? []).forEach((queryFilter:ConsoleFilter) => {
        if (queryFilter.k) {
            _selectedItemsMap[queryFilter.k] = queryFilter.v;
        }
    });
    return _selectedItemsMap;
});

/* Util */
const getMenuHandler = (groupBy: string, primaryQueryOptions: ConsoleFilter[]): MenuAttachHandler => {
    try {
        const _queryOptions: ConsoleFilter[] = [];
        if (groupBy === MANAGED_VARIABLE_MODELS.workspace.meta.idKey) {
            _queryOptions.push({
                k: 'is_dormant',
                v: false,
                o: '=',
            });
        }
        if (!MANAGED_RESOURCE_ID_KEYS.includes(groupBy)) {
            if (state.isUnifiedCost) {
                return resourceMenuHandlerMap.unifiedCost({
                    dataKey: groupBy,
                    menuFilters: primaryQueryOptions,
                });
            }
            return resourceMenuHandlerMap.cost({
                dataKey: groupBy,
                menuFilters: primaryQueryOptions,
            });
        }
        const resourceKey = Object.values(RESOURCE_CONFIG_MAP).find((d) => d.idKey === groupBy)?.resourceKey;
        if (!resourceKey) return async () => ({ results: [] });
        return resourceMenuHandlerMap[resourceKey]?.({
            menuFilters: _queryOptions,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return async () => ({ results: [] });
    }
};
const initSelectedFilters = (isReset = false) => {
    const _filters = isReset ? convertedOriginFilter.value : costAnalysisPageState.filters;
    const _selectedItemsMap = {};
    Object.keys(_filters ?? {}).forEach((groupBy) => {
        if (storeState.isAdminMode && !costAnalysisPageState.isAllWorkspaceSelected && groupBy === GROUP_BY.WORKSPACE) {
            _selectedItemsMap[groupBy] = [];
            return;
        }
        _selectedItemsMap[groupBy] = _filters?.[groupBy]?.map((d) => ({ name: d, label: d })) ?? [];
        const isGroupByExist = costAnalysisPageState.enabledFiltersProperties?.indexOf(groupBy) === -1;
        if (isGroupByExist) {
            costAnalysisPageStore.setEnabledFiltersProperties([
                ...(costAnalysisPageState.enabledFiltersProperties ?? []),
                groupBy,
            ]);
        }
    });
    state.selectedItemsMap = _selectedItemsMap;
    state.isSelectedInitiated = true;
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
    const _originConsoleFilters: ConsoleFilter[]|undefined = selectedQuerySet.value?.options?.filters;
    const _originFilters: Record<string, string[]> = {};
    if (_originConsoleFilters?.length) {
        _originConsoleFilters.forEach((d) => {
            _originFilters[d.k as string] = d.v as string[];
        });
    }
    costAnalysisPageStore.setFilters(_originFilters);
    state.randomId = getRandomId();
};

watch(selectedQuerySet, (_selectedQuerySet) => {
    if (!_selectedQuerySet) return;
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
            multi-selectable
            style-type="rounded"
            appearance-type="badge"
            show-select-marker
            use-fixed-menu-style
            selection-highlight
            :init-selected-with-handler="state.isSelectedInitiated"
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
