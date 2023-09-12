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

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CostAnalysisFiltersAddMoreButton
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisFiltersAddMoreButton.vue';
import { GROUP_BY } from '@/services/cost-explorer/lib/config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';


const allReferenceStore = useAllReferenceStore();
const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const storeState = reactive({
    projects: computed(() => allReferenceStore.getters.project),
    projectGroups: computed(() => allReferenceStore.getters.projectGroup),
    providers: computed(() => allReferenceStore.getters.provider),
    serviceAccounts: computed(() => allReferenceStore.getters.serviceAccount),
});
const state = reactive({
    loading: true,
    enabledFilters: computed<MenuItem[]>(() => costAnalysisPageStore.defaultGroupByItems.filter((d) => costAnalysisPageState.enabledFiltersProperties?.includes(d.name))),
    selectedFilterableItemsMap: computed<Record<string, FilterableDropdownMenuItem[]>>(() => {
        const _selectedItems = {} as Record<string, FilterableDropdownMenuItem[]>;
        Object.entries(costAnalysisPageState.filters ?? {}).forEach(([groupBy, items]) => {
            _selectedItems[groupBy] = getRefinedMenuItems(groupBy, items.map((d) => ({ name: d, label: d })));
        });
        return _selectedItems;
    }),
});

const resourceApiQueryHelper = new ApiQueryHelper();
const fetchDistinct = getCancellableFetcher(SpaceConnector.client.addOns.autocomplete.distinct);
const getResources = async (inputText: string, distinctKey: string): Promise<{name: string; key: string}[]|undefined> => {
    resourceApiQueryHelper.setFilters([
        { k: 'data_source_id', v: costAnalysisPageStore.selectedDataSourceId ?? '', o: '=' },
    ]);
    try {
        let resourceType = 'cost_analysis.Cost';
        if (distinctKey === GROUP_BY.PROJECT_GROUP) resourceType = 'identity.ProjectGroup';
        else if (distinctKey === GROUP_BY.PROJECT) resourceType = 'identity.Project';
        const { status, response } = await fetchDistinct({
            resource_type: resourceType,
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

    const refinedMenuItems = getRefinedMenuItems(groupBy, results?.map((d) => ({ name: d.key, label: d.name })));
    return { results: refinedMenuItems };
};
const getRefinedMenuItems = (groupBy: string, results?: Array<{name: string; label: string}>): MenuItem[] => {
    if (!results) return [];
    return results.map((d) => {
        if (groupBy === GROUP_BY.PROJECT) {
            return { name: d.name, label: storeState.projects[d.name].label };
        } if (groupBy === GROUP_BY.PROJECT_GROUP) {
            return { name: d.name, label: storeState.projectGroups[d.name].label };
        } if (groupBy === GROUP_BY.PROVIDER) {
            return { name: d.name, label: storeState.providers[d.name].label };
        } if (groupBy === GROUP_BY.SERVICE_ACCOUNT) {
            return { name: d.name, label: storeState.serviceAccounts[d.name].label };
        }
        return { name: d.name, label: d.label };
    });
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

(async () => {
    await Promise.allSettled([
        allReferenceStore.load('project'),
        allReferenceStore.load('projectGroup'),
        allReferenceStore.load('provider'),
        allReferenceStore.load('serviceAccount'),
    ]);
})();
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
            :show-delete-all-button="false"
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
