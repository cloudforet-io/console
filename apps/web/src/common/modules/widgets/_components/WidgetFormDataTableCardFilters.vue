<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, onMounted, reactive, ref, toRef, watch,
} from 'vue';

import {
    cloneDeep,
    debounce,
    isArray,
    isEmpty, unset,
} from 'lodash';

import {
    PFieldGroup, PButton, PContextMenu, useContextMenuController,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

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
import WidgetFormDataTableCardFiltersItem
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardFiltersItem.vue';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import {
    DATA_SOURCE_DOMAIN,
    DATA_TABLE_QUERY_OPERATOR,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableQueryFilterForDropdown } from '@/common/modules/widgets/types/widget-data-table-type';
import type { DataTableSourceType, DataTableQueryFilter } from '@/common/modules/widgets/types/widget-model';

import { PROJECT_GROUP_LABEL_INFO } from '@/services/asset-inventory/constants/asset-analysis-constant';
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
    [GROUP_BY.REGION]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost, dataKey: 'region' },
    [GROUP_BY.USAGE_TYPE]: { key: MANAGED_VARIABLE_MODEL_KEY_MAP.cost, dataKey: 'usage_type' },
};

const getInitialSelectedItemsMap = (): Record<string, DataTableQueryFilterForDropdown> => ({});
interface Props {
    dataTableId: string;
    sourceType?: DataTableSourceType;
    sourceId?: string;
    sourceKey?: string;
    filter: Record<string, DataTableQueryFilter>;
    filterItems: MenuItem[];
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:filter', value: Record<string, string[]>): void;}>();
const allReferenceStore = useAllReferenceStore();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const appContextStore = useAppContextStore();

/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const storeState = reactive({
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    costDataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    dataTable: computed(() => dataTableList.value.find((d) => d.data_table_id === props.dataTableId)),
});

const state = reactive({
    loading: false,
    proxyFilter: useProxyValue<Record<string, DataTableQueryFilter>>('filter', props, emit),
    filterItems: computed(() => props.filterItems),
    selectedItems: [] as any[],
    primaryCostOptions: computed<Record<string, any>>(() => ({
        ...((props.sourceType === DATA_SOURCE_DOMAIN.COST && props.sourceId) ? { data_source_id: props.sourceId } : {}),
    })),
    handlerMap: computed(() => {
        const handlerMaps = {};
        if (props.sourceType === DATA_SOURCE_DOMAIN.COST || props.sourceType === DATA_SOURCE_DOMAIN.UNIFIED_COST) {
            state.selectedItems.forEach(({ name, presetKeys }) => {
                handlerMaps[name] = getCostMenuHandler(name, { presetKeys });
            });
        } else {
            assetFilterState.refinedLabelKeys.forEach((labelInfo) => {
                handlerMaps[labelInfo.key] = getAssetMenuHandler(labelInfo);
            });
        }
        return handlerMaps;
    }),
    primaryMetricStatOptions: computed<Record<string, any>>(() => ({
        metric_id: props.sourceId,
    })),
    selectedItemsMap: getInitialSelectedItemsMap() as Record<string, DataTableQueryFilterForDropdown>,
    searchText: '',
});
const assetFilterState = reactive({
    refinedLabelKeys: computed(() => {
        const metricLabelsInfo = storeState.metrics[props.sourceId ?? ''].data.labels_info;
        const _refinedLabelKeys = cloneDeep(metricLabelsInfo || []);
        const projectLabelInfoIndex = _refinedLabelKeys.findIndex((d) => d.key === 'project_id');
        if (projectLabelInfoIndex > -1) {
            _refinedLabelKeys.splice(projectLabelInfoIndex, 0, PROJECT_GROUP_LABEL_INFO);
        }
        return _refinedLabelKeys.filter((labelInfo) => {
            if (storeState.isAdminMode) return true;
            return labelInfo.key !== 'workspace_id';
        });
    }),
});

const containerRef = ref<HTMLElement|null>(null);
const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);
const {
    visibleMenu,
    refinedMenu,
    showContextMenu,
    hideContextMenu,
    initiateMenu,
    reloadMenu,
    showMoreMenu,
} = useContextMenuController({
    targetRef,
    contextMenuRef,
    useMenuFiltering: true,
    useReorderBySelection: true,
    menu: toRef(state, 'filterItems'),
    selected: toRef(state, 'selectedItems'),
    searchText: toRef(state, 'searchText'),
    pageSize: 10,
});
onClickOutside(containerRef, hideContextMenu);


/* Event */
const handleUpdateSearchText = debounce((text: string) => {
    state.searchText = text;
    reloadMenu();
}, 200);
const handleUpdateFilter = (filterKey: string, filter: DataTableQueryFilterForDropdown) => {
    state.selectedItemsMap[filterKey] = { ...filter };

    // NOTE: For Use Global Variables CASE, since it is a single select, the value is a string.
    const filterValue = isArray(filter.v) ? filter.v.map((d) => d.name) : filter.v;

    state.proxyFilter = {
        ...state.proxyFilter,
        [filterKey]: {
            ...filter,
            v: filterValue,
        },
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
        // NOTE: temporary disabled contain_in operator
        // const defaultOperator = KEYWORD_FILTER_DISABLED_KEYS.includes(item.name)
        //     ? DATA_TABLE_QUERY_OPERATOR.in.key
        //     : DATA_TABLE_QUERY_OPERATOR.contain_in.key;
        const defaultOperator = DATA_TABLE_QUERY_OPERATOR.in.key;
        state.selectedItems = [
            ...state.selectedItems,
            item,
        ];
        state.selectedItemsMap[item.name] = {
            k: item.name,
            v: [],
            o: defaultOperator,
        };
    } else {
        state.selectedItems = state.selectedItems.filter((d) => d !== item.name);
        resetFilterByKey(item.name);
    }
    hideContextMenu();
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
const getCostMenuHandler = (
    groupBy: string,
    modelOptions?: Record<string, any>,
): AutocompleteHandler => {
    try {
        let variableModelInfo: VariableModelMenuHandlerInfo;
        let queryOptions: Record<string, any> = {};
        const _variableOption = GROUP_BY_TO_VAR_MODELS[groupBy];
        if (_variableOption) {
            variableModelInfo = {
                variableModel: new VariableModelFactory({ type: 'MANAGED', managedModelKey: _variableOption.key }),
                dataKey: _variableOption.dataKey,
            };
            if (_variableOption.key === MANAGED_VARIABLE_MODEL_KEY_MAP.cost) queryOptions = { ...queryOptions, ...state.primaryCostOptions };

            if (groupBy === MANAGED_VARIABLE_MODELS.workspace.meta.idKey) {
                queryOptions.is_dormant = false;
            }
        } else {
            const CostVariableModel = new VariableModelFactory({ type: 'MANAGED', managedModelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.cost });
            CostVariableModel[groupBy] = CostVariableModel.generateProperty({ key: groupBy, presetValues: modelOptions?.presetKeys });
            variableModelInfo = {
                variableModel: CostVariableModel,
                dataKey: groupBy,
            };
            queryOptions = { ...queryOptions, ...state.primaryCostOptions };
        }
        const handler = getVariableModelMenuHandler([variableModelInfo], queryOptions);

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
        let queryOptions: Record<string, any> = {};
        if (isEmpty(labelKey.reference)) {
            const MetricVariableModel = new VariableModelFactory(
                { type: 'MANAGED', managedModelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.metric_data },
            );
            MetricVariableModel[labelKey.key] = MetricVariableModel.generateProperty({ key: labelKey.key });
            variableModelInfo = {
                variableModel: MetricVariableModel,
                dataKey: labelKey.key,
            };
            queryOptions = { ...queryOptions, ...state.primaryMetricStatOptions };
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


        if (labelKey.key === MANAGED_VARIABLE_MODELS.workspace.meta.idKey) {
            queryOptions.is_dormant = false;
        }
        const handler = getVariableModelMenuHandler([variableModelInfo], queryOptions);
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
        const selectedFilteritem = state.filterItems.find((d) => d.name === filter.k);
        state.selectedItems = [
            ...state.selectedItems,
            { name: filter.k, label: selectedFilteritem?.label, presetKeys: selectedFilteritem?.presetKeys },
        ];

        state.selectedItemsMap[filter.k] = {
            ...filter,
            v: isArray(filter.v) ? filter.v.map((d) => ({ name: d, label: d })) : filter.v,
        };
    });
});

</script>

<template>
    <p-field-group class="widget-form-data-table-card-filters"
                   :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.FILTERS')"
    >
        <div class="filters-area">
            <widget-form-data-table-card-filters-item v-for="(item) in state.selectedItems"
                                                      :key="`filter-${item.name}`"
                                                      :filter-item="item"
                                                      :handler="state.handlerMap[item.name]"
                                                      :loading="state.loading"
                                                      :selected-filter="state.selectedItemsMap[item.name]"
                                                      :init-selected-with-handler="!!GROUP_BY_TO_VAR_MODELS[item.name] || props.sourceType === DATA_SOURCE_DOMAIN.ASSET"
                                                      @delete="handleDeleteFilter(item.name)"
                                                      @update:selected-filter="handleUpdateFilter(item.name, $event)"
            />
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
                                :menu="refinedMenu"
                                :selected="state.selectedItems"
                                searchable
                                multi-selectable
                                show-select-marker
                                show-clear-selection
                                @select="handleSelectAddFilterMenuItem"
                                @clear-selection="handleClearAddFilterMenuItems"
                                @click-show-more="handleClickShowMore"
                                @update:search-text="handleUpdateSearchText"
                />
            </div>
        </div>
    </p-field-group>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-filters {
    .filters-area {
        @apply bg-gray-100 rounded-lg flex flex-col gap-2;
        padding: 0.75rem 0.5rem;
        margin-top: 0.25rem;

        .filter-dropdown-wrapper {
            @apply relative;

            .add-filter-context-menu {
                z-index: 100;
            }
        }
    }
}
</style>
