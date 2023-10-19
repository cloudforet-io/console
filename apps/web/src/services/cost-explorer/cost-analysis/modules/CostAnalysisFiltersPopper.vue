<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PSelectDropdown, PTextButton,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
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
    enabledFilters: computed<MenuItem[]>(() => {
        if (!costAnalysisPageState.enabledFiltersProperties) return [];
        return costAnalysisPageState.enabledFiltersProperties.map((d) => {
            const targetItem = costAnalysisPageStore.defaultGroupByItems.find((item) => item.name === d);
            if (targetItem) return targetItem;
            return { name: d, label: d };
        });
    }),
    selectedFilterableItemsMap: computed<Record<string, SelectDropdownMenuItem[]>>(() => {
        const _selectedItems = {} as Record<string, SelectDropdownMenuItem[]>;
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
            ...resourceApiQueryHelper.data,
        });
        if (status) return response?.results;
        return undefined;
    } catch (e: any) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};
const menuHandler = (groupBy: string): AutocompleteHandler => async (inputValue: string, pageStart, pageLimit = 10) => {
    if (!groupBy) return { results: [] };

    state.loading = true;
    const results = await getResources('', groupBy);
    /* Get all resources without inputValue.
    * Because, results has no label to be filtered by inputValue. */
    state.loading = false;

    const refinedMenuItems = getRefinedMenuItems(groupBy, results?.map((d) => ({ name: d.key, label: d.name })));
    // filter by inputValue here.
    const refinedMenuItemsFilteredByInputValue = refinedMenuItems.filter((d) => (d.label as string).toLowerCase().includes(inputValue.toLowerCase()));
    const slicedResults = refinedMenuItemsFilteredByInputValue?.slice((pageStart ?? 1) - 1, pageLimit);
    return { results: slicedResults, more: pageLimit < refinedMenuItemsFilteredByInputValue.length };
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

const handleUpdateFiltersDropdown = (groupBy: string, selectedItems: SelectDropdownMenuItem[]) => {
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
const handleClickResetFilters = () => {
    const _originConsoleFilters: ConsoleFilter[]|undefined = costAnalysisPageStore.selectedQuerySet?.options?.filters;
    const _originFilters: Record<string, string[]> = {};
    if (_originConsoleFilters?.length) {
        _originConsoleFilters.forEach((d) => {
            _originFilters[d.k as string] = d.v as string[];
        });
    }
    costAnalysisPageStore.$patch((_state) => {
        _state.filters = _originFilters;
    });
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
        <p-select-dropdown
            v-for="groupBy in state.enabledFilters"
            :key="`filters-dropdown-${groupBy.name}`"
            class="filters-popper-dropdown"
            is-filterable
            :handler="menuHandler(groupBy.name)"
            :selected="state.selectedFilterableItemsMap[groupBy.name] ?? []"
            :loading="state.loading"
            multi-selectable
            style-type="rounded"
            appearance-type="badge"
            show-select-marker
            use-fixed-menu-style
            selection-highlight
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
