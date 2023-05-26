<template>
    <div class="collector-page">
        <p-heading
            use-total-count
            use-selected-count
            :title="$t('INVENTORY.COLLECTOR.MAIN.TITLE')"
            :total-count="collectorPageState.totalCount"
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
        <!-- FIXME: loading must be fixed after basic function. -->
        <p-data-loader
            :data="collectorPageState.collectorList"
            :loading="collectorPageState.loading && !collectorPageState.collectorList"
            loader-backdrop-color="gray.100"
            class="collector-contents-wrapper"
        >
            <collector-contents
                :key-item-sets="handlerState.keyItemSets"
                :provider-list="state.providerList"
                :search-tags="state.searchTags"
                @change-toolbox="handleChangeToolBox"
            />
            <template #no-data>
                <collector-no-data />
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';

import { PButton, PDataLoader, PHeading } from '@spaceone/design-system';

import type { KeyItemSet } from '@cloudforet/core-lib/component-util/query-search/type';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorContents from '@/services/asset-inventory/collector/modules/CollectorContents.vue';
import CollectorNoData from '@/services/asset-inventory/collector/modules/CollectorNoData.vue';
import { COLLECTOR_QUERY_HELPER_SET } from '@/services/asset-inventory/collector/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { useCollectorPageStore } from '@/services/asset-inventory/store/collector-page-store';

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
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

const searchQueryHelper = new QueryHelper().setKeyItemSets(handlerState.keyItemSets ?? []);

const state = reactive({
    providerList: computed(() => ([{ key: 'all', name: 'All Providers' }, ...Object.values(storeState.providers)])),
    searchTags: computed(() => searchQueryHelper.setFilters(collectorPageState.searchFilters).queryTags),
    items: computed(() => {
        const plugins = storeState.plugins;
        return collectorPageState.collectors?.map((d) => ({
            collectorId: d.collector_id,
            name: d.name,
            pluginName: plugins[d.plugin_info.plugin_id]?.label,
            pluginIcon: plugins[d.plugin_info.plugin_id]?.icon,
            pluginInfo: d.plugin_info,
            detailLink: {
                name: ASSET_INVENTORY_ROUTE.COLLECTOR.DETAIL._NAME,
                param: { id: d.collector_id },
                query: {
                    filters: searchQueryHelper.setFilters([
                        {
                            k: COLLECTOR_QUERY_HELPER_SET.COLLECTOR_ID,
                            v: d.collector_id,
                            o: '=',
                        },
                    ]).rawQueryStrings,
                },
            },
        }));
    }),
});

/* Query Helper */
const collectorApiQueryHelper = new ApiQueryHelper()
    .setOnly(
        COLLECTOR_QUERY_HELPER_SET.COLLECTOR_ID,
        COLLECTOR_QUERY_HELPER_SET.NAME,
        COLLECTOR_QUERY_HELPER_SET.LAST_COLLECTED_AT,
        COLLECTOR_QUERY_HELPER_SET.PROVIDER,
        COLLECTOR_QUERY_HELPER_SET.TAGS,
        COLLECTOR_QUERY_HELPER_SET.PLUGIN_INFO,
        COLLECTOR_QUERY_HELPER_SET.STATE,
    )
    .setPage(collectorPageState.pageStart, collectorPageState.pageLimit)
    .setSort(collectorPageState.sortBy, true);

/* Components */
const initCollectorList = async () => {
    collectorApiQueryHelper.setFilters(collectorPageStore.allFilters);
    try {
        await collectorPageStore.getCollectorList(collectorApiQueryHelper.data);
        if (Object.keys(state.items).length > 0) {
            await collectorPageStore.setCollectorList(state.items);
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        await collectorPageStore.$reset();
    }
};
const handleChangeToolBox = async (options) => {
    setApiQueryWithToolboxOptions(collectorApiQueryHelper, options);
    await initCollectorList();
};

/* Watcher */
watch(() => collectorPageState.selectedProvider, async () => {
    await initCollectorList();
});

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

.collector-contents-wrapper {
    min-height: 16.875rem;
}
</style>
