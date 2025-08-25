<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { startCase, toLower } from 'lodash';

import {
    PDivider, PFieldGroup, PRadio, PRadioGroup, PSelectDropdown, PLazyImg,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { DashboardGlobalVariable } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { useResourceMenuHandlerMap } from '@/query/resource-query/resource-menu-handler';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';


import { MENU_ID } from '@/lib/menu/config';
import CostVariableModel from '@/lib/variable-models/managed-model/resource-model/cost-variable-model';
import MetricDataVariableModel from '@/lib/variable-models/managed-model/resource-model/metric-data-variable-model';

import DataSelector from '@/common/components/select/DataSelector.vue';
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
interface Emits {
    (e: 'update:is-valid', isValid: boolean): void;
    (e: 'update:data', data: DynamicVariableData): void;
}
const props = withDefaults(defineProps<Props>(), {
    isValid: false,
    originalData: undefined,
});
const emit = defineEmits<Emits>();

const appContextStore = useAppContextStore();
const { visibleContents } = useContentsAccessibility(MENU_ID.ASSET_INVENTORY);

const referenceMap = useAllReferenceDataModel();
const costDataSourceMap = referenceMap.costDataSource;
const metricMap = referenceMap.metric;
const providerMap = referenceMap.provider;
const namespaceMap = referenceMap.namespace;

const resourceMenuHandlerMap = useResourceMenuHandlerMap();


const menuHandlerState = reactive({
    dataSourceMenuHandler: resourceMenuHandlerMap.costDataSource(),
    categoryMenuHandler: computed(() => resourceMenuHandlerMap.namespace({
        dataKey: 'group',
        menuFilters: [{
            k: 'category',
            v: 'ASSET',
            o: '=',
        }],
    })),
    namespaceMenuHandler: computed(() => (state.selectedCategory ? resourceMenuHandlerMap.namespace({
        menuFilters: [{
            k: 'group',
            v: state.selectedCategory,
            o: '=',
        }],
    }) : undefined)),
    metricMenuHandler: computed(() => (state.selectedNamespaceId ? resourceMenuHandlerMap.metric({
        menuFilters: [{
            k: 'namespace_id',
            v: state.selectedNamespaceId,
            o: '=',
        }],
    }) : undefined)),
});
const customSnakeToTitleCase = (title: string) => startCase(toLower(title.replace(/_/g, ' ')));


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
            const _labelsInfo = metricMap[state.selectedMetricId]?.data?.labels_info || [];
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
    categorySearchText: '',
    selectedCategory: undefined as undefined|string,
    // namespace
    namespaceSearchText: '',
    selectedNamespaceId: undefined as undefined|string,
    // metric
    metricSearchText: '',
    selectedMetricId: undefined as undefined|string,
    /* Cost */
    costDataSourceSearchText: '',
    selectedCostDataSourceId: undefined as string|undefined,
});

const { allItems: costDataSourceFilterMenuItems } = useCostDataSourceFilterMenuItems({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    costDataSource: computed(() => costDataSourceMap[state.selectedCostDataSourceId]),
});

/* Util */
const initExistingVariable = (originalData: DashboardGlobalVariable) => {
    if (originalData.method !== 'dynamic') return;
    const _reference = originalData.reference;
    if (_reference.resourceType === MetricDataVariableModel.meta.resourceType) {
        state.selectedSourceFrom = 'asset';
        state.selectedMetricId = _reference.dataSourceId || '';
        const _targetMetric = metricMap[state.selectedMetricId];
        state.selectedNamespaceId = _targetMetric?.data?.namespace_id || '';
        state.selectedCategory = namespaceMap[state.selectedNamespaceId]?.data?.group || '';
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
const handleSelectCategory = (item: MenuItem[]) => {
    if (state.selectedCategory === item?.[0]?.name) return;
    state.selectedCategory = item?.[0]?.name;
    state.selectedNamespaceId = undefined;
    state.selectedMetricId = undefined;
    state.selectedValuesFrom = undefined;
};
const handleSelectNamespace = (item: MenuItem[]) => {
    if (state.selectedNamespaceId === item?.[0]?.name) return;
    state.selectedNamespaceId = item?.[0]?.name;
    state.selectedMetricId = undefined;
    state.selectedValuesFrom = undefined;
};
const handleSelectMetric = (item: MenuItem[]) => {
    if (state.selectedMetricId === item?.[0]?.name) return;
    state.selectedMetricId = item?.[0]?.name;
    state.selectedValuesFrom = undefined;
};
const handleSelectCostDataSource = (item: MenuItem[]) => {
    if (state.selectedCostDataSourceId === item?.[0]?.name) return;
    state.selectedCostDataSourceId = item?.[0]?.name;
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
                    <data-selector class="h-full"
                                   :label="i18n.t('DASHBOARDS.DETAIL.VARIABLES.CATEGORY')"
                                   :handler="menuHandlerState.categoryMenuHandler"
                                   @update:selected="handleSelectCategory"
                    >
                        <template #menu-item--format="{item}">
                            <div v-if="item.name === 'common'"
                                 class="flex gap-1"
                            >
                                <img src="@/assets/images/img_common-asset@2x.png"
                                     alt="common-namespace-image"
                                     class="category-image"
                                >
                                {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COMMON') }}
                            </div>
                            <div v-else
                                 class="inline-flex gap-1"
                            >
                                <p-lazy-img :src="providerMap[item.name]?.data?.icon"
                                            :alt="item.label"
                                            width="1rem"
                                            height="1rem"
                                            class="category-image"
                                />
                                {{ providerMap[item.name]?.label || customSnakeToTitleCase(item.name) }}
                            </div>
                        </template>
                    </data-selector>
                </div>
                <div class="data-source-select-col">
                    <data-selector :key="state.selectedCategory"
                                   class="h-full"
                                   :label="i18n.t('DASHBOARDS.DETAIL.VARIABLES.NAMESPACE')"
                                   :handler="menuHandlerState.namespaceMenuHandler"
                                   @update:selected="handleSelectNamespace"
                    >
                        <template #menu-item--format="{item}">
                            <div class="inline-flex gap-1">
                                <img v-if="item.data.group === 'common'"
                                     src="@/assets/images/img_common-asset@2x.png"
                                     alt="common-namespace-image"
                                     class="category-image"
                                >
                                <p-lazy-img v-else
                                            :src="item.data?.icon"
                                            :alt="item.label"
                                            width="1rem"
                                            height="1rem"
                                            class="category-image"
                                />
                                {{ item.label }}
                            </div>
                        </template>
                    </data-selector>
                </div>
                <div class="data-source-select-col">
                    <data-selector :key="state.selectedNamespaceId"
                                   class="h-full"
                                   :label="i18n.t('DASHBOARDS.DETAIL.VARIABLES.METRIC')"
                                   :handler="menuHandlerState.metricMenuHandler"
                                   @update:selected="handleSelectMetric"
                    />
                </div>
            </template>
            <!-- Cost Data Source -->
            <div v-else-if="state.selectedSourceFrom === 'cost'"
                 class="data-source-select-col cost-data-source"
            >
                <data-selector class="h-full"
                               :label="i18n.t('DASHBOARDS.DETAIL.VARIABLES.DATA_SOURCE')"
                               :handler="menuHandlerState.dataSourceMenuHandler"
                               @update:selected="handleSelectCostDataSource"
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
    height: 24rem;
    margin-bottom: 1rem;
    .data-source-select-col {
        @apply border-r border-gray-200 col-span-4;
        display: flex;
        flex-direction: column;
        height: 24rem;
        overflow-y: hidden;
        padding: 0.75rem 0;
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
}

.category-image {
    width: 1rem;
    height: 1rem;
}
</style>
