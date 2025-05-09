<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { cloneDeep, isEmpty } from 'lodash';

import { PSelectDropdown, PTextButton } from '@cloudforet/mirinae';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { MetricExampleModel } from '@/schema/inventory/metric-example/model';
import type { MetricLabelKey } from '@/schema/inventory/metric/type';

import getRandomId from '@/lib/random-id-generator';
import { VariableModelFactory } from '@/lib/variable-models';
import type { ManagedVariableModelKey } from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import {
    MANAGED_VARIABLE_MODEL_KEY_MAP,
    MANAGED_VARIABLE_MODELS,
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import type {
    VariableModelMenuHandlerInfo,
} from '@/lib/variable-models/variable-model-menu-handler';
import {
    getVariableModelMenuHandler,
} from '@/lib/variable-models/variable-model-menu-handler';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { PROJECT_GROUP_LABEL_INFO } from '@/services/asset-inventory/constants/asset-analysis-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { MetricFilter } from '@/services/asset-inventory/types/asset-analysis-type';



const props = defineProps<{
    visible: boolean;
}>();

const route = useRoute();
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;
const state = reactive({
    currentMetricExampleId: computed<string|undefined>(() => route.params.metricExampleId),
    currentMetricExample: computed<MetricExampleModel|undefined>(() => metricExplorerPageState.metricExamples.find((d) => d.example_id === state.currentMetricExampleId)),
    loading: true,
    randomId: getRandomId(),
    refinedMetricLabelKeysWithProjectGroup: computed<MetricLabelKey[]>(() => {
        const _labelKeys = cloneDeep(metricExplorerPageGetters.refinedMetricLabelKeys);
        const _projectLabelInfoIndex = _labelKeys.findIndex((d) => d.key === 'project_id');
        if (_projectLabelInfoIndex > -1) {
            _labelKeys.splice(_projectLabelInfoIndex, 0, PROJECT_GROUP_LABEL_INFO);
        }
        return _labelKeys;
    }),
    enabledFilters: computed<SelectDropdownMenuItem[]>(() => state.refinedMetricLabelKeysWithProjectGroup.map((d) => ({
        name: d.key,
        label: d.name,
    }))),
    selectedItemsMap: {} as Record<string, SelectDropdownMenuItem[]>,
    primaryMetricStatOptions: computed<Record<string, any>>(() => ({
        metric_id: route.params.metricId,
    })),
    handlerMap: computed(() => {
        const handlerMaps = {};
        state.refinedMetricLabelKeysWithProjectGroup.forEach((labelKey: MetricLabelKey) => {
            handlerMaps[labelKey.key] = getMenuHandler(labelKey, state.primaryMetricStatOptions);
        });
        return handlerMaps;
    }),
});

/* Util */
const getMenuHandler = (labelKey: MetricLabelKey, listQueryOptions: Record<string, any>): AutocompleteHandler => {
    try {
        let variableModelInfo: VariableModelMenuHandlerInfo;
        let _queryOptions: Record<string, any> = {};
        if (labelKey.key === MANAGED_VARIABLE_MODELS.workspace.meta.idKey) {
            _queryOptions.is_dormant = false;
        }
        if (isEmpty(labelKey.reference)) {
            const MetricVariableModel = new VariableModelFactory(
                { type: 'MANAGED', managedModelKey: MANAGED_VARIABLE_MODEL_KEY_MAP.metric_data },
            );
            MetricVariableModel[labelKey.key] = MetricVariableModel.generateProperty({ key: labelKey.key });
            variableModelInfo = {
                variableModel: MetricVariableModel,
                dataKey: labelKey.key,
            };
            _queryOptions = { ..._queryOptions, ...listQueryOptions };
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
        const handler = getVariableModelMenuHandler([variableModelInfo], _queryOptions);
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
const initSelectedFilters = (filters: MetricFilter) => {
    const _selectedItemsMap = {};
    Object.keys(filters ?? {}).forEach((groupBy) => {
        _selectedItemsMap[groupBy] = filters?.[groupBy].map((d) => ({ name: d })) ?? [];
    });
    state.selectedItemsMap = _selectedItemsMap;
};

/* Event */
const handleUpdateFiltersDropdown = (groupBy: string, selectedItems: SelectDropdownMenuItem[]) => {
    const selectedItemsMap = cloneDeep(state.selectedItemsMap);
    selectedItemsMap[groupBy] = selectedItems;
    state.selectedItemsMap = selectedItemsMap;

    metricExplorerPageStore.setFilters({
        ...metricExplorerPageState.filters,
        [groupBy]: selectedItems.map((d) => d.name as string),
    });
};
const handleClickResetFilters = () => {
    if (state.currentMetricExampleId) {
        const _originalFilters = cloneDeep(state.currentMetricExample?.options?.filters);
        initSelectedFilters(_originalFilters);
        metricExplorerPageStore.setFilters(_originalFilters);
    } else {
        metricExplorerPageStore.setFilters({});
        state.selectedItemsMap = {};
    }
    state.randomId = getRandomId();
};

watch(() => props.visible, (visible) => {
    if (!visible) return;
    initSelectedFilters(metricExplorerPageState.filters);
}, { immediate: true });

</script>

<template>
    <div class="metric-explorer-filters-popper">
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
            :init-selected-with-handler="props.visible"
            :selection-label="groupBy.label"
            :show-delete-all-button="false"
            :page-size="10"
            @update:selected="handleUpdateFiltersDropdown(groupBy.name, $event)"
        />
        <p-text-button icon-left="ic_refresh"
                       style-type="highlight"
                       class="reset-button"
                       @click="handleClickResetFilters"
        >
            {{ $t('INVENTORY.METRIC_EXPLORER.RESET') }}
        </p-text-button>
    </div>
</template>

<style lang="postcss" scoped>
.metric-explorer-filters-popper {
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
}
</style>
