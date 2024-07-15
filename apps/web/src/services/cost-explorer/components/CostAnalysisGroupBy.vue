<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { xor } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import {
    PSelectButton, PSelectDropdown,
} from '@cloudforet/mirinae';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { showInfoMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';


interface GroupBySelectButtonItem {
    name: string;
    label: string;
}

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageGetters = costAnalysisPageStore.getters;
const costAnalysisPageState = costAnalysisPageStore.state;

const state = reactive({
    groupByItems: computed<SelectDropdownMenuItem[]>(() => [...costAnalysisPageGetters.managedGroupByItems, ...state.selectedAdditionalGroupByMenu]),
    selectedGroupByItems: computed<SelectDropdownMenuItem[]>(() => costAnalysisPageState.groupBy.map((d) => {
        if (GROUP_BY_ITEM_MAP[d]) return GROUP_BY_ITEM_MAP[d];
        return { name: d, label: d.split('.')[1] };
    })),
    selectedTagsMenu: [] as SelectDropdownMenuItem[],
    selectedAdditionalGroupByMenu: [] as SelectDropdownMenuItem[],
    dataSourceId: computed<string>(() => costAnalysisPageGetters.selectedDataSourceId ?? ''),
});

/* fetcher */
const resourceQueryHelper = new QueryHelper();
const fetchSearchResources = getCancellableFetcher<object, {results: {name: string; key: string}[]}>(SpaceConnector.client.addOns.autocomplete.distinct);
const getResources = async (inputText: string, distinctKey: string): Promise<{name: string; key: string}[]|undefined> => {
    try {
        resourceQueryHelper.setFilters([{ k: 'data_source_id', v: [state.dataSourceId], o: '=' }]);
        const { status, response } = await fetchSearchResources({
            resource_type: 'cost_analysis.Cost',
            distinct_key: distinctKey,
            search: inputText,
            options: {
                limit: 10,
                filter: resourceQueryHelper.apiQuery.filter,
            },
        });
        if (status === 'succeed') return response.results;
        return undefined;
    } catch (e: any) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};

/* util */
const tagsMenuHandler: AutocompleteHandler = async (value: string) => {
    const results = await getResources(value, 'tags');
    return { results: results ? results.map((d) => ({ name: `tags.${d.key}`, label: d.name })) : [] };
};
const predicate = (current, data) => Object.keys(current).every((key) => data && current[key] === data[key]);
const setSelectedTagsMenu = (groupBy?: string[]) => {
    if (!groupBy) return;
    state.selectedTagsMenu = groupBy
        .filter((d) => d.startsWith('tags.'))
        .map((d) => ({ name: d, label: d.split('.')[1] })) ?? [];
};
const setSelectedAdditionalInfoGroupBy = (groupBy?: string[]) => {
    if (!groupBy) return;
    state.selectedAdditionalGroupByMenu = groupBy
        .filter((d) => d.startsWith('additional_info.'))
        .map((d) => ({ name: d, label: d.split('.')[1] })) ?? [];
};

/* event */
const handleChangeDefaultGroupBy = async (selectedItems: GroupBySelectButtonItem[], isSelected: boolean) => {
    if (isSelected && state.selectedGroupByItems.length >= 3) {
        showInfoMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_ADD_GROUP_BY'), i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_ADD_GROUP_BY_DESC'));
        return;
    }
    if (isSelected) {
        const addedGroupByName: string = xor(costAnalysisPageState.groupBy, selectedItems.map((d) => d.name))[0];
        costAnalysisPageStore.setGroupBy([addedGroupByName, ...costAnalysisPageState.groupBy]);
        costAnalysisPageStore.setChartGroupBy(addedGroupByName);
    } else {
        costAnalysisPageStore.setGroupBy(selectedItems.map((d) => d.name));
    }
};
const handleSelectAdditionalGroupBy = (target: string, selectedItem: SelectDropdownMenuItem, isSelected: boolean) => {
    if (isSelected) {
        if (state.selectedGroupByItems.length + 1 > 3) {
            showInfoMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_ADD_GROUP_BY'), i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_ADD_GROUP_BY_DESC'));
            if (target === 'tags') {
                state.selectedTagsMenu = state.selectedTagsMenu.filter((d) => d.name !== selectedItem.name);
            } else if (target === 'additional') {
                state.selectedAdditionalGroupByMenu = state.selectedAdditionalGroupByMenu.filter((d) => d.name !== selectedItem.name);
            }
            return;
        }
        costAnalysisPageStore.setGroupBy([selectedItem.name, ...costAnalysisPageState.groupBy]);
        costAnalysisPageStore.setChartGroupBy(selectedItem.name);
    } else {
        costAnalysisPageStore.setGroupBy(costAnalysisPageState.groupBy.filter((d) => d !== selectedItem.name));
    }
};
const handleClearTagsGroupBy = () => {
    costAnalysisPageStore.setGroupBy(costAnalysisPageState.groupBy.filter((d) => !d.startsWith('tags.')));
};

/* Watcher */
watch(() => costAnalysisPageState.groupBy, (groupBy) => {
    setSelectedTagsMenu(groupBy);
    setSelectedAdditionalInfoGroupBy(groupBy);
});
</script>

<template>
    <div class="cost-analysis-group-by">
        <b class="label">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GROUP_BY') }}:</b>
        <p class="count-text">
            <span class="selected-group-by-items-count">{{ state.selectedGroupByItems.length }}</span>
            <span>/3</span>
        </p>
        <p-select-button v-for="defaultGroupByItem in state.groupByItems"
                         :key="defaultGroupByItem.name"
                         :value="defaultGroupByItem"
                         :selected="state.selectedGroupByItems"
                         multi-selectable
                         size="sm"
                         :predicate="predicate"
                         @change="handleChangeDefaultGroupBy"
        >
            {{ defaultGroupByItem.label }}
        </p-select-button>
        <div class="tags-button-wrapper">
            <p-select-dropdown :handler="tagsMenuHandler"
                               :selected.sync="state.selectedTagsMenu"
                               selection-label="Tags"
                               appearance-type="badge"
                               size="sm"
                               :show-delete-all-button="false"
                               multi-selectable
                               selection-highlight
                               show-select-marker
                               is-filterable
                               @select="handleSelectAdditionalGroupBy('tags', ...arguments)"
                               @clear-selection="handleClearTagsGroupBy"
            />
        </div>
        <p-select-dropdown v-if="costAnalysisPageGetters.additionalInfoGroupByItems.length"
                           :menu="costAnalysisPageGetters.additionalInfoGroupByItems"
                           :selected.sync="state.selectedAdditionalGroupByMenu"
                           style-type="tertiary-icon-button"
                           button-icon="ic_ellipsis-horizontal"
                           size="sm"
                           multi-selectable
                           selection-highlight
                           show-select-marker
                           @select="handleSelectAdditionalGroupBy('additional', ...arguments)"
        />
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-group-by {
    @apply flex flex-wrap;
    column-gap: 0.375rem;
    row-gap: 0.5rem;
    align-items: center;
    font-size: 0.875rem;
    padding: 1rem 0;

    .count-text {
        @apply text-label-lg text-gray-500;
        .selected-group-by-items-count {
            @apply text-gray-900;
        }
    }
    .tags-button-wrapper {
        position: relative;

        /* custom design-system component - p-select-dropdown */
        :deep(.p-select-dropdown) {
            .dropdown-button-component {
                &.selected {
                    .dropdown-button {
                        @apply bg-secondary border-secondary text-white;
                        .p-badge {
                            @apply bg-white text-gray-800;
                            margin-left: 0.375rem;
                        }
                        .selection-wrapper, .arrow-button {
                            @apply text-white;
                        }
                    }
                }
            }
        }
    }
}
</style>
