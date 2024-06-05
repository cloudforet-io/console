<script setup lang="ts">

import { onClickOutside } from '@vueuse/core';
import {
    computed, reactive, ref, toRef, watch,
} from 'vue';

import {
    PFieldGroup, PButton, PSelectDropdown, PContextMenu, PIconButton, useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import {
    cloneDeep, isEmpty, sortBy, unset,
} from 'lodash';

import type { MetricLabelKey } from '@/schema/inventory/metric/type';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';

import { VariableModelFactory } from '@/lib/variable-models';
import type {
    ManagedVariableModelKey,
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import {
    MANAGED_VARIABLE_MODEL_KEY_MAP, MANAGED_VARIABLE_MODELS,
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import CostTagKeyVariableModel
    from '@/lib/variable-models/managed-model/custom-resource-model/cost-tag-key-variable-model';
import type { VariableModelMenuHandlerInfo } from '@/lib/variable-models/variable-model-menu-handler';
import {
    getVariableModelMenuHandler,
} from '@/lib/variable-models/variable-model-menu-handler';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import { DATA_SOURCE_DOMAIN } from '@/common/modules/widgets/_constants/data-table-constant';
import type { DataTableSourceType } from '@/common/modules/widgets/types/widget-model';

import { GROUP_BY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/constants/cost-explorer-constant';


interface VariableOption {
    key: ManagedVariableModelKey;
    dataKey?: string;
}

const GROUP_BY_TO_VAR_MODELS: Record<string, VariableOption> = {
    [GROUP_BY.PROJECT_GROUP]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.project_group },
    [GROUP_BY.PRODUCT]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost, dataKey: 'product' },
    [GROUP_BY.PROVIDER]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.provider },
    [GROUP_BY.USAGE_TYPE]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost, dataKey: 'usage_type' },
};
const getInitialSelectedItemsMap = (): Record<string, SelectDropdownMenuItem[]> => ({});
type ManagedGlobalVariable = typeof GROUP_BY[keyof typeof GROUP_BY];
const MANAGED_GLOBAL_VARIALBE = [GROUP_BY.WORKSPACE, GROUP_BY.PROJECT, GROUP_BY.SERVICE_ACCOUNT, GROUP_BY.REGION] as (ManagedGlobalVariable|string)[];

interface Props {
    sourceType?: DataTableSourceType;
    sourceId?: string;
    filters: Record<string, string[]>;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:filters', value: Record<string, string[]>): void;}>();
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    metircs: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    costDataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});

const state = reactive({
    loading: false,
    proxyFilters: useProxyValue('filters', props, emit),
    filterItems: computed(() => {
        if (props.sourceType === DATA_SOURCE_DOMAIN.COST) {
            return [
                ...costFilterState.managedGroupByItems,
                ...costFilterState.additionalInfoGroupByItems,
                ...costFilterState.tagsFilterItems,
            ];
        }
        return [...assetFilterState.metricFilterItems];
    }),
    selectedItems: [] as MenuItem[],
    handlerMap: computed(() => {
        const handlerMaps = {};
        if (props.sourceType === DATA_SOURCE_DOMAIN.COST) {
            state.selectedItems.forEach(({ name }) => {
                handlerMaps[name] = getCostMenuHandler(name, state.listQueryOptions);
            });
        } else {
            assetFilterState.refinedLabelKeys.forEach((labelInfo) => {
                handlerMaps[labelInfo.key] = getAssetMenuHandler(labelInfo);
            });
        }
        return handlerMaps;
    }),
    listQueryOptions: computed<Partial<Record<ManagedVariableModelKey, any>>>(() => ({
        cost_data_source: props.sourceId,
    })),
    selectedItemsMap: getInitialSelectedItemsMap() as Record<string, SelectDropdownMenuItem[]>,
});

const costFilterState = reactive({
    managedGroupByItems: computed(() => Object.values(GROUP_BY_ITEM_MAP).filter((item) => !MANAGED_GLOBAL_VARIALBE.includes(item.name))),
    additionalInfoGroupByItems: computed(() => {
        const dataSource = storeState.costDataSources[props.sourceId ?? ''];
        return dataSource ? sortBy(dataSource.data?.cost_additional_info_keys.map((key) => ({
            name: `additional_info.${key}`,
            label: key,
        })), 'label') : [];
    }),
    tagsFilterItems: [] as MenuItem[],
});
const assetFilterState = reactive({
    refinedLabelKeys: computed(() => {
        const metricLabelsInfo = storeState.metircs[props.sourceId ?? ''].data.labels_info;
        return metricLabelsInfo ? metricLabelsInfo.filter((labelInfo) => !MANAGED_GLOBAL_VARIALBE.includes(labelInfo.key)) : [];
    }),
    metricFilterItems: computed(() => assetFilterState.refinedLabelKeys.map((d) => ({ name: d.key, label: d.name }))),
});

const containerRef = ref<HTMLElement|null>(null);
const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);
const {
    visibleMenu,
    refinedMenu,
    contextMenuStyle,
    showContextMenu,
    hideContextMenu,
    initiateMenu,
    // reloadMenu,
    showMoreMenu,
} = useContextMenuController({
    targetRef,
    contextMenuRef,
    useFixedStyle: true,
    useReorderBySelection: true,
    menu: toRef(state, 'filterItems'),
    selected: toRef(state, 'selectedItems'),
    pageSize: 10,
});
onClickOutside(containerRef, hideContextMenu);


/* Event */
const handleUpdateFiltersDropdown = (filterKey: string, selectedItems: SelectDropdownMenuItem[]) => {
    const selectedItemsMap = cloneDeep(state.selectedItemsMap);
    selectedItemsMap[filterKey] = selectedItems;
    state.selectedItemsMap = selectedItemsMap;

    state.proxyFilters = {
        ...state.proxyFilters,
        [filterKey]: selectedItems.map((d) => d.name as string),
    };
};
const handleAddFilter = () => {
    if (visibleMenu.value) {
        hideContextMenu();
    } else {
        initiateMenu();
        showContextMenu();
    }
};

const handleSelectAddFilterMenuItem = (item: MenuItem, _: any, isSelected: boolean) => {
    if (isSelected) {
        state.selectedItems = [
            ...state.selectedItems,
            item,
        ];
    } else {
        state.selectedItems = state.selectedItems.filter((d) => d !== item.name);
        resetFilterByKey(item.name);
    }
};
const handleDeleteFilter = (key: string) => {
    state.selectedItems = state.selectedItems.filter((d) => d.name !== key);
    resetFilterByKey(key);
};
const handleClearAddFilterMenuItems = () => {
    resetAllFilter();
};
const handleClickShowMore = async () => {
    await showMoreMenu();
};

/* Util */
const resetAllFilter = () => {
    state.proxyFilters = {};
    state.selectedItemsMap = getInitialSelectedItemsMap();
    state.selectedItems = [];
};
const resetFilterByKey = (key: string) => {
    unset(state.proxyFilters, key);
    unset(state.selectedItemsMap, key);
};
const getCostMenuHandler = (groupBy: string, listQueryOptions: Partial<Record<ManagedVariableModelKey, any>>): AutocompleteHandler => {
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
        const handler = getVariableModelMenuHandler([variableModelInfo], listQueryOptions);

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
const getAssetMenuHandler = (labelKey: MetricLabelKey): AutocompleteHandler => {
    try {
        let variableModelInfo: VariableModelMenuHandlerInfo;
        if (isEmpty(labelKey.reference)) {
            const MetricVariableModel = new VariableModelFactory(
                { type: 'MANAGED', managedModelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.metric_data },
            );
            MetricVariableModel[labelKey.key] = MetricVariableModel.generateProperty({ key: labelKey.key });
            variableModelInfo = {
                variableModel: MetricVariableModel,
                dataKey: labelKey.key,
            };
        } else {
            const _resourceType = labelKey.reference?.resource_type;
            const targetModelConfig = Object.values(MANAGED_VARIABLE_MODELS).find((d) => (d.meta?.resourceType === _resourceType));
            if (targetModelConfig) {
                variableModelInfo = {
                    variableModel: new VariableModelFactory(
                        { type: 'MANAGED', managedModelKey: targetModelConfig.meta.key as ManagedVariableModelKey },
                    ),
                };
            }
        }
        if (!variableModelInfo) return async () => ({ results: [] });
        const handler = getVariableModelMenuHandler([variableModelInfo]);
        return async (...args) => {
            try {
                state.loading = true;
                return await handler(...args);
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
const getTagsResources = async (): Promise<{name: string; key: string}[]> => {
    try {
        const options = {
            cost_data_source: props.sourceId,
        };
        const costTagKeyVariableModel = new CostTagKeyVariableModel();
        const response = await costTagKeyVariableModel.list({ options });
        return response.results;
    } catch (e: any) {
        ErrorHandler.handleError(e);
        return [];
    }
};

watch(() => props.sourceId, async () => {
    if (props.sourceType === DATA_SOURCE_DOMAIN.COST) {
        state.loading = true;
        const tagsResources = await getTagsResources();
        costFilterState.tagsFilterItems = tagsResources ? tagsResources.map((d) => ({ name: d.key, label: d.name })) : [];
        state.loading = false;
    }
    resetAllFilter();
});
</script>

<template>
    <p-field-group class="widget-form-data-table-card-filters"
                   label="Filters"
                   required
    >
        <div class="filters-area">
            <div v-for="(item) in state.selectedItems"
                 :key="`filter-${item.name}`"
            >
                <p-field-group class="field-title"
                               style-type="secondary"
                               required
                               :label="item.label"
                               size="sm"
                               color="gray"
                >
                    <div class="filter-select-wrapper">
                        <p-select-dropdown class="filters-dropdown"
                                           is-filterable
                                           :handler="state.handlerMap[item.name]"
                                           :selected="state.selectedItemsMap[item.name] ?? []"
                                           :loading="state.loading"
                                           multi-selectable
                                           appearance-type="badge"
                                           show-select-marker
                                           use-fixed-menu-style
                                           selection-highlight
                                           :init-selected-with-handler="!!GROUP_BY_TO_VAR_MODELS[item.name]"
                                           :selection-label="item.label"
                                           :show-delete-all-button="false"
                                           :page-size="10"
                                           @update:selected="handleUpdateFiltersDropdown(item.name, $event)"
                        />
                        <p-icon-button name="ic_delete"
                                       style-type="transparent"
                                       size="sm"
                                       @click="handleDeleteFilter(item.name)"
                        />
                    </div>
                </p-field-group>
            </div>
            <div ref="containerRef"
                 class="filter-dropdown-wrapper"
            >
                <p-button ref="targetRef"
                          style-type="tertiary"
                          icon-left="ic_plus_bold"
                          @click="handleAddFilter"
                >
                    Add Filter
                </p-button>
                <p-context-menu v-show="visibleMenu"
                                ref="contextMenuRef"
                                class="add-filter-context-menu"
                                :loading="state.loading"
                                :style="contextMenuStyle"
                                :menu="refinedMenu"
                                :selected="state.selectedItems"
                                multi-selectable
                                show-select-marker
                                show-clear-selection
                                @select="handleSelectAddFilterMenuItem"
                                @clear-selection="handleClearAddFilterMenuItems"
                                @click-show-more="handleClickShowMore"
                />
            </div>
        </div>
    </p-field-group>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-filters {
    .filters-area {
        @apply bg-gray-100 rounded-lg;
        padding: 0.5rem;
        margin-top: 0.25rem;

        .filter-select-wrapper {
            @apply flex items-center gap-1;
        }

        .filter-dropdown-wrapper {
            @apply relative;

            .add-filter-context-menu {
                z-index: 1;
            }
        }
    }
}
</style>
