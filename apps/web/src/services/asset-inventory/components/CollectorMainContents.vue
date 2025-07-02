<script setup lang="ts">
import {
    onMounted, computed, reactive,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { clone } from 'lodash';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PToolbox, PButton, PDataLoader } from '@cloudforet/mirinae';
import type {
    KeyItemSet,
    QueryItem,
    ValueHandler,
    ValueHandlerMap,
} from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import { useQueryTags } from '@/common/composables/query-tags';

import CollectorDataModal
    from '@/services/asset-inventory/components/CollectorDataModal.vue';
import CollectorContentItem from '@/services/asset-inventory/components/CollectorMainContentItem.vue';
import CollectorListNoData from '@/services/asset-inventory/components/CollectorMainListNoData.vue';
import CollectorScheduleModal
    from '@/services/asset-inventory/components/CollectorMainScheduleModal.vue';
import { useCollectorListQuery } from '@/services/asset-inventory/composables/use-collector-list-query';
import { useInventoryJobAnalyzeQuery } from '@/services/asset-inventory/composables/use-inventory-job-analyze-query';
import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useCollectorPageStore } from '@/services/asset-inventory/stores/collector-page-store';
import type { CollectorItemInfo } from '@/services/asset-inventory/types/collector-main-page-type';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

/** * @function
 *   @name makePluginReferenceValueHandler
 *   @param distinct
 */
const makePluginReferenceValueHandler = (distinct: string, plugins: PluginReferenceMap): ValueHandler|undefined => {
    const param: any = {
        resource_type: 'inventory.Collector',
        options: { limit: 10 },
        distinct_key: distinct,
    };

    return async () => {
        try {
            const { results } = await SpaceConnector.client.addOns.autocomplete.distinct(param);

            return {
                results: results.slice(0, 10).reduce((r, d) => {
                    if (d.name !== '' && d.name !== undefined && d.name !== null) r.push({ label: plugins[d.key].label, name: d.key });
                    return r;
                }, []),
                totalCount: results.length,
            };
        } catch (e) {
            return {
                results: [],
                totalCount: 0,
            };
        }
    };
};

const collectorPageStore = useCollectorPageStore();
const collectorPageState = collectorPageStore.state;
const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();
const authorizationStore = useAuthorizationStore();
const appContextStore = useAppContextStore();
const router = useRouter();
const route = useRoute();

const storeState = reactive({
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
    plugins: computed<PluginReferenceMap>(() => allReferenceStore.getters.plugin),
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
});

const keyItemSets: KeyItemSet[] = [{
    title: 'Properties',
    items: [
        { name: 'collector_id', label: 'Collector ID' },
        { name: 'name', label: 'Name' },
        { name: 'schedule.state', label: 'Schedule' },
        { name: 'plugin_info.plugin_id', label: 'Plugin' },
        { name: 'plugin_info.version', label: 'Version' },
        { name: 'created_at', label: 'Created', dataType: 'datetime' },
        { name: 'last_collected_at', label: 'Last Collected', dataType: 'datetime' },
    ],
}];
const collectorSearchHandler = reactive({
    valueHandlerMap: computed<ValueHandlerMap>(() => ({
        collector_id: makeDistinctValueHandler('inventory.Collector', 'collector_id', undefined, storeState.isAdminMode ? [{ k: 'workspace_id', v: '*', o: 'eq' }] : undefined),
        name: makeDistinctValueHandler('inventory.Collector', 'name', undefined, storeState.isAdminMode ? [{ k: 'workspace_id', v: '*', o: 'eq' }] : undefined),
        'schedule.state': makeDistinctValueHandler('inventory.Collector', 'schedule.state'),
        'plugin_info.plugin_id': makePluginReferenceValueHandler('plugin_info.plugin_id', storeState.plugins),
        'plugin_info.version': makeDistinctValueHandler('inventory.Collector', 'plugin_info.version'),
        created_at: makeDistinctValueHandler('inventory.Collector', 'created_at'),
        last_collected_at: makeDistinctValueHandler('inventory.Collector', 'last_collected_at'),
    })),
});
const excelFields: ExcelDataField[] = [
    { key: 'name', name: 'Name' },
    { key: 'schedule.state', name: 'Schedule' },
    { key: 'plugin_info.plugin_id', name: 'Plugin' },
    { key: 'plugin_info.version', name: 'Version' },
    { key: 'last_collected_at', name: 'Last Collected', type: 'datetime' },
];

const historyLinkQueryHelper = new QueryHelper();

const state = reactive({
    thisPage: 1,
    pageSize: 24,
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
            return '';
        }
        return targetMenuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => authorizationStore.getters.pageAccessPermissionMap[state.selectedMenuId]?.write),
    searchTags: computed<QueryItem[]>(() => queryTags.value.reduce((r: QueryItem[], d: any): QueryItem[] => {
        if (d.value && d?.key?.name === 'plugin_info.plugin_id') {
            const plugin = storeState.plugins[d.value.name];
            r.push({ ...d, value: { label: plugin?.label, name: plugin?.key } });
        } else {
            r.push(d);
        }
        return r;
    }, [])),
    items: computed<CollectorItemInfo[]|undefined>(() => {
        const plugins = storeState.plugins;
        return collectorListData.value?.results?.map((d) => {
            historyLinkQueryHelper.setFilters([
                {
                    k: 'collector_id',
                    v: d.collector_id,
                    o: '=',
                },
            ]);

            const matchedJob = jobAnalyzeData.value?.results?.find((status) => status.collector_id === d.collector_id);
            const recentJobAnalyze = matchedJob ? matchedJob?.job_status : [];
            return {
                collectorId: d.collector_id,
                workspaceId: d.workspace_id,
                name: d.name,
                plugin: {
                    name: plugins[d.plugin_info.plugin_id]?.label,
                    icon: plugins[d.plugin_info.plugin_id]?.icon,
                    info: d.plugin_info,
                },
                historyLink: {
                    params: { id: d.collector_id },
                    query: {
                        filters: historyLinkQueryHelper.rawQueryStrings,
                    },
                    name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME : ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME,
                },
                detailLink: {
                    name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR.DETAIL._NAME : ASSET_INVENTORY_ROUTE.COLLECTOR.DETAIL._NAME,
                    params: {
                        collectorId: d.collector_id,
                    },
                },
                schedule: d.schedule,
                recentJobAnalyze,
                resourceGroup: d.resource_group,
                hasJobList: !!matchedJob,
            };
        }) || [];
    }),
});

const queryTagHelper = useQueryTags({ keyItemSets });
const { queryTags } = queryTagHelper;

/* Components */
const routeToCreatePage = () => {
    router.push({ name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME : ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME }).catch(() => {});
};
const handleChangeToolbox = (options?: ToolboxOptions) => {
    if (options?.queryTags !== undefined) {
        queryTagHelper.setQueryTags(options.queryTags);
    }
    collectorPageState.searchFilters = queryTagHelper.filters.value;
};
const handleClickListItem = (detailLink) => {
    router.push(detailLink).catch(() => {});
};

/* Query */
const collectorApiQueryHelper = new ApiQueryHelper().setSort('name', true);
const { collectorListData, isLoading, totalCount } = useCollectorListQuery({
    thisPage: computed(() => state.thisPage),
    pageSize: computed(() => state.pageSize),
    params: computed(() => {
        collectorApiQueryHelper.setFilters(queryTagHelper.filters.value);
        if (collectorPageState.selectedProvider !== 'all') {
            collectorApiQueryHelper.addFilter({ k: 'provider', v: collectorPageState.selectedProvider, o: '=' });
        }
        if (storeState.isAdminMode) {
            collectorApiQueryHelper.addFilter({ k: 'workspace_id', v: '*', o: '=' });
        }
        return {
            query: {
                ...collectorApiQueryHelper.data,
            },
        };
    }),
});
const { data: jobAnalyzeData } = useInventoryJobAnalyzeQuery({
    collectorIds: computed(() => collectorListData.value?.results?.map((d) => d.collector_id) || []),
});

/* API */
const handleExportExcel = async () => {
    await downloadExcel({
        url: '/inventory/collector/list',
        param: { query: collectorApiQueryHelper.data },
        fields: excelFields,
        file_name_prefix: FILE_NAME_PREFIX.collector,
        timezone: storeState.timezone,
    });
};

onMounted(async () => {
    queryTagHelper.setFilters(collectorPageState.searchFilters); // init url query string
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
            :value-handler-map="collectorSearchHandler.valueHandlerMap"
            :total-count="totalCount"
            :this-page.sync="state.thisPage"
            :page-size.sync="state.pageSize"
            @change="handleChangeToolbox"
            @refresh="handleChangeToolbox()"
            @export="handleExportExcel"
        >
            <template v-if="state.hasReadWriteAccess"
                      #left-area
            >
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
                       :loading="isLoading"
                       class="collector-list-wrapper"
        >
            <div class="collector-lists">
                <div v-for="item in state.items"
                     :key="item.collectorId"
                     @click="handleClickListItem(item.detailLink)"
                >
                    <collector-content-item :item="item"
                                            :has-read-write-access="state.hasReadWriteAccess"
                    />
                </div>
            </div>
            <template #no-data>
                <collector-list-no-data class="collector-no-data" />
            </template>
        </p-data-loader>
        <collector-schedule-modal />
        <collector-data-modal />
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
            @apply desktop:grid-cols-2;
            @apply tablet:flex tablet:flex-col;
        }
    }
}
</style>
