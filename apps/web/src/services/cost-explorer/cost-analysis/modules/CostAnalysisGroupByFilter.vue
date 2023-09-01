<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import {
    PSelectButton, PButton, PFilterableDropdown, PBadge,
} from '@spaceone/design-system';
import type { AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';
import type { SelectDropdownMenu } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import { GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { GroupByItem } from '@/services/cost-explorer/type';


const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const { t } = useI18n();

const state = reactive({
    defaultGroupByItems: Object.values(GROUP_BY_ITEM_MAP) as GroupByItem[],
    selectedGroupByItems: computed<SelectDropdownMenu[]>(() => costAnalysisPageState.groupBy.map((d) => {
        if (GROUP_BY_ITEM_MAP[d]) return GROUP_BY_ITEM_MAP[d];
        return { name: d, label: d.split('.')[1] };
    })),
    selectedTagsMenu: [] as SelectDropdownMenu[],
    tagsDropdownVisible: false,
});

/* fetcher */
const fetchSearchResources = getCancellableFetcher<{results: {name: string; key: string}[]}>(SpaceConnector.client.addOns.autocomplete.distinct);
const getResources = async (inputText: string, distinctKey: string): Promise<{name: string; key: string}[]|undefined> => {
    try {
        const { status, response } = await fetchSearchResources({
            resource_type: 'cost_analysis.Cost',
            distinct_key: distinctKey,
            search: inputText,
            options: {
                limit: 10,
            },
        });
        if (status === 'succeed') return response.results;
    } catch (e: any) {
        ErrorHandler.handleError(e);
        return undefined;
    }
    return undefined;
};

/* util */
const tagsMenuHandler: AutocompleteHandler = async (value: string) => {
    const results = await getResources(value, 'tags');
    return { results: results ? results.map((d) => ({ name: `tags.${d.key}`, label: d.name })) : [] };
};
const predicate = (current, data) => Object.keys(current).every((key) => data && current[key] === data[key]);

/* event */
const handleSelectGroupByItems = async (items: GroupByItem[]) => {
    costAnalysisPageStore.$patch((_state) => {
        _state.groupBy = items.map((d) => d.name);
    });
};
const handleClickTagsButton = () => {
    state.tagsDropdownVisible = !state.tagsDropdownVisible;
};
const handleSelectTagsGroupBy = (selectedItem: SelectDropdownMenu) => {
    if (state.selectedGroupByItems.find((d) => d.name === selectedItem.name)) { // delete case
        costAnalysisPageStore.$patch((_state) => {
            _state.groupBy = _state.groupBy.filter((d) => d !== selectedItem.name);
        });
    } else { // add case
        if (state.selectedGroupByItems.length + 1 > 3) {
            showErrorMessage('', t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_ADD_GROUP_BY'));
            state.selectedTagsMenu = state.selectedTagsMenu.filter((d) => d.name !== selectedItem.name);
            return;
        }
        costAnalysisPageStore.$patch((_state) => {
            _state.groupBy = _state.groupBy.concat(selectedItem.name as string);
        });
    }
};
const handleClearTagsGroupBy = () => {
    costAnalysisPageStore.$patch((_state) => {
        _state.groupBy = _state.groupBy.filter((d) => !d.startsWith('tags.'));
    });
};

watch(() => costAnalysisPageState.groupBy, (groupBy) => {
    if (!groupBy) return;
    state.selectedTagsMenu = groupBy
        .filter((d) => d.startsWith('tags.'))
        .map((d) => ({ name: d, label: d.split('.')[1] })) ?? [];
});
</script>

<template>
    <div class="cost-analysis-group-by-filter">
        <b
            class="label"
        >
            {{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GROUP_BY') }}</b>
        <p-select-button v-for="defaultGroupByItem in state.defaultGroupByItems"
                         :key="defaultGroupByItem.name"
                         :value="defaultGroupByItem"
                         :selected="state.selectedGroupByItems"
                         multi-selectable
                         size="sm"
                         :predicate="predicate"
                         @change="handleSelectGroupByItems"
        >
            {{ defaultGroupByItem.label }}
        </p-select-button>
        <div class="tag-button-wrapper">
            <p-button :style-type="state.selectedTagsMenu.length ? 'highlight' : 'tertiary'"
                      size="sm"
                      :icon-right="state.tagsDropdownVisible ? 'ic_chevron-up' : 'ic_chevron-down'"
                      @click="handleClickTagsButton"
            >
                {{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.TAGS') }}
                <template v-if="state.selectedTagsMenu.length">
                    <span>:</span>
                    <span class="selected-text">{{ state.selectedTagsMenu[0].label }}</span>
                </template>
                <p-badge v-if="state.selectedTagsMenu.length > 1"
                         badge-type="solid"
                         background-color="white"
                         :text-color="gray[900]"
                         class="count-badge"
                >
                    +{{ state.selectedTagsMenu.length - 1 }}
                </p-badge>
            </p-button>
            <p-filterable-dropdown v-model:selected="state.selectedTagsMenu"
                                   v-model:visible-menu="state.tagsDropdownVisible"
                                   :handler="tagsMenuHandler"
                                   multi-selectable
                                   show-select-marker
                                   @select="handleSelectTagsGroupBy"
                                   @clear-selection="handleClearTagsGroupBy"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-group-by-filter {
    @apply flex flex-wrap bg-white rounded-md border border-gray-200;
    column-gap: 0.375rem;
    row-gap: 0.5rem;
    align-items: center;
    font-size: 0.875rem;
    padding: 1rem;
    margin-bottom: 1rem;

    .tag-button-wrapper {
        position: relative;

        /* custom design-system component - p-filterable-dropdown */
        :deep(.p-filterable-dropdown) {
            .dropdown-button {
                display: none;
            }
            .p-context-menu {
                min-width: 9rem;
            }
        }
        .selected-text {
            padding-left: 0.12rem;
            font-weight: normal;
        }
        .count-badge {
            margin-left: 0.12rem;
            font-weight: normal;
        }
    }
}
</style>
