<template>
    <div>
        <p-search-dropdown v-model="searchTerm"
                           :menu="menuItems"
                           :selected="selectedItems"
                           multi-selectable
                           use-fixed-menu-style
                           :exact-mode="false"
                           :handler="type === CLOUD_SERVICE_FILTER_KEY.REGION ? regionMenuHandler : undefined"
                           @update:selected="handleSelectMenuItem"
                           @search="handleSearch"
        >
            <template v-if="type === CLOUD_SERVICE_FILTER_KEY.REGION" #menu-item--format="{item}">
                <div class="region-list-text">
                    <div class="region-type">
                        <text-highlighting class="region-provider" :style="{color: item.color}"
                                           :text="providers[item.provider] ? providers[item.provider].label : item.provider"
                                           :term="searchTerm"
                                           style-type="secondary"
                        />
                        <text-highlighting :text="item.regionName"
                                           :term="searchTerm"
                                           style-type="secondary"
                        />
                    </div>
                    <text-highlighting class="region-code"
                                       :text="item.continent"
                                       :term="searchTerm"
                                       style-type="secondary"
                    />
                </div>
            </template>
        </p-search-dropdown>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';

import {
    PSearchDropdown,
} from '@spaceone/design-system';
import {
    SearchDropdownMenuItem,
} from '@spaceone/design-system/dist/src/inputs/dropdown/search-dropdown/type';

import { store } from '@/store';
import { CLOUD_SERVICE_CATEGORY, CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/cloud-service/lib/config';
import { SortedRegionReferenceItem } from '@/store/modules/reference/region/type';
import { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import TextHighlighting from '@/common/components/text/text-highlighting/TextHighlighting.vue';
import { getTextHighlightRegex } from '@/common/components/text/text-highlighting/helper';

const categoryItems = [
    { name: CLOUD_SERVICE_CATEGORY.COMPUTE, label: CLOUD_SERVICE_CATEGORY.COMPUTE },
    { name: CLOUD_SERVICE_CATEGORY.CONTAINER, label: CLOUD_SERVICE_CATEGORY.CONTAINER },
    { name: CLOUD_SERVICE_CATEGORY.DATABASE, label: CLOUD_SERVICE_CATEGORY.DATABASE },
    { name: CLOUD_SERVICE_CATEGORY.NETWORKING, label: CLOUD_SERVICE_CATEGORY.NETWORKING },
    { name: CLOUD_SERVICE_CATEGORY.STORAGE, label: CLOUD_SERVICE_CATEGORY.STORAGE },
    { name: CLOUD_SERVICE_CATEGORY.SECURITY, label: CLOUD_SERVICE_CATEGORY.SECURITY },
    { name: CLOUD_SERVICE_CATEGORY.ANALYTICS, label: CLOUD_SERVICE_CATEGORY.ANALYTICS },
    { name: CLOUD_SERVICE_CATEGORY.APPLICATION_INTEGRATION, label: CLOUD_SERVICE_CATEGORY.APPLICATION_INTEGRATION },
    { name: CLOUD_SERVICE_CATEGORY.MANAGEMENT, label: CLOUD_SERVICE_CATEGORY.MANAGEMENT },
];

interface RegionMenuItem extends SearchDropdownMenuItem {
    name: string;
    label: string;
    regionName: string;
    provider: string;
    color: string;
    continent: string;
}

interface AutocompleteResult<Data> {
    name: string;
    key: string;
    data?: Data;
}

type RegionAutocompleteResult = AutocompleteResult<{
    provider: string;
}>


interface Props {
    type: string;
    selected: string[];
    provider: string;
}

export default defineComponent<Props>({
    name: 'CloudServiceFilterSearchDropdown',
    components: {
        TextHighlighting,
        PSearchDropdown,
    },
    props: {
        type: {
            type: String,
            default: undefined,
        },
        selected: {
            type: Array,
            default: () => ([]),
        },
        provider: {
            type: String,
            default: 'all',
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            searchTerm: '',
            selectedItems: computed<SearchDropdownMenuItem[]>(() => props.selected.map(selectedName => ({
                name: selectedName,
                label: state.menuItems.find(d => d.name === selectedName)?.label || selectedName,
            }))),
            providers: computed<ProviderReferenceMap>(() => store.state.reference.provider.items),
            sortedRegions: computed<SortedRegionReferenceItem[]>(() => store.getters['reference/region/regionsSortedByProvider']),
            regionItems: computed<RegionMenuItem[]>(() => state.sortedRegions.map((d) => {
                const continentLabel = d.continent?.continent_label;
                const provider = state.providers[d.data.provider];
                return {
                    name: d.id,
                    label: `${provider?.label} ${d.name} ${continentLabel}`,
                    regionName: d.name,
                    provider: d.data.provider,
                    color: provider?.color,
                    continentLabel,
                };
            })),
            menuItems: computed(() => {
                if (props.type === CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY) {
                    return categoryItems;
                } if (props.type === CLOUD_SERVICE_FILTER_KEY.REGION) {
                    return state.regionItems;
                }
                return [];
            }),
            menuLoading: false,
        });
        const regionMenuHandler = (inputText: string, list: RegionMenuItem[]) => {
            const trimmed = inputText?.trim();
            let results: RegionMenuItem[] = [...list];
            if (trimmed) {
                const regex = getTextHighlightRegex(inputText);
                results = results.filter(d => regex.test(d.label));
            }

            return {
                results,
                totalCount: state.regionItems.length,
            };
        };

        /* event */
        const handleSelectMenuItem = (selectedItems) => {
            emit('update:selected', selectedItems.map(d => d.name));
        };
        const handleSearch = (val: string) => {
            emit('update:selected', state.selectedItems.map(d => d.name).concat([val]));
        };

        // LOAD REFERENCE STORE
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/provider/load'),
                store.dispatch('reference/region/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            CLOUD_SERVICE_FILTER_KEY,
            regionMenuHandler,
            handleSelectMenuItem,
            handleSearch,
        };
    },
});
</script>

<style lang="postcss" scoped>
.region-list-text {
    @apply text-sm;
    width: 100%;
    display: flex;
    flex-direction: column;
    .region-type {
        padding-left: 0.25rem;
    }
    .region-provider {
        @apply mr-1;
    }
    .region-code {
        @apply text-gray-400;
        padding-left: 0.25rem;
    }
}
</style>
