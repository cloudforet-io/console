<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { sortBy } from 'lodash';

import {
    PContextMenu, PFieldGroup, PFieldTitle, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';
import type { NamespaceReferenceMap } from '@/store/reference/namespace-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import CostVariableModel from '@/lib/variable-models/managed-model/resource-model/cost-variable-model';
import MetricDataVariableModel from '@/lib/variable-models/managed-model/resource-model/metric-data-variable-model';

import {
    useCostDataSourceFilterMenuItems,
} from '@/common/composables/data-source/use-cost-data-source-filter-menu-items';
import { useProxyValue } from '@/common/composables/proxy-state';

import {
    MANAGED_DASHBOARD_GLOBAL_VARIABLES_SCHEMA,
} from '@/services/dashboards/constants/managed-dashboard-global-variables';
import type { DashboardGlobalVariableModel, ReferenceVariable } from '@/services/dashboards/types/global-variable-type';




interface Props {
    isValid: boolean;
    data: Partial<DashboardGlobalVariableModel>;
}
const props = withDefaults(defineProps<Props>(), {
    isValid: false,
});
const emit = defineEmits<{(e: 'update:is-valid', isValid: boolean): void;
    (e: 'update:data', data: Partial<DashboardGlobalVariableModel>): void;
}>();

const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    namespaces: computed<NamespaceReferenceMap>(() => allReferenceStore.getters.namespace),
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    costDataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    proxyIsValid: useProxyValue<boolean>('isValid', props, emit),
    proxyData: useProxyValue<Partial<DashboardGlobalVariableModel>>('data', props, emit),
    isAllValid: computed<boolean>(() => {
        if (state.needToSelectValuesFrom) return !!state.selectedValuesFrom;
        return true;
    }),
    needToSelectValuesFrom: computed<boolean>(() => state.selectedSourceFrom === 'asset' || state.selectedSourceFrom === 'cost'),
    dynamicGlobalVariableData: computed<Partial<DashboardGlobalVariableModel>>(() => {
        if (state.needToSelectValuesFrom) {
            const _resourceType = state.selectedSourceFrom === 'asset' ? MetricDataVariableModel.meta.resourceType : CostVariableModel.meta.resourceType;
            return {
                method: 'dynamic',
                reference: {
                    resourceType: _resourceType,
                    dataSourceId: state.selectedCostDataSourceId || state.selectedMetricId,
                    dataKey: state.selectedValuesFrom,
                },
                options: {
                    selectionType: 'multi',
                },
            };
        }
        const _targetGV: ReferenceVariable|undefined = MANAGED_DASHBOARD_GLOBAL_VARIABLES_SCHEMA[state.selectedSourceFrom];
        return {
            method: 'dynamic',
            reference: {
                resourceType: _targetGV?.reference.resourceType,
            },
            options: {
                selectionType: 'multi',
            },
        };
    }),
    sourceFromMenuItems: computed<MenuItem[]>(() => {
        const _managedGVMenuItems = Object.values(MANAGED_DASHBOARD_GLOBAL_VARIABLES_SCHEMA).map((d) => ({
            name: d.key,
            label: d.name,
        }));
        return [
            { name: 'asset', label: i18n.t('DASHBOARDS.DETAIL.VARIABLES.ASSET') },
            { name: 'cost', label: i18n.t('DASHBOARDS.DETAIL.VARIABLES.COST') },
            ..._managedGVMenuItems,
        ];
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
});
const { menuItems: costDataSourceFilterMenuItems } = useCostDataSourceFilterMenuItems({
    isAdminMode: computed(() => storeState.isAdminMode),
    costDataSource: computed(() => storeState.costDataSources[state.selectedCostDataSourceId]),
});

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

/* Watcher */
watch(() => state.dynamicGlobalVariableData, (data) => {
    state.proxyData = data;
}, { deep: true, immediate: true });
watch(() => state.isAllValid, (isValid) => {
    state.proxyIsValid = isValid;
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
                               use-fixed-menu-style
                               class="w-1/2"
                               @select="handleChangeValuesFrom"
            />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-variables-dynamic {
    @apply bg-gray-100 rounded-md;
    padding: 0.75rem 1rem;
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
