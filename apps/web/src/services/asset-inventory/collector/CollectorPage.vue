<template>
    <div class="collector-page">
        <p-heading
            :title="$t('INVENTORY.COLLECTOR.MAIN.TITLE')"
            use-total-count
            use-selected-count
            :total-count="state.totalCount"
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
            :data="cloudCollectorPageState.collectorList"
            :loading="state.loading && !cloudCollectorPageState.collectorList"
            loader-backdrop-color="gray.100"
            class="collector-contents-wrapper"
        >
            <collector-contents
                :total-count="state.totalCount"
                :page-limit="state.pageLimit"
                :key-item-sets="handlerState.keyItemSets"
                :value-handler-map="handlerState.valueHandlerMap"
                @export-excel="handleExportExcel"
                @change-toolbox="handleChangeToolBox"
            />
            <template #no-data>
                <collector-no-data />
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { PButton, PDataLoader, PHeading } from '@spaceone/design-system';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CollectorContents from '@/services/asset-inventory/collector/modules/CollectorContents.vue';
import CollectorNoData from '@/services/asset-inventory/collector/modules/CollectorNoData.vue';
import type { CollectorModel } from '@/services/asset-inventory/collector/type';
import { COLLECTOR_QUERY_HELPER_SET } from '@/services/asset-inventory/collector/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { useCollectorPageStore } from '@/services/asset-inventory/store/collector-page-store';

const cloudCollectorPageStore = useCollectorPageStore();
const cloudCollectorPageState = cloudCollectorPageStore.$state;

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
});
const handlerState = reactive({
    excelFields: [
        { key: 'name', name: 'Name' },
        { key: 'state', name: 'State' },
        { key: 'plugin_info.plugin_id', name: 'Plugin' },
        { key: 'plugin_info.version', name: 'Version' },
        { key: 'last_collected_at', name: 'Last Collected', type: 'datetime' },
    ],
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
    valueHandlerMap: {
        collector_id: makeDistinctValueHandler('inventory.Collector', 'collector_id'),
        name: makeDistinctValueHandler('inventory.Collector', 'name'),
        state: makeDistinctValueHandler('inventory.Collector', 'state'),
        'plugin_info.plugin_id': makeDistinctValueHandler('inventory.Collector', 'plugin_info.plugin_id'),
        'plugin_info.version': makeDistinctValueHandler('inventory.Collector', 'plugin_info.version'),
        provider: makeDistinctValueHandler('inventory.Collector', 'provider'),
        supported_resource_type: makeDistinctValueHandler('inventory.Collector', 'supported_resource_type'),
        created_at: makeDistinctValueHandler('inventory.Collector', 'created_at'),
        last_collected_at: makeDistinctValueHandler('inventory.Collector', 'last_collected_at'),
    } as ValueHandlerMap,
});

const searchQueryHelper = new QueryHelper().setKeyItemSets(handlerState.keyItemSets ?? []);

const state = reactive({
    loading: true,
    totalCount: 0,
    pageStart: 1,
    pageLimit: 15,
    sortBy: '',
    collectors: undefined as undefined | CollectorModel[],
    searchTags: computed(() => searchQueryHelper.setFilters(cloudCollectorPageState.searchFilters).queryTags),
    items: computed(() => {
        const plugins = storeState.plugins;
        return state.collectors?.map((d) => ({
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

/* Components */
const initCollectorList = async () => {
    state.loading = true;
    try {
        await getCollectorList();
        if (Object.keys(state.items).length > 0) {
            await cloudCollectorPageStore.setCollectorList(state.items);
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        state.totalCount = 0;
        await cloudCollectorPageStore.setCollectorList([]);
    } finally {
        state.loading = false;
    }
};
const filterByProvider = async () => {
    await getCollectorList();
    await cloudCollectorPageStore.setFilteredCollectorList(state.items);
};
const handleExportExcel = async () => {
    await store.dispatch('file/downloadExcel', {
        url: '/inventory/collector/list',
        param: { query: collectorApiQueryHelper.data },
        fields: handlerState.excelFields,
        file_name_prefix: FILE_NAME_PREFIX.collector,
    });
};
const handleChangeToolBox = async (options) => {
    if (options.queryTags !== undefined) {
        searchQueryHelper.setFiltersAsQueryTag(options.queryTags);
        cloudCollectorPageStore.$patch((_state) => {
            _state.searchFilters = searchQueryHelper.filters;
        });
        await replaceUrlQuery('filters', searchQueryHelper.rawQueryStrings);
    }
    setApiQueryWithToolboxOptions(collectorApiQueryHelper, options);
    await initCollectorList();
};

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
    .setPage(state.pageStart, state.pageLimit)
    .setSort(state.sortBy, true);

/* API */
const getCollectorList = async () => {
    collectorApiQueryHelper.setFilters(cloudCollectorPageStore.allFilters);
    try {
        const res = await SpaceConnector.client.inventory.collector.list({
            query: collectorApiQueryHelper.data,
        });
        state.collectors = res.results;
        state.totalCount = res.total_count;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Watcher */
watch(() => cloudCollectorPageState.selectedProvider, async () => {
    await filterByProvider();
});

/* INIT */
(async () => {
    await cloudCollectorPageStore.initState();
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
