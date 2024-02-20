<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PSelectDropdown, PTextButton,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import { cloneDeep } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import { VariableModel } from '@/lib/variable-models';
import type {
    ManagedVariableModelKey,
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import {
    MANAGED_VARIABLE_MODEL_CONFIGS,
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import { getVariableModelMenuHandler } from '@/lib/variable-models/variable-model-menu-handler';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CostAnalysisFiltersAddMoreButton
    from '@/services/cost-explorer/components/CostAnalysisFiltersAddMoreButton.vue';
import { GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageGetters = costAnalysisPageStore.getters;
const costAnalysisPageState = costAnalysisPageStore.state;

const GROUP_BY_TO_VAR_MODELS: Record<string, VariableModel[]> = {
    [GROUP_BY.WORKSPACE]: [new VariableModel({ type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.workspace.key })],
    [GROUP_BY.PROJECT]: [new VariableModel({ type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.project.key })],
    [GROUP_BY.PROJECT_GROUP]: [new VariableModel({ type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.project_group.key })],
    // TODO: cost_product, cost_usage_type
    // [GROUP_BY.PRODUCT]: [new VariableModel({ type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_product.key })],
    [GROUP_BY.PROVIDER]: [new VariableModel({ type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.provider.key })],
    [GROUP_BY.SERVICE_ACCOUNT]: [new VariableModel({ type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.service_account.key })],
    [GROUP_BY.REGION]: [new VariableModel({ type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.region.key })],
    // [GROUP_BY.USAGE_TYPE]: [new VariableModel({ type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.cost_usage_type.key })],
};

const getInitialSelectedItemsMap = (): Record<string, SelectDropdownMenuItem[]> => ({
});

const props = defineProps<{
    visible: boolean;
}>();

const state = reactive({
    loading: true,
    enabledFilters: computed<SelectDropdownMenuItem[]>(() => {
        if (!costAnalysisPageState.enabledFiltersProperties) return [];
        return costAnalysisPageState.enabledFiltersProperties.map((d) => {
            // NOTE: only for project group case (not in group by but in filters)
            if (d === GROUP_BY.PROJECT_GROUP) return { name: d, label: 'Project Group' };
            // other cases
            const targetItem = costAnalysisPageGetters.defaultGroupByItems.find((item) => item.name === d);
            if (targetItem) return targetItem;
            return { name: d, label: d };
        });
    }),
    listQueryOptions: computed<Partial<Record<ManagedVariableModelKey, any>>>(() => ({
        cost_data_source: costAnalysisPageGetters.selectedDataSourceId,
    })),
    selectedItemsMap: getInitialSelectedItemsMap() as Record<string, SelectDropdownMenuItem[]>,
    handlerMap: computed(() => {
        const handlerMaps = {};
        state.enabledFilters.forEach(({ name }) => {
            handlerMaps[name] = getMenuHandler(name, state.listQueryOptions);
        });
        return handlerMaps;
    }),
});

const getMenuHandler = (groupBy: string, listQueryOptions: Partial<Record<ManagedVariableModelKey, any>>): AutocompleteHandler => {
    try {
        let variableModels: VariableModel|VariableModel[] = GROUP_BY_TO_VAR_MODELS[groupBy];
        if (!variableModels) {
            variableModels = new VariableModel(({
                type: 'RESOURCE',
                resource_type: 'cost_analysis.Cost',
                reference_key: groupBy,
                name: groupBy,
            }));
        }
        const handler = getVariableModelMenuHandler(variableModels, listQueryOptions);

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

const handleUpdateFiltersDropdown = (groupBy: string, selectedItems: SelectDropdownMenuItem[]) => {
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
    state.selectedItemsMap = getInitialSelectedItemsMap();

    const _originConsoleFilters: ConsoleFilter[]|undefined = costAnalysisPageGetters.selectedQuerySet?.options?.filters;
    const _originFilters: Record<string, string[]> = {};
    if (_originConsoleFilters?.length) {
        _originConsoleFilters.forEach((d) => {
            _originFilters[d.k as string] = d.v as string[];
        });
    }
    costAnalysisPageStore.setFilters(_originFilters);
};

watch(() => props.visible, (visible) => {
    if (!visible) return;
    const filters = costAnalysisPageState.filters;
    const selectedItemsMap = {};
    Object.keys(filters ?? {}).forEach((groupBy) => {
        selectedItemsMap[groupBy] = filters?.[groupBy].map((d) => ({ name: d })) ?? [];
    });
    state.selectedItemsMap = selectedItemsMap;
}, { immediate: true });

</script>

<template>
    <div class="cost-analysis-filters-popper">
        <p-select-dropdown
            v-for="groupBy in state.enabledFilters"
            :key="`filters-dropdown-${groupBy.name}`"
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
        />
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
