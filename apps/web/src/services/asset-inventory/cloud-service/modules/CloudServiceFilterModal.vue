<script lang="ts" setup>
import {
    PButtonModal, PCollapsibleList, PTag,
} from '@spaceone/design-system';
import { sum } from 'lodash';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';

import { useProxyValue } from '@/common/composables/proxy-state';

import { CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/cloud-service/lib/config';
import CloudServiceFilterSearchDropdown from '@/services/asset-inventory/cloud-service/modules/CloudServiceFilterSearchDropdown.vue';
import type { RegionMenuItem } from '@/services/asset-inventory/cloud-service/modules/lib/cloud-service-filter-helper';
import {
    getRegionFilterMenuItem,
} from '@/services/asset-inventory/cloud-service/modules/lib/cloud-service-filter-helper';
import type { CloudServiceFilterKey } from '@/services/asset-inventory/cloud-service/type';
import { useCloudServicePageStore } from '@/services/asset-inventory/store/cloud-service-page-store';


interface FilterItem {
    name: string;
    title: string;
}

interface CategoryMenuItem { name: string; label: string }
type CloudServiceFilterItemsMap = {
    [CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY]: CategoryMenuItem[];
    [CLOUD_SERVICE_FILTER_KEY.REGION]: RegionMenuItem[];
};

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e:'confirm'): void;
}>();
const store = useStore();
const { t } = useI18n();

const cloudServicePageStore = useCloudServicePageStore();
const cloudServicePageState = cloudServicePageStore.$state;

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    filterLabels: computed<Record<CloudServiceFilterKey, string>>(() => ({
        [CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY]: t('INVENTORY.CLOUD_SERVICE.MAIN.MODAL.SERVICE_CATEGORY'),
        [CLOUD_SERVICE_FILTER_KEY.REGION]: t('INVENTORY.CLOUD_SERVICE.MAIN.MODAL.REGION'),
    })),
    filterItems: computed<FilterItem[]>(() => [
        { name: CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY, title: t('INVENTORY.CLOUD_SERVICE.MAIN.MODAL.SERVICE_CATEGORY') },
        { name: CLOUD_SERVICE_FILTER_KEY.REGION, title: t('INVENTORY.CLOUD_SERVICE.MAIN.MODAL.REGION') },
    ]),
    // asset inventory store data
    categoryFilters: computed<CategoryMenuItem[]>(() => state.filters[CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY]?.map((d) => ({ name: d, label: d }))),
    regionFilters: computed<RegionMenuItem[]>(() => state.filters[CLOUD_SERVICE_FILTER_KEY.REGION]?.map((d) => getRegionFilterMenuItem(d, storeState.regions, storeState.providers))),
    filters: cloudServicePageState.additionalFilters,
    selectedItemsMap: computed<CloudServiceFilterItemsMap>(() => ({
        [CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY]: state.categoryFilters,
        [CLOUD_SERVICE_FILTER_KEY.REGION]: state.regionFilters,
    })),
    selectedItemsLength: computed<number>(() => {
        const selectedValues = Object.values(state.selectedItemsMap as CloudServiceFilterItemsMap);
        return sum(selectedValues.map((v) => v?.length || 0));
    }),
    unfoldedIndices: [] as number[],
    menuLoading: false,
});

/* util */
const init = () => {
    const _unfoldedIndices: number[] = [];
    const originFilters = cloudServicePageState.additionalFilters;
    state.filterItems.forEach((item, idx) => {
        if (originFilters[item.name]?.length) {
            _unfoldedIndices.push(idx);
        }
    });
    state.unfoldedIndices = _unfoldedIndices;
    state.filters = { ...originFilters };
};

/* event */
const handleDeleteTag = (filterName: string, itemIdx: number) => {
    const filters = { ...state.filters };
    const filterItems = [...filters[filterName]];
    filterItems.splice(itemIdx, 1);
    if (filterItems.length) {
        filters[filterName] = filterItems;
    } else {
        filters[filterName] = undefined;
    }
    state.filters = filters;
};
const handleFormConfirm = () => {
    cloudServicePageStore.$patch((_state) => {
        _state.additionalFilters = state.filters;
    });
    emit('confirm');
    state.proxyVisible = false;
};
const handleClearAll = () => {
    state.filters = {};
    state.unfoldedIndices = [];
};

const handleFilterUpdate = (name: string, selected: string[]) => {
    state.filters = { ...state.filters, [name]: selected };
};

watch(() => state.unfoldedIndices, (after, before) => {
    if (after.length < before.length) {
        const filters = { ...state.filters };
        const deletedIndex: number = before.filter((idx) => !after.includes(idx))[0];
        const deletedFilterName = state.filterItems[deletedIndex].name;
        filters[deletedFilterName] = undefined;
        state.filters = filters;
    }
});
watch(() => props.visible, (visible) => {
    if (visible) init();
});
watch(() => cloudServicePageState.selectedProvider, (provider) => {
    if (!props.visible) return;
    if (provider === 'all') return;
    const regionFilters = state.filters[CLOUD_SERVICE_FILTER_KEY.REGION] ?? [];
    cloudServicePageStore.setSelectedRegionsToFilters(regionFilters.filter((r) => {
        const region = state.regions[r];
        if (!region) return false;
        return region.data.provider === provider;
    }));
});

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/provider/load'),
        store.dispatch('reference/region/load'),
    ]);
})();

</script>

<template>
    <p-button-modal
        v-if="visible"
        v-model:visible="state.proxyVisible"
        class="cloud-service-filter-modal"
        :header-title="t('INVENTORY.CLOUD_SERVICE.MAIN.MODAL.SET_FILTER')"
        :footer-reset-button-visible="true"
        @confirm="handleFormConfirm"
        @return="handleClearAll"
    >
        <template #body>
            <div class="select-filter-body">
                <div class="left-select-filter-section">
                    <p-collapsible-list
                        v-model:unfolded-indices="state.unfoldedIndices"
                        class="collapsible-list-section"
                        :items="state.filterItems"
                        toggle-type="switch"
                        :multi-unfoldable="true"
                    >
                        <template #default="{name, isCollapsed}">
                            <cloud-service-filter-search-dropdown v-if="!isCollapsed"
                                                                  :type="name"
                                                                  :selected="state.filters[name]"
                                                                  @update:selected="handleFilterUpdate(name, $event)"
                            />
                        </template>
                    </p-collapsible-list>
                </div>
                <div class="right-select-filter-section">
                    <div class="selected-filter-section">
                        <div class="title">
                            {{ t('INVENTORY.CLOUD_SERVICE.MAIN.MODAL.SELECTED_FILTER') }} ({{ state.selectedItemsLength }})
                        </div>
                        <div v-if="state.selectedItemsLength"
                             class="selected-tags-wrapper"
                        >
                            <template v-for="([filterName, items], idx) in Object.entries(state.selectedItemsMap)">
                                <p-tag v-for="(item, itemIdx) in items"
                                       :key="`selected-tag-${idx}-${item.name}`"
                                       @delete="handleDeleteTag(filterName, itemIdx)"
                                >
                                    <b>{{ state.filterLabels[filterName] }}: </b>{{ item.label }}
                                </p-tag>
                            </template>
                        </div>
                        <div v-else
                             class="no-item-wrapper"
                        >
                            <p>{{ t('INVENTORY.CLOUD_SERVICE.MAIN.MODAL.NO_FILTER_HELP_TEXT1') }}</p>
                            <p>{{ t('INVENTORY.CLOUD_SERVICE.MAIN.MODAL.NO_FILTER_HELP_TEXT2') }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template #reset-button>
            {{ t('INVENTORY.CLOUD_SERVICE.MAIN.MODAL.CLEAR_ALL') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.cloud-service-filter-modal {
    /* custom design-system component - p-button-modal */
    :deep(&.p-button-modal) {
        .modal-content {
            height: 48.75rem;
        }
    }
    .select-filter-body {
        @apply grid grid-cols-2 gap-4;

        @screen mobile {
            @apply grid grid-cols-1;
        }

        .left-select-filter-section {
            @apply bg-gray-100 border border-solid border-gray-200 rounded;
            padding: 0.5rem;

            /* custom design-system component - p-collapsible-list */
            :deep(.collapsible-list-section) {
                @apply flex flex-wrap flex-col gap-1;
                .collapsible-item {
                    @apply bg-white rounded-none;
                    padding: 0 1rem;
                    > .p-collapsible-panel {
                        > .contents {
                            @apply rounded-lg bg-blue-100;
                            padding: 0.75rem;
                            margin-top: 0.25rem;
                        }
                    }
                }
            }
        }
        .right-select-filter-section {
            @apply flex flex-col flex-wrap gap-4;

            .selected-filter-section {
                @apply rounded-lg border-gray-200 border-solid;
                min-height: 11rem;
                border-width: 1px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: flex-start;
                padding: 1rem;

                .selected-tags-wrapper .p-tag {
                    margin-bottom: 0.5rem;
                }
                .no-item-wrapper {
                    @apply text-gray-300;
                    font-size: 0.875rem;
                    line-height: 1.6;
                }
            }
        }
    }
}
</style>
