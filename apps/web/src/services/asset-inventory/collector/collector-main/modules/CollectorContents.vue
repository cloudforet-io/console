<script setup lang="ts">
import {
    onMounted, computed, reactive, watch,
} from 'vue';

import { PToolbox, PButton, PDataLoader } from '@spaceone/design-system';
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { ExcelDataField } from '@/store/modules/file/type';
import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import CollectorContentItem from '@/services/asset-inventory/collector/collector-main/modules/CollectorContentItem.vue';
import CollectorListNoData from '@/services/asset-inventory/collector/collector-main/modules/CollectorListNoData.vue';
import CollectorScheduleModal
    from '@/services/asset-inventory/collector/collector-main/modules/modals/CollectorScheduleModal.vue';
import type { CollectorItemInfo } from '@/services/asset-inventory/collector/collector-main/type';
import { COLLECTOR_QUERY_HELPER_SET } from '@/services/asset-inventory/collector/collector-main/type';
import CollectorDataModal
    from '@/services/asset-inventory/collector/shared/collector-data-modal/CollectorDataModal.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.$state;

const keyItemSets: KeyItemSet[] = [{
    title: 'Properties',
    items: [
        { name: 'collector_id', label: 'Collector Id' },
        { name: 'name', label: 'Name' },
        { name: 'schedule.state', label: 'Schedule' },
        { name: 'plugin_info.plugin_id', label: 'Plugin' },
        { name: 'plugin_info.version', label: 'Version' },
        { name: 'created_at', label: 'Created' },
        { name: 'last_collected_at', label: 'Last Collected' },
    ],
}];
const valueHandlerMap: ValueHandlerMap = {
    collector_id: makeDistinctValueHandler('inventory.Collector', 'collector_id'),
    name: makeDistinctValueHandler('inventory.Collector', 'name'),
    'schedule.state': makeDistinctValueHandler('inventory.Collector', 'schedule.state'),
    'plugin_info.plugin_id': makeDistinctValueHandler('inventory.Collector', 'plugin_info.plugin_id'),
    'plugin_info.version': makeDistinctValueHandler('inventory.Collector', 'plugin_info.version'),
    created_at: makeDistinctValueHandler('inventory.Collector', 'created_at'),
    last_collected_at: makeDistinctValueHandler('inventory.Collector', 'last_collected_at'),
};
const excelFields: ExcelDataField[] = [
    { key: 'name', name: 'Name' },
    { key: 'schedule.state', name: 'Schedule state' },
    { key: 'plugin_info.plugin_id', name: 'Plugin' },
    { key: 'plugin_info.version', name: 'Version' },
    { key: 'last_collected_at', name: 'Last Collected', type: 'datetime' },
];

const historyLinkQueryHelper = new QueryHelper();

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
});

const state = reactive({
    searchTags: computed(() => searchQueryHelper.setFilters(collectorPageState.searchFilters).queryTags),
    items: computed<CollectorItemInfo[]|undefined>(() => {
        const plugins = storeState.plugins;
        return collectorPageState.collectors?.map((d) => {
            historyLinkQueryHelper.setFilters([
                {
                    k: COLLECTOR_QUERY_HELPER_SET.COLLECTOR_ID,
                    v: d.collector_id,
                    o: '=',
                },
            ]);

            const matchedJob = collectorPageState.collectorJobStatus.find((status) => status.collector_id === d.collector_id);
            const recentJobAnalyze = matchedJob ? matchedJob.job_status.slice(-5) : undefined;

            return {
                collectorId: d.collector_id,
                name: d.name,
                plugin: {
                    name: plugins[d.plugin_info.plugin_id].label,
                    icon: plugins[d.plugin_info.plugin_id].icon,
                    info: d.plugin_info,
                },
                historyLink: {
                    params: { id: d.collector_id },
                    query: {
                        filters: historyLinkQueryHelper.rawQueryStrings,
                    },
                    name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME,
                },
                detailLink: {
                    name: ASSET_INVENTORY_ROUTE.COLLECTOR.DETAIL._NAME,
                    params: {
                        collectorId: d.collector_id,
                    },
                },
                schedule: d.schedule,
                recentJobAnalyze,
                hasJobList: !!matchedJob,
            };
        });
    }),
});

const searchQueryHelper = new QueryHelper().setKeyItemSets(keyItemSets);
const collectorApiQueryHelper = new ApiQueryHelper()
    .setOnly(
        COLLECTOR_QUERY_HELPER_SET.COLLECTOR_ID,
        COLLECTOR_QUERY_HELPER_SET.NAME,
        COLLECTOR_QUERY_HELPER_SET.SCHEDULE,
        COLLECTOR_QUERY_HELPER_SET.PLUGIN_INFO,
        COLLECTOR_QUERY_HELPER_SET.LAST_COLLECTED_AT,
        COLLECTOR_QUERY_HELPER_SET.PROVIDER,
    )
    .setPage(collectorPageState.pageStart, collectorPageState.pageLimit)
    .setSort(collectorPageState.sortBy, true);


/* Components */
const routeToCreatePage = () => {
    SpaceRouter.router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME });
};
const handleChangeToolbox = (options: ToolboxOptions) => {
    if (options.pageStart !== undefined) collectorApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) collectorApiQueryHelper.setPageLimit(options.pageLimit);

    if (options.queryTags !== undefined) {
        // convert queryTags to filters
        searchQueryHelper.setFiltersAsQueryTag(options.queryTags);
        // set filters to store
        collectorPageStore.$patch((_state) => {
            _state.searchFilters = searchQueryHelper.filters;
        });
        // set filters to apiQueryHelper
        collectorApiQueryHelper.setFilters(collectorPageStore.allFilters);
    }

    fetchCollectorList();
};
const handleClickListItem = (detailLink) => {
    SpaceRouter.router.push(detailLink);
};
const handleClickCollectDataConfirm = () => {
    fetchCollectorList();
};

/* API */
const handleExportExcel = async () => {
    await store.dispatch('file/downloadExcel', {
        url: '/inventory/collector/list',
        param: { query: collectorApiQueryHelper.data },
        fields: excelFields,
        file_name_prefix: FILE_NAME_PREFIX.collector,
    });
};
const fetchCollectorList = async () => {
    collectorApiQueryHelper.setFilters(collectorPageStore.allFilters);
    try {
        await collectorPageStore.getCollectorList(collectorApiQueryHelper.data);
    } catch (e) {
        ErrorHandler.handleError(e);
        await collectorPageStore.$reset();
    }
};

/* Watcher */
watch(() => collectorPageState.collectors, async () => {
    const ids = state.items?.map((item) => item.collectorId) || [];
    if (ids.length > 0) {
        await collectorPageStore.setCollectorJobs(ids);
    }
});
watch(() => collectorPageState.selectedProvider, async () => {
    await fetchCollectorList();
});

onMounted(async () => {
    await fetchCollectorList();
});
</script>

<template>
    <div class="collector-contents">
        <p-toolbox
            exportable
            filters-visible
            search-type="query"
            :key-item-sets="keyItemSets"
            :query-tags="state.searchTags"
            :value-handler-map="valueHandlerMap"
            :total-count="collectorPageState.totalCount"
            @change="handleChangeToolbox"
            @refresh="fetchCollectorList"
            @export="handleExportExcel"
        >
            <template #left-area>
                <p-button
                    icon-left="ic_plus_bold"
                    class="create-button"
                    @click="routeToCreatePage"
                >
                    {{ $t('INVENTORY.COLLECTOR.MAIN.CREATE') }}
                </p-button>
            </template>
        </p-toolbox>
        <p-data-loader :data="state.items"
                       :loading="collectorPageState.loading.collectorList"
                       class="collector-list-wrapper"
        >
            <div class="collector-lists">
                <div v-for="item in state.items"
                     :key="item.collectorId"
                     @click="handleClickListItem(item.detailLink)"
                >
                    <collector-content-item :item="item" />
                </div>
            </div>
            <template #no-data>
                <collector-list-no-data class="collector-no-data" />
            </template>
        </p-data-loader>
        <collector-schedule-modal @refresh-collector-list="fetchCollectorList" />
        <collector-data-modal @click-confirm="handleClickCollectDataConfirm" />
    </div>
</template>

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
            @apply grid grid-cols-3 gap-4;

            @screen desktop {
                @apply grid-cols-2;
            }

            @screen tablet {
                @apply flex flex-col;
            }
        }
    }
}
</style>
