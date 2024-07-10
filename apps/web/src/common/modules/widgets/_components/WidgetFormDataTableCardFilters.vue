<script setup lang="ts">

import { onClickOutside } from '@vueuse/core';
import {
    computed, onMounted, reactive, ref, toRef, watch,
} from 'vue';

import {
    PFieldGroup, PButton, PSelectDropdown, PContextMenu, PIconButton, useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import {
    cloneDeep, isEmpty, unset,
} from 'lodash';

import type { MetricLabelKey } from '@/schema/inventory/metric/type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
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
import type { VariableModelMenuHandlerInfo } from '@/lib/variable-models/variable-model-menu-handler';
import {
    getVariableModelMenuHandler,
} from '@/lib/variable-models/variable-model-menu-handler';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import { DATA_SOURCE_DOMAIN } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableSourceType } from '@/common/modules/widgets/types/widget-model';

import { GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';


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
const getInitialSelectedItemsMap = (): Record<string, SelectDropdownMenuItem[]> => ({});
interface Props {
    dataTableId: string;
    sourceType?: DataTableSourceType;
    sourceId?: string;
    sourceKey?: string;
    filter: Record<string, string[]>;
    filterItems: MenuItem[];
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:filter', value: Record<string, string[]>): void;}>();
const allReferenceStore = useAllReferenceStore();
const widgetGenerateStore = useWidgetGenerateStore();
const appContextStore = useAppContextStore();

const storeState = reactive({
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    costDataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    dataTable: computed(() => widgetGenerateStore.state.dataTables.find((d) => d.data_table_id === props.dataTableId)),
});

const state = reactive({
    loading: false,
    proxyFilter: useProxyValue('filter', props, emit),
    filterItems: computed(() => props.filterItems),
    selectedItems: [] as MenuItem[],
    handlerMap: computed(() => {
        const handlerMaps = {};
        if (props.sourceType === DATA_SOURCE_DOMAIN.COST) {
            state.selectedItems.forEach(({ name }) => {
                handlerMaps[name] = getCostMenuHandler(name, {}, state.primaryCostStatOptions);
            });
        } else {
            assetFilterState.refinedLabelKeys.forEach((labelInfo) => {
                handlerMaps[labelInfo.key] = getAssetMenuHandler(labelInfo);
            });
        }
        return handlerMaps;
    }),
    primaryCostStatOptions: computed<Record<string, any>>(() => ({
        data_source_id: props.sourceId,
    })),
    selectedItemsMap: getInitialSelectedItemsMap() as Record<string, SelectDropdownMenuItem[]>,
});
const assetFilterState = reactive({
    refinedLabelKeys: computed(() => {
        const metricLabelsInfo = storeState.metrics[props.sourceId ?? ''].data.labels_info;
        return metricLabelsInfo ? metricLabelsInfo.filter((labelInfo) => {
            if (storeState.isAdminMode) return true;
            return labelInfo.key !== 'workspace_id';
        }) : [];
    }),
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
    // useFixedStyle: true,
    useReorderBySelection: true,
    menu: toRef(state, 'filterItems'),
    selected: toRef(state, 'selectedItems'),
    pageSize: 10,
});
onClickOutside(containerRef, hideContextMenu);


/* Event */
const handleUpdateFilterDropdown = (filterKey: string, selectedItems: SelectDropdownMenuItem[]) => {
    const selectedItemsMap = cloneDeep(state.selectedItemsMap);
    selectedItemsMap[filterKey] = selectedItems;
    state.selectedItemsMap = selectedItemsMap;

    state.proxyFilter = {
        ...state.proxyFilter,
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
    state.proxyFilter = {};
    state.selectedItemsMap = getInitialSelectedItemsMap();
    state.selectedItems = [];
};
const resetFilterByKey = (key: string) => {
    unset(state.proxyFilter, key);
    unset(state.selectedItemsMap, key);
    state.proxyFilter = { ...state.proxyFilter };
    state.selectedItemsMap = { ...state.selectedItemsMap };
};
const getCostMenuHandler = (groupBy: string, listQueryOptions: Partial<Record<ManagedVariableModelKey, any>>, primaryOptions: Record<string, any>): AutocompleteHandler => {
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

watch(() => props.sourceKey, async () => {
    resetAllFilter();
});

onMounted(() => {
    if (!storeState.dataTable) return;
    const initialFilter = storeState.dataTable.options?.filter ?? [];

    initialFilter.forEach((filter) => {
        const selectedFilteritemLabel = state.filterItems.find((d) => d.name === filter.k)?.label;
        state.selectedItems = [
            ...state.selectedItems,
            { name: filter.k, label: selectedFilteritemLabel },
        ];
        state.selectedItemsMap[filter.k] = filter.v.map((d) => ({ name: d }));
    });
});

</script>

<template>
    <p-field-group class="widget-form-data-table-card-filters"
                   :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.FILTERS')"
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
                                           :init-selected-with-handler="!!GROUP_BY_TO_VAR_MODELS[item.name] || props.sourceType === DATA_SOURCE_DOMAIN.ASSET"
                                           :show-delete-all-button="false"
                                           :page-size="10"
                                           @update:selected="handleUpdateFilterDropdown(item.name, $event)"
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
                    {{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.ADD_FILTER') }}
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
                z-index: 100;
            }
        }
    }
}
</style>
