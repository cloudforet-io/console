<template>
    <div class="collector-contents">
        <p-toolbox
            exportable
            filters-visible
            search-type="query"
            :key-item-sets="props.keyItemSets"
            :query-tags="state.searchTags"
            :value-handler-map="state.valueHandlerMap"
            :total-count="collectorPageState.listCount"
            @change="handleChangeToolbox"
            @refresh="handleChangeToolbox"
            @export="handleExport"
        >
            <template #left-area>
                <p-button
                    icon-left="ic_plus_bold"
                    class="create-button"
                    @click="handleCreate"
                >
                    {{ $t('INVENTORY.COLLECTOR.MAIN.CREATE') }}
                </p-button>
            </template>
        </p-toolbox>
        <p-data-loader :data="state.items"
                       :loading="collectorPageState.loading"
                       class="collector-list-wrapper"
        >
            <div class="collector-lists">
                <p-card
                    v-for="item in state.items"
                    :key="item.collectorId"
                    :header="false"
                    style-type="white"
                >
                    <div class="collector-item-wrapper">
                        <span class="collector-item-name">{{ item.name }}</span>
                        <div class="collector-info-wrapper">
                            <collector-item-info
                                v-for="info in state.infoItems"
                                :key="info.key"
                                :label="info.label"
                                :type="info.key"
                                :item="item"
                            />
                        </div>
                    </div>
                </p-card>
            </div>
            <template #no-data>
                <collector-list-no-data class="collector-no-data" />
            </template>
        </p-data-loader>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PToolbox, PButton, PCard, PDataLoader,
} from '@spaceone/design-system';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import { QueryHelper } from '@cloudforet/core-lib/query';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import { replaceUrlQuery } from '@/lib/router-query-string';

import CollectorItemInfo from '@/services/asset-inventory/collector/modules/CollectorItemInfo.vue';
import CollectorListNoData from '@/services/asset-inventory/collector/modules/CollectorListNoData.vue';
import { COLLECTOR_ITEM_INFO_TYPE, COLLECTOR_QUERY_HELPER_SET } from '@/services/asset-inventory/collector/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { useCollectorPageStore } from '@/services/asset-inventory/store/collector-page-store';

interface Props {
    keyItemSets?: KeyItemSet[]
}

const props = withDefaults(defineProps<Props>(), {
    keyItemSets: undefined,
});

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
});

const state = reactive({
    infoItems: [
        { key: COLLECTOR_ITEM_INFO_TYPE.PLUGIN, label: 'Plugin' },
        { key: COLLECTOR_ITEM_INFO_TYPE.STATUS, label: 'Current Status' },
        { key: COLLECTOR_ITEM_INFO_TYPE.JOBS, label: 'Recent Collector Jobs' },
        { key: COLLECTOR_ITEM_INFO_TYPE.SCHEDULE, label: 'Schedule' },
    ],
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
    excelFields: [
        { key: 'name', name: 'Name' },
        { key: 'state', name: 'State' },
        { key: 'plugin_info.plugin_id', name: 'Plugin' },
        { key: 'plugin_info.version', name: 'Version' },
        { key: 'last_collected_at', name: 'Last Collected', type: 'datetime' },
    ],
    searchTags: computed(() => searchQueryHelper.setFilters(collectorPageState.searchFilters).queryTags),
    items: computed(() => {
        const plugins = storeState.plugins;
        return collectorPageState.collectors?.map((d) => ({
            collectorId: d.collector_id,
            name: d.name,
            plugin: {
                name: plugins[d.plugin_info.plugin_id]?.label,
                icon: plugins[d.plugin_info.plugin_id]?.icon,
                info: d.plugin_info,
            },
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

const emit = defineEmits(['change-toolbox']);

const searchQueryHelper = new QueryHelper().setKeyItemSets(props.keyItemSets ?? []);

/* Components */
const handleCreate = () => {
    SpaceRouter.router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME });
};
const handleExport = async () => {};
const handleChangeToolbox = async (options) => {
    emit('change-toolbox');
    if (options.queryTags !== undefined) {
        searchQueryHelper.setFiltersAsQueryTag(options.queryTags);
        await collectorPageStore.setFilteredCollectorList(searchQueryHelper.filters);
        await replaceUrlQuery('filters', searchQueryHelper.rawQueryStrings);
    }
};
</script>

<style scoped lang="postcss">
.collector-contents {
    @apply flex flex-col;
    gap: 0.5rem;

    .collector-list-wrapper {
        @apply flex flex-col;
        gap: 0.25rem;
        min-height: 16.875rem;

        .create-button {
            padding-right: 0.75rem;
            padding-left: 0.75rem;
        }

        .collector-lists {
            @apply grid grid-cols-2 gap-4;

            .collector-item-wrapper {
                @apply flex flex-col;
                gap: 1.25rem;
                padding: 0.5rem 0.625rem;

                .collector-item-name {
                    @apply text-label-xl font-bold;
                }
                .collector-info-wrapper {
                    @apply grid grid-cols-2 gap-6;
                }
            }
        }
    }
}
</style>
