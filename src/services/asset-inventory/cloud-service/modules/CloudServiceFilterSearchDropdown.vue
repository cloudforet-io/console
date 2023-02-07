<template>
    <div>
        <p-filterable-dropdown :search-text.sync="searchTerm"
                               :menu="menuItems"
                               :selected="selectedItems"
                               multi-selectable
                               use-fixed-menu-style
                               appearance-type="stack"
                               show-select-marker
                               :handler="type === CLOUD_SERVICE_FILTER_KEY.REGION ? regionMenuHandler : undefined"
                               @update:selected="handleUpdateSelected"
        >
            <template v-if="type === CLOUD_SERVICE_FILTER_KEY.REGION"
                      #menu-item--format="{item}"
            >
                <div class="region-list-text">
                    <div class="region-type">
                        <text-highlighting class="region-provider"
                                           :style="{color: item.color}"
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
                                       :text="item.name"
                                       :term="searchTerm"
                                       style-type="secondary"
                    />
                </div>
            </template>
        </p-filterable-dropdown>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import {
    PFilterableDropdown, getTextHighlightRegex,
} from '@spaceone/design-system';
import type {
    FilterableDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';

import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { SortedRegionReferenceItem, RegionReferenceMap } from '@/store/modules/reference/region/type';

import TextHighlighting from '@/common/components/text/text-highlighting/TextHighlighting.vue';

import { CLOUD_SERVICE_CATEGORY, CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/cloud-service/lib/config';
import type { RegionMenuItem } from '@/services/asset-inventory/cloud-service/modules/lib/cloud-service-filter-helper';
import { getRegionFilterMenuItem } from '@/services/asset-inventory/cloud-service/modules/lib/cloud-service-filter-helper';
import { assetInventoryStore } from '@/services/asset-inventory/store';

const categoryItems = [
    { name: CLOUD_SERVICE_CATEGORY.SERVER, label: CLOUD_SERVICE_CATEGORY.SERVER },
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

interface Props {
    type: string;
    selected: string[];
}

export default defineComponent<Props>({
    name: 'CloudServiceFilterSearchDropdown',
    components: {
        TextHighlighting,
        PFilterableDropdown,
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
    },
    setup(props, { emit }) {
        const state = reactive({
            searchTerm: '',
            selectedItems: computed<FilterableDropdownMenuItem[]>(() => props.selected.map((selectedName) => ({
                name: selectedName,
                label: state.menuItems.find((d) => d.name === selectedName)?.label || selectedName,
            }))),
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            selectedProvider: computed(() => assetInventoryStore.state.cloudService.selectedProvider),
            sortedRegions: computed<SortedRegionReferenceItem[]>(() => {
                const regions: SortedRegionReferenceItem[] = store.getters['reference/region/regionsSortedByProvider'];
                if (state.selectedProvider === 'all') return regions;
                return regions.filter((r) => r.data.provider === state.selectedProvider);
            }),
            regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
            regionItems: computed<RegionMenuItem[]>(() => state.sortedRegions.map((d) => getRegionFilterMenuItem(d.key, state.regions, state.providers))),
            menuItems: computed<FilterableDropdownMenuItem[]|RegionMenuItem[]>(() => {
                if (props.type === CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY) {
                    return categoryItems;
                } if (props.type === CLOUD_SERVICE_FILTER_KEY.REGION) {
                    return state.regionItems;
                }
                return [];
            }),
            menuLoading: false,
        });
        const regionMenuHandler = (inputText: string) => {
            const trimmed = inputText?.trim();
            let results: RegionMenuItem[];
            if (trimmed) {
                const regex = getTextHighlightRegex(inputText);
                results = state.menuItems.filter((d) => regex.test(d.label));
            } else {
                results = [...state.menuItems];
            }

            return {
                results,
            };
        };

        /* event */
        const handleUpdateSelected = (selected: FilterableDropdownMenuItem[]) => {
            emit('update:selected', selected.map((d) => d.name));
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
            handleUpdateSelected,
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
