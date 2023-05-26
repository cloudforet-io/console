<template>
    <div class="collector-page">
        <p-heading
            use-total-count
            use-selected-count
            :title="$t('INVENTORY.COLLECTOR.MAIN.TITLE')"
            :total-count="collectorPageState.listCount"
        >
            <template #extra>
                <router-link
                    :to="{ name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME }"
                >
                    <p-button style-type="tertiary"
                              class="history-button"
                    >
                        {{ $t("INVENTORY.COLLECTOR.MAIN.HISTORY") }}
                    </p-button>
                </router-link>
            </template>
        </p-heading>
        <p-data-loader
            :data="collectorPageState.hasCollectorList"
            :loading="state.loading"
            loader-backdrop-color="gray.100"
            class="collector-loader-wrapper"
        >
            <div class="collector-contents-wrapper">
                <provider-list
                    :provider-list="state.providerList"
                    :selected-provider="state.selectedProvider"
                    @change-provider="handleSelectedProvider"
                />
                <!-- TODO: will be apply data-->
                <collector-contents
                    :key-item-sets="handlerState.keyItemSets"
                />
            </div>
            <template #no-data>
                <collector-no-data />
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, reactive } from 'vue';

import { PButton, PHeading, PDataLoader } from '@spaceone/design-system';

import type { KeyItemSet } from '@cloudforet/core-lib/component-util/query-search/type';

import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import CollectorContents from '@/services/asset-inventory/collector/modules/CollectorContents.vue';
import CollectorNoData from '@/services/asset-inventory/collector/modules/CollectorNoData.vue';
import ProviderList from '@/services/asset-inventory/components/ProviderList.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { useCollectorPageStore } from '@/services/asset-inventory/store/collector-page-store';

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});

const handlerState = reactive({
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'collector_id', label: 'Collector Id' },
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
            { name: 'plugin_info.plugin_id', label: 'Plugin' },
            { name: 'plugin_info.version', label: 'Version' },
            { name: 'provider', label: 'Provider', valueSet: storeState.providers },
            { name: 'supported_resource_type', label: 'Resource Type' },
            { name: 'created_at', label: 'Created' },
            { name: 'last_collected_at', label: 'Last Collected' },
        ],
    }]),
});

const state = reactive({
    loading: true,
    selectedProvider: computed(() => collectorPageState.selectedProvider),
    providerList: computed(() => ([{ key: 'all', name: 'All Providers' }, ...Object.values(storeState.providers)])),
});

/* Components */
const initCollectorList = async () => {
    state.loading = true;
    try {
        await collectorPageStore.getInitCollectorList();
    } catch (e) {
        await collectorPageStore.$reset();
    } finally {
        state.loading = false;
    }
};
const handleSelectedProvider = (providerName: string) => {
    collectorPageStore.setSelectedProvider(providerName);
    // getCollectorList();
};

/* Unmounted */
onUnmounted(() => {
    collectorPageStore.$reset();
});

/* INIT */
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/plugin/load'),
        store.dispatch('reference/provider/load'),
    ]);
    await initCollectorList();
})();
</script>

<style lang="postcss" scoped>
/* FIXME: Reducing dependencies on the design system */

/* custom design-system component - p-heading */
:deep(.p-heading) {
    @apply items-center;

    .heading-wrapper {
        flex: 1;

        .total-count {
            @apply font-normal;
        }
    }

    .extra {
        flex-grow: initial;

        .history-button {
            @apply bg-white rounded border border-gray-300 text-label-md font-bold;
            width: 100%;
            padding: 0.375rem 0.75rem;
        }
    }
}

.collector-loader-wrapper {
    min-height: 16.875rem;

    .collector-contents-wrapper {
        @apply flex flex-col;
        gap: 1.5rem;
    }
}
</style>
