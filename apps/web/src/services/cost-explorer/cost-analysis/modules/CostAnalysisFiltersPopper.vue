<script setup lang="ts">
import {
    reactive,
} from 'vue';

import {
    PFilterableDropdown,
} from '@spaceone/design-system';
import type {
    AutocompleteHandler, FilterableDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';


const costAnalysisPageStore = useCostAnalysisPageStore();

const state = reactive({
    loading: true,
    selectedItems: {} as Record<string, FilterableDropdownMenuItem[]>,
});

const resourceApiQueryHelper = new ApiQueryHelper();
const fetchDistinct = getCancellableFetcher(SpaceConnector.client.addOns.autocomplete.distinct);
const getResources = async (inputText: string, distinctKey: string): Promise<{name: string; key: string}[]|void> => {
    resourceApiQueryHelper.setFilters([
        { k: 'data_source_id', v: costAnalysisPageStore.selectedDataSourceId ?? '', o: '=' },
    ]);
    try {
        const { status, response } = await fetchDistinct({
            resource_type: 'cost_analysis.Cost',
            distinct_key: distinctKey,
            search: inputText,
            options: {
                limit: 10,
            },
            ...resourceApiQueryHelper.data,
        });
        if (status) return response.results;
        return undefined;
    } catch (e: any) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};
const menuHandler = (groupBy: string): AutocompleteHandler => async (value: string) => {
    if (!groupBy) return { results: [] };

    state.loading = true;
    const results = await getResources(value, groupBy);
    state.loading = false;

    return { results: results ? results.map((d) => ({ name: d.key, label: d.name })) : [] };
};

const handleUpdateSelected = (groupBy: string, selectedItems: FilterableDropdownMenuItem[]) => {
    state.selectedItems[groupBy] = selectedItems;
    costAnalysisPageStore.$patch((_state) => {
        _state.filters[groupBy] = selectedItems.map((d) => d.name as string);
        _state.filters = { ..._state.filters };
    });
};
</script>

<template>
    <div class="cost-analysis-filters-popper">
        <p-filterable-dropdown
            v-for="groupBy in costAnalysisPageStore.defaultGroupByItems"
            :key="`filters-dropdown-${groupBy.name}`"
            :group-by="groupBy.name"
            :handler="menuHandler(groupBy.name)"
            :selected="state.selectedItems[groupBy.name] ?? []"
            :loading="state.loading"
            multi-selectable
            style-type="rounded"
            appearance-type="badge"
            show-select-marker
            selection-highlight
            :selection-label="groupBy.label"
            @update:selected="handleUpdateSelected(groupBy.name, $event)"
        />
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-filters-popper {
    /* custom design-system component - p-filterable-dropdown */
    :deep(.p-filterable-dropdown) {
        display: inline-block;
        width: auto;
        max-width: 22.5rem;
        padding: 0.25rem;
        .dropdown-context-menu {
            min-width: 10rem;
        }
    }
}
</style>
