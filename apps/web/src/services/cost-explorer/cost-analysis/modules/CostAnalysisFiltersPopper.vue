<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PFilterableDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type {
    AutocompleteHandler, FilterableDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CostAnalysisFiltersAddMoreButton
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisFiltersAddMoreButton.vue';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';


const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const state = reactive({
    loading: true,
    enabledFilters: computed<MenuItem[]>(() => costAnalysisPageStore.defaultGroupByItems.filter((d) => costAnalysisPageState.enabledFiltersProperties?.includes(d.name))),
    selectedFilterableItemsMap: computed<Record<string, FilterableDropdownMenuItem[]>>(() => {
        const _selectedItems = {} as Record<string, FilterableDropdownMenuItem[]>;
        Object.entries(costAnalysisPageState.filters ?? {}).forEach(([groupBy, items]) => {
            _selectedItems[groupBy] = items.map((d) => ({ name: d, label: d }));
        });
        return _selectedItems;
    }),
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

const handleUpdateFiltersDropdown = (groupBy: string, selectedItems: FilterableDropdownMenuItem[]) => {
    costAnalysisPageStore.$patch((_state) => {
        _state.filters = {
            ..._state.filters,
            [groupBy]: selectedItems.map((d) => d.name as string),
        };
    });
};
const handleDisabledFilters = (all?: boolean, disabledFilter?: string) => {
    if (all) {
        costAnalysisPageStore.$patch((_state) => {
            _state.filters = {};
        });
    } else if (disabledFilter) {
        costAnalysisPageStore.$patch((_state) => {
            delete _state.filters?.[disabledFilter];
            _state.filters = { ..._state.filters };
        });
    }
};
</script>

<template>
    <div class="cost-analysis-filters-popper">
        <p-filterable-dropdown
            v-for="groupBy in state.enabledFilters"
            :key="`filters-dropdown-${groupBy.name}`"
            :group-by="groupBy.name"
            :handler="menuHandler(groupBy.name)"
            :selected="state.selectedFilterableItemsMap[groupBy.name] ?? []"
            :loading="state.loading"
            multi-selectable
            style-type="rounded"
            appearance-type="badge"
            show-select-marker
            selection-highlight
            :selection-label="groupBy.label"
            @update:selected="handleUpdateFiltersDropdown(groupBy.name, $event)"
        />
        <cost-analysis-filters-add-more-button @disable-filter="handleDisabledFilters(false, $event)"
                                               @disable-all-filters="handleDisabledFilters(true, $event)"
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
        .dropdown-button {
            height: 1.5rem;
        }
        .dropdown-context-menu {
            min-width: 12rem;
        }
    }
}
</style>
