<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PSelectDropdown, getTextHighlightRegex,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { SortedRegionReferenceItem, RegionReferenceMap } from '@/store/modules/reference/region/type';

import TextHighlighting from '@/common/components/text/text-highlighting/TextHighlighting.vue';

import { CLOUD_SERVICE_CATEGORY, CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/constants/cloud-service-constant';
import type { RegionMenuItem } from '@/services/asset-inventory/helpers/cloud-service-filter-helper';
import { getRegionFilterMenuItem } from '@/services/asset-inventory/helpers/cloud-service-filter-helper';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';

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

const props = withDefaults(defineProps<Props>(), {
    type: '',
    selected: () => ([]),
});

const emit = defineEmits<{(e: 'click-done', value: (string|undefined)[]): void;
}>();

const cloudServicePageStore = useCloudServicePageStore();
const cloudServicePageState = cloudServicePageStore.$state;

const state = reactive({
    searchTerm: '',
    selectedItems: computed<SelectDropdownMenuItem[]>(() => props.selected.map((selectedName) => {
        const selected = state.menuItems.find((d) => d.name === selectedName);
        return {
            name: selectedName,
            label: selected?.label || selectedName,
            ...selected,
        };
    })),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    sortedRegions: computed<SortedRegionReferenceItem[]>(() => {
        const regions: SortedRegionReferenceItem[] = store.getters['reference/region/regionsSortedByProvider'];
        if (cloudServicePageState.selectedProvider === 'all') return regions;
        return regions.filter((r) => r.data.provider === cloudServicePageState.selectedProvider);
    }),
    regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
    regionItems: computed<RegionMenuItem[]>(() => state.sortedRegions.map((d) => getRegionFilterMenuItem(d.key, state.regions, state.providers))),
    menuItems: computed<SelectDropdownMenuItem[]|RegionMenuItem[]>(() => {
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
const handleChangeSelected = (selected?: SelectDropdownMenuItem[]) => {
    if (!selected || selected.length === 0) {
        emit('click-done', []);
        return;
    }
    emit('click-done', selected.map((d) => d.name));
};

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/provider/load'),
        store.dispatch('reference/region/load'),
    ]);
})();
</script>

<template>
    <p-select-dropdown :search-text.sync="state.searchTerm"
                       :menu="state.menuItems"
                       :selected="state.selectedItems"
                       multi-selectable
                       use-fixed-menu-style
                       show-select-marker
                       :handler="type === CLOUD_SERVICE_FILTER_KEY.REGION ? regionMenuHandler : undefined"
                       is-filterable
                       show-select-header
                       @click-done="handleChangeSelected"
                       @clear-selection="handleChangeSelected"
    >
        <template v-if="props.type === CLOUD_SERVICE_FILTER_KEY.REGION"
                  #menu-item--format="{item}"
        >
            <div class="region-list-text">
                <div class="region-type">
                    <text-highlighting class="region-provider"
                                       :style="{color: item.color}"
                                       :text="state.providers[item.provider] ? state.providers[item.provider].label : item.provider"
                                       :term="state.searchTerm"
                                       style-type="secondary"
                    />
                    <text-highlighting :text="item.regionName"
                                       :term="state.searchTerm"
                                       style-type="secondary"
                    />
                </div>
                <text-highlighting class="region-code"
                                   :text="item.name"
                                   :term="state.searchTerm"
                                   style-type="secondary"
                />
            </div>
        </template>
    </p-select-dropdown>
</template>

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
