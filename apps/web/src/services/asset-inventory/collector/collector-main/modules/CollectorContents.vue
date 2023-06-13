<template>
    <div class="collector-contents">
        <p-toolbox
            exportable
            filters-visible
            search-type="query"
            :key-item-sets="props.keyItemSets"
            :query-tags="state.searchTags"
            :value-handler-map="state.valueHandlerMap"
            :total-count="collectorPageState.totalCount"
            @change="handleChangeToolbox"
            @refresh="handleChangeToolbox"
            @export="handleExportExcel"
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
                <div v-for="item in state.items"
                     :key="item.collectorId"
                     @click="handleClickListItem(item.detailLink)"
                >
                    <p-card :header="false"
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
            </div>
            <template #no-data>
                <collector-list-no-data class="collector-no-data" />
            </template>
        </p-data-loader>
        <!-- TODO: changed condition after API spec checking -->
        <collector-schedule-modal edit-mode />
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
import { i18n } from '@/translations';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import { replaceUrlQuery } from '@/lib/router-query-string';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import CollectorItemInfo from '@/services/asset-inventory/collector/collector-main/modules/CollectorItemInfo.vue';
import CollectorListNoData from '@/services/asset-inventory/collector/collector-main/modules/CollectorListNoData.vue';
import CollectorScheduleModal
    from '@/services/asset-inventory/collector/collector-main/modules/CollectorScheduleModal.vue';
import {
    COLLECTOR_ITEM_INFO_TYPE,
    COLLECTOR_QUERY_HELPER_SET,
} from '@/services/asset-inventory/collector/collector-main/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

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
        { key: COLLECTOR_ITEM_INFO_TYPE.PLUGIN, label: i18n.t('INVENTORY.COLLECTOR.DETAIL.PLUGIN') },
        { key: COLLECTOR_ITEM_INFO_TYPE.STATUS, label: i18n.t('INVENTORY.COLLECTOR.MAIN.CURRENT_STATUS') },
        { key: COLLECTOR_ITEM_INFO_TYPE.JOBS, label: i18n.t('INVENTORY.COLLECTOR.MAIN.RECENT_JOBS') },
        { key: COLLECTOR_ITEM_INFO_TYPE.SCHEDULE, label: i18n.t('INVENTORY.COLLECTOR.DETAIL.SCHEDULE') },
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
        return collectorPageState.collectors?.map((d) => {
            const linkData = {
                params: { id: d.collector_id },
                query: {
                    filters: searchQueryHelper.setFilters([
                        {
                            k: COLLECTOR_QUERY_HELPER_SET.COLLECTOR_ID,
                            v: d.collector_id,
                            o: '=',
                        },
                    ]).rawQueryStrings,
                },
            };
            return {
                collectorId: d.collector_id,
                name: d.name,
                plugin: {
                    name: plugins[d.plugin_info.plugin_id]?.label,
                    icon: plugins[d.plugin_info.plugin_id]?.icon,
                    info: d.plugin_info,
                },
                historyLink: {
                    ...linkData,
                    name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME,
                },
                detailLink: {
                    ...linkData,
                    name: ASSET_INVENTORY_ROUTE.COLLECTOR.DETAIL._NAME,
                    params: {
                        collectorId: d.collector_id,
                    },
                },
                schedule: d.schedule,
            };
        });
    }),
});

const emit = defineEmits(['change-toolbox', 'export-excel']);

const searchQueryHelper = new QueryHelper().setKeyItemSets(props.keyItemSets ?? []);

/* Components */
const handleCreate = () => {
    SpaceRouter.router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME });
};
const handleExportExcel = async () => {
    emit('export-excel', state.excelFields);
};
const handleChangeToolbox = (options) => {
    if (options.queryTags !== undefined) {
        searchQueryHelper.setFiltersAsQueryTag(options.queryTags);
        collectorPageStore.setFilteredCollectorList(searchQueryHelper.filters);
        replaceUrlQuery('filters', searchQueryHelper.rawQueryStrings);
    }
    emit('change-toolbox', options);
};
const handleClickListItem = (detailLink) => {
    SpaceRouter.router.push(detailLink);
};

// TODO: will be checked after API is ready
/* Watcher */
// watch(() => state.items, async (value) => {
//     const ids = value?.map((item) => item.collectorId);
//     if (ids.length > 0) {
//         const promises = ids.map(collectorPageStore.getCollectorSchedule);
//         await Promise.all(promises);
//     }
// });
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

            /* custom design-system component - p-card */
            :deep(.p-card) {
                &:hover {
                    @apply cursor-pointer;
                    .body {
                        @apply bg-blue-100;
                    }
                }
            }

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
