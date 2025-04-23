<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { sortBy } from 'lodash';

import {
    PContextMenu, PDivider, PFieldGroup, PFieldTitle, PRadio, PRadioGroup, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { DashboardGlobalVariable } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';
import type { NamespaceReferenceMap } from '@/store/reference/namespace-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { MENU_ID } from '@/lib/menu/config';
import CostVariableModel from '@/lib/variable-models/managed-model/resource-model/cost-variable-model';
import MetricDataVariableModel from '@/lib/variable-models/managed-model/resource-model/metric-data-variable-model';

import { useContentsAccessibility } from '@/common/composables/contents-accessibility';
import {
    useCostDataSourceFilterMenuItems,
} from '@/common/composables/data-source/use-cost-data-source-filter-menu-items';
import { useProxyValue } from '@/common/composables/proxy-state';

import {
    DASHBOARD_GLOBAL_VARIABLES_PRESET_LIST,
} from '@/services/_shared/dashboard/dashboard-detail/constants/dashboard-global-variable-preset';

const SELECTION_TYPE = {
    MULTI_SELECT: 'multi',
    SINGLE_SELECT: 'single',
} as const;
type SelectionType = typeof SELECTION_TYPE[keyof typeof SELECTION_TYPE];
type DynamicVariableData = Omit<DashboardGlobalVariable, 'management'|'key'|'name'|'method'>;
interface Props {
    isValid: boolean;
    originalData?: DashboardGlobalVariable;
    data: DynamicVariableData;
}
const props = withDefaults(defineProps<Props>(), {
    isValid: false,
    originalData: undefined,
});
const emit = defineEmits<{(e: 'update:is-valid', isValid: boolean): void;
    (e: 'update:data', data: DynamicVariableData): void;
}>();

const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();
const { visibleContents } = useContentsAccessibility(MENU_ID.ASSET_INVENTORY);

const storeState = reactive({
    namespaces: computed<NamespaceReferenceMap>(() => allReferenceStore.getters.namespace),
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    costDataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    proxyIsValid: useProxyValue<boolean>('isValid', props, emit),
    isAllValid: computed<boolean>(() => {
        if (state.needToSelectValuesFrom) return !!state.selectedValuesFrom;
        return true;
    }),
    needToSelectValuesFrom: computed<boolean>(() => state.selectedSourceFrom === 'asset' || state.selectedSourceFrom === 'cost'),
    dynamicGlobalVariableData: computed<DynamicVariableData>(() => {
        if (state.needToSelectValuesFrom) {
            const _resourceType = state.selectedSourceFrom === 'asset' ? MetricDataVariableModel.meta.resourceType : CostVariableModel.meta.resourceType;
            return {
                method: 'dynamic',
                type: 'reference',
                reference: {
                    resourceType: _resourceType,
                    dataSourceId: state.selectedCostDataSourceId || state.selectedMetricId,
                    dataKey: state.selectedValuesFrom,
                },
                options: {
                    selectionType: state.selectedSelectionType,
                },
            };
        }
        return {
            method: 'dynamic',
            type: 'reference',
            reference: {
                resourceType: state.selectedSourceFrom,
            },
            options: {
                selectionType: state.selectedSelectionType,
            },
        };
    }),
    sourceFromMenuItems: computed<MenuItem[]>(() => {
        const defaultMenuItems = [
            { name: 'cost', label: i18n.t('DASHBOARDS.DETAIL.VARIABLES.COST') },
            ...DASHBOARD_GLOBAL_VARIABLES_PRESET_LIST,
        ];
        if (visibleContents.value) {
            defaultMenuItems.unshift({ name: 'asset', label: i18n.t('DASHBOARDS.DETAIL.VARIABLES.ASSET') });
        }
        return defaultMenuItems;
    }),
    valuesFromMenuItems: computed<MenuItem[]>(() => {
        if (state.selectedSourceFrom === 'asset') {
            const _labelsInfo = storeState.metrics[state.selectedMetricId]?.data?.labels_info || [];
            return _labelsInfo.map((d) => ({ name: d.key, label: d.name }));
        }
        return costDataSourceFilterMenuItems.value;
    }),
    selectedSourceFrom: 'asset' as string|undefined,
    selectedValuesFrom: undefined as string|undefined,
    selectedSelectionType: 'single' as SelectionType,
    disableValuesFrom: computed<boolean>(() => {
        if (!state.selectedSourceFrom) return true;
        if (state.selectedSourceFrom === 'asset' && !state.selectedMetricId) return true;
        if (state.selectedSourceFrom === 'cost' && !state.selectedCostDataSourceId) return true;
        return false;
    }),
    /* Asset */
    // category
    categoryMenuItems: computed<MenuItem[]>(() => {
        const groups = Object.values(storeState.namespaces).map((d) => d.data.group);
        const _groupMenuItems: MenuItem[] = [];
        const _uniqueGroups = Array.from(new Set(groups));
        sortBy(_uniqueGroups, (group) => group !== 'common').forEach((group) => {
            if (!group) return;
            if (group === 'common') {
                _groupMenuItems.push({
                    type: 'item',
                    name: group,
                    label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COMMON'),
                });
            } else {
                // provider case
                const providerData = storeState.providers[group];
                if (providerData) {
                    _groupMenuItems.push({
                        type: 'item',
                        name: providerData.key,
                        label: providerData.label,
                        imageUrl: providerData.data.icon,
                    });
                }
            }
        });
        return _groupMenuItems.filter((d) => d.label?.toString().toLowerCase().includes(state.categorySearchText.toLowerCase()));
    }),
    categorySearchText: '',
    selectedCategory: undefined as undefined|string,
    selectedCategoryMenuItem: computed<MenuItem[]>(() => state.categoryMenuItems.filter((d) => d.name === state.selectedCategory)),
    // namespace
    namespaceMenuItems: computed<MenuItem[]>(() => {
        if (!state.selectedCategory) return [];
        return Object.values(storeState.namespaces)
            .filter((d) => d.data.group === state.selectedCategory)
            .filter((d) => d.label.toLowerCase().includes(state.namespaceSearchText.toLowerCase()))
            .map((namespace) => ({
                type: 'item',
                name: namespace.key,
                label: namespace.label,
                imageUrl: namespace.data?.icon,
            }));
    }),
    namespaceSearchText: '',
    selectedNamespaceId: undefined as undefined|string,
    selectedNamespaceMenuItem: computed<MenuItem[]>(() => state.namespaceMenuItems.filter((d) => d.name === state.selectedNamespaceId)),
    // metric
    metricMenuItems: computed<MenuItem[]>(() => {
        if (!state.selectedNamespaceId) return [];
        const _metrics = Object.values(storeState.metrics)
            .filter((d) => d.data.namespace_id === state.selectedNamespaceId)
            .filter((d) => d.label.toLowerCase().includes(state.metricSearchText.toLowerCase()));
        return _metrics.map((d) => ({
            type: 'item',
            name: d.key,
            label: d.label,
        }));
    }),
    metricSearchText: '',
    selectedMetricId: undefined as undefined|string,
    selectedMetricMenuItem: computed<MenuItem[]>(() => state.metricMenuItems.filter((d) => d.name === state.selectedMetricId)),
    /* Cost */
    costDataSourceMenuItems: computed<MenuItem[]>(() => {
        const _filteredCostDataSources = Object.values(storeState.costDataSources)
            .filter((d) => d.label.toLowerCase().includes(state.costDataSourceSearchText.toLowerCase()));
        return _filteredCostDataSources.map((d) => ({
            type: 'item',
            name: d.key,
            label: d.label,
        }));
    }),
    costDataSourceSearchText: '',
    selectedCostDataSourceId: undefined as string|undefined,
    selectedCostDataSourceMenuItem: computed<MenuItem[]>(() => state.costDataSourceMenuItems.filter((d) => d.name === state.selectedCostDataSourceId)),
});
const { allItems: costDataSourceFilterMenuItems } = useCostDataSourceFilterMenuItems({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    costDataSource: computed(() => storeState.costDataSources[state.selectedCostDataSourceId]),
});

/* Util */
const initExistingVariable = (originalData: DashboardGlobalVariable) => {
    if (originalData.method !== 'dynamic') return;
    const _reference = originalData.reference;
    if (_reference.resourceType === MetricDataVariableModel.meta.resourceType) {
        state.selectedSourceFrom = 'asset';
        state.selectedMetricId = _reference.dataSourceId || '';
        const _targetMetric = storeState.metrics[state.selectedMetricId];
        state.selectedNamespaceId = _targetMetric?.data.namespace_id || '';
        state.selectedCategory = storeState.namespaces[state.selectedNamespaceId]?.data.group;
        state.selectedValuesFrom = _reference.dataKey;
    } else if (_reference.resourceType === CostVariableModel.meta.resourceType) {
        state.selectedSourceFrom = 'cost';
        state.selectedCostDataSourceId = _reference.dataSourceId;
        state.selectedValuesFrom = _reference.dataKey;
    } else {
        state.selectedSourceFrom = _reference.resourceType;
    }
    state.selectedSelectionType = originalData.options.selectionType;
};

/* Event */
const handleChangeSourceFrom = (sourceFrom: string) => {
    if (state.selectedSourceFrom === sourceFrom) return;
    state.selectedSourceFrom = sourceFrom;
    state.selectedCategory = undefined;
    state.selectedNamespaceId = undefined;
    state.selectedMetricId = undefined;
    state.selectedCostDataSourceId = undefined;
    state.selectedValuesFrom = undefined;
};
const handleSelectCategory = (item: MenuItem) => {
    if (state.selectedCategory === item.name) return;
    state.selectedCategory = item.name;
    state.selectedNamespaceId = undefined;
    state.selectedMetricId = undefined;
    state.selectedValuesFrom = undefined;
};
const handleSelectNamespace = (item: MenuItem) => {
    if (state.selectedNamespaceId === item.name) return;
    state.selectedNamespaceId = item.name;
    state.selectedMetricId = undefined;
    state.selectedValuesFrom = undefined;
};
const handleSelectMetric = (item: MenuItem) => {
    if (state.selectedMetricId === item.name) return;
    state.selectedMetricId = item.name;
    state.selectedValuesFrom = undefined;
};
const handleSelectCostDataSource = (item: MenuItem) => {
    if (state.selectedCostDataSourceId === item.name) return;
    state.selectedCostDataSourceId = item.name;
    state.selectedValuesFrom = undefined;
};
const handleChangeValuesFrom = (valuesFrom: string) => {
    if (state.selectedValuesFrom === valuesFrom) return;
    state.selectedValuesFrom = valuesFrom;
};
const handleChangeSelectionType = (type: SelectionType) => {
    state.selectedSelectionType = type;
};

/* Watcher */
watch(() => state.dynamicGlobalVariableData, (data) => {
    emit('update:data', data);
}, { deep: true, immediate: true });
watch(() => state.isAllValid, (isValid) => {
    state.proxyIsValid = isValid;
}, { immediate: true });
watch(() => props.originalData, (originalData) => {
    if (originalData) initExistingVariable(originalData);
}, { immediate: true });
watch(() => visibleContents.value, (value) => {
    state.selectedSourceFrom = value ? 'asset' : 'cost';
}, { immediate: true });
</script>

<template>
    <div class="dashboard-variables-dynamic">
        <!-- Source From -->
        <p-field-group :label="$t('DASHBOARDS.DETAIL.VARIABLES.SOURCE_FROM')"
                       required
                       class="col-span-12"
        >
            <p-select-dropdown :selected="state.selectedSourceFrom"
                               :menu="state.sourceFromMenuItems"
                               use-fixed-menu-style
                               class="w-1/2"
                               @select="handleChangeSourceFrom"
            />
        </p-field-group>
        <!-- Select Source -->
        <div v-if="state.needToSelectValuesFrom"
             class="data-source-wrapper"
        >
            <!-- Asset Data Source -->
            <template v-if="state.selectedSourceFrom === 'asset'">
                <div class="data-source-select-col">
                    <p-field-title class="field-title"
                                   :label="i18n.t('DASHBOARDS.DETAIL.VARIABLES.CATEGORY')"
                                   required
                    />
                    <p-context-menu :menu="state.categoryMenuItems"
                                    :search-text.sync="state.categorySearchText"
                                    searchable
                                    :selected="state.selectedCategoryMenuItem"
                                    @select="handleSelectCategory"
                    >
                        <template #item--format="{ item }">
                            <div v-if="item.name === 'common'"
                                 class="flex gap-1"
                            >
                                <img src="@/assets/images/img_common-asset@2x.png"
                                     alt="common-namespace-image"
                                     class="common-category-image"
                                >
                                {{ item.label }}
                            </div>
                        </template>
                    </p-context-menu>
                </div>
                <div class="data-source-select-col">
                    <p-field-title class="field-title"
                                   :label="i18n.t('DASHBOARDS.DETAIL.VARIABLES.NAMESPACE')"
                                   required
                    />
                    <p-context-menu :menu="state.namespaceMenuItems"
                                    :search-text.sync="state.namespaceSearchText"
                                    searchable
                                    :selected="state.selectedNamespaceMenuItem"
                                    @select="handleSelectNamespace"
                    />
                </div>
                <div class="data-source-select-col">
                    <p-field-title class="field-title"
                                   :label="i18n.t('DASHBOARDS.DETAIL.VARIABLES.METRIC')"
                                   required
                    />
                    <p-context-menu :menu="state.metricMenuItems"
                                    :search-text.sync="state.metricSearchText"
                                    searchable
                                    :selected="state.selectedMetricMenuItem"
                                    @select="handleSelectMetric"
                    />
                </div>
            </template>
            <!-- Cost Data Source -->
            <div v-else-if="state.selectedSourceFrom === 'cost'"
                 class="data-source-select-col cost-data-source"
            >
                <p-field-title class="field-title"
                               :label="i18n.t('DASHBOARDS.DETAIL.VARIABLES.DATA_SOURCE')"
                               required
                />
                <p-context-menu :menu="state.costDataSourceMenuItems"
                                :search-text.sync="state.costDataSourceSearchText"
                                :selected="state.selectedCostDataSourceMenuItem"
                                searchable
                                @select="handleSelectCostDataSource"
                />
            </div>
        </div>
        <!-- Values From -->
        <p-field-group v-if="state.needToSelectValuesFrom"
                       :label="$t('DASHBOARDS.DETAIL.VARIABLES.FETCH_LIST_OF_VALUES_FROM')"
                       required
                       class="col-span-12"
        >
            <p-select-dropdown :selected="state.selectedValuesFrom"
                               :menu="state.valuesFromMenuItems"
                               :disabled="state.disableValuesFrom"
                               use-fixed-menu-style
                               class="w-1/2"
                               @select="handleChangeValuesFrom"
            />
        </p-field-group>
        <!-- Selection Type -->
        <p-divider class="divider" />
        <p-field-group :label="$t('DASHBOARDS.DETAIL.VARIABLES.SELECTION_TYPE')"
                       required
        >
            <p-radio-group>
                <p-radio :value="SELECTION_TYPE.MULTI_SELECT"
                         :selected="state.selectedSelectionType"
                         @change="handleChangeSelectionType"
                >
                    {{ $t('DASHBOARDS.DETAIL.VARIABLES.MULTI_SELECT') }}
                </p-radio>
                <p-radio :value="SELECTION_TYPE.SINGLE_SELECT"
                         :selected="state.selectedSelectionType"
                         @change="handleChangeSelectionType"
                >
                    {{ $t('DASHBOARDS.DETAIL.VARIABLES.SINGLE_SELECT') }}
                </p-radio>
            </p-radio-group>
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-variables-dynamic {
    @apply bg-gray-100 rounded-md;
    padding: 0.75rem 1rem;

    .divider {
        margin: 0.75rem 0;
    }
}
.data-source-wrapper {
    @apply bg-white rounded-md border border-gray-200 grid grid-cols-12;
    width: 100%;
    height: 22.5rem;
    margin-bottom: 1rem;
    .data-source-select-col {
        @apply border-r border-gray-200 col-span-4;
        display: flex;
        flex-direction: column;
        height: inherit;
        padding: 0.75rem 0;
        .field-title {
            padding: 0 0.75rem 0.25rem 0.75rem;
        }
        &:last-child {
            @apply border-r-0;
        }
        .common-category-image {
            width: 1rem;
            height: 1rem;
        }
        &.cost-data-source {
            @apply col-span-12;
        }
    }

    /* custom design-system component - p-context-menu */
    :deep(.p-context-menu) {
        border: none;
        overflow-y: auto;
    }
}
</style>
