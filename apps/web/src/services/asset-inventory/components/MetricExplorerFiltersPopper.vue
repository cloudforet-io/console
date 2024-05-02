<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PSelectDropdown, PTextButton } from '@spaceone/design-system';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import { cloneDeep, isEmpty } from 'lodash';

import type { MetricLabelKey } from '@/schema/inventory/metric/type';

import getRandomId from '@/lib/random-id-generator';
import { VariableModel } from '@/lib/variable-models';
import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';
import { getVariableModelMenuHandler } from '@/lib/variable-models/variable-model-menu-handler';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { MetricFilter } from '@/services/asset-inventory/types/metric-explorer-type';


const props = defineProps<{
    visible: boolean;
}>();

const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;
const state = reactive({
    loading: true,
    randomId: getRandomId(),
    enabledFilters: computed<SelectDropdownMenuItem[]>(() => metricExplorerPageGetters.refinedMetricLabelKeys.map((d) => ({
        name: d.key,
        label: d.name,
    }))),
    selectedItemsMap: {} as Record<string, SelectDropdownMenuItem[]>,
    handlerMap: computed(() => {
        const handlerMaps = {};
        metricExplorerPageGetters.refinedMetricLabelKeys.forEach((labelKey: MetricLabelKey) => {
            handlerMaps[labelKey.key] = getMenuHandler(labelKey);
        });
        return handlerMaps;
    }),
});

/* Util */
const getMenuHandler = (labelKey: MetricLabelKey): AutocompleteHandler => {
    try {
        let variableModel: VariableModel | undefined;
        if (isEmpty(labelKey.reference)) {
            variableModel = new VariableModel({
                type: 'RESOURCE_VALUE',
                resource_type: 'inventory.MetricData',
                reference_key: labelKey.key,
                name: labelKey.key,
            });
        } else {
            const _resourceType = labelKey.reference?.resource_type;
            const targetModelConfig = Object.values(MANAGED_VARIABLE_MODEL_CONFIGS)
                .find((d) => (d.resourceType === _resourceType));
            if (targetModelConfig) {
                variableModel = new VariableModel({
                    type: 'MANAGED',
                    key: targetModelConfig.key,
                });
            }
        }
        if (!variableModel) return async () => ({ results: [] });

        const handler = getVariableModelMenuHandler(variableModel);
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
    if (metricExplorerPageGetters.metricExampleId) {
        const _originalFilters = cloneDeep(metricExplorerPageGetters.metricExample?.options?.filters);
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
