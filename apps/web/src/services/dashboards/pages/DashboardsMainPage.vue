<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { clone, cloneDeep } from 'lodash';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeading, PDivider, PButton, PToolbox, PEmpty, PDataLoader,
} from '@cloudforet/mirinae';
import type { TreeNode } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';
import type { QueryTag } from '@cloudforet/mirinae/types/inputs/search/query-search-tags/type';
import type {
    HandlerResponse, KeyDataType, KeyItem, KeyItemSet, ValueHandler, ValueMenuItem,
} from '@cloudforet/mirinae/types/inputs/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/navigation/toolbox/type';

import { SpaceRouter } from '@/router';
import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { DashboardListParams, DashboardModel } from '@/schema/dashboard/_types/dashboard-type';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useQueryTags } from '@/common/composables/query-tags';

import DashboardFolderTree from '@/services/dashboards/components/dashboard-folder/DashboardFolderTree.vue';
import DashboardFolderTreeTitle from '@/services/dashboards/components/dashboard-folder/DashboardFolderTreeTitle.vue';
import DashboardMainBoardList from '@/services/dashboards/components/dashboard-main/DashboardMainBoardList.vue';
import { useDashboardControlButtons } from '@/services/dashboards/composables/use-dashboard-control-buttons';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';



const controlButtonsHelper = useDashboardControlButtons();
const { getProperRouteLocation } = useProperRouteLocation();
const appContextStore = useAppContextStore();
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardPageControlState = dashboardPageControlStore.state;
const dashboardPageControlGetters = dashboardPageControlStore.getters;

const router = useRouter();
const queryTagsHelper = useQueryTags({
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'labels', label: 'Label' },
        ],
    }],
});
const route = useRoute();

const storeState = reactive({
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    pageAccessPermissionMap: computed<PageAccessMap>(() => store.getters['user/pageAccessPermissionMap']),
});
const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    refinedPublicTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => {
        if (state.isSearching.PUBLIC) return [];
        if (!state.searchFilters.length) return dashboardPageControlGetters.publicDashboardTreeData;
        return getSearchedTreeData(dashboardPageControlGetters.publicDashboardTreeData, state.searchedDashboardIdList);
    }),
    refinedPrivateTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => {
        if (state.isSearching.PRIVATE) return [];
        if (!state.searchFilters.length) return dashboardPageControlGetters.privateDashboardTreeData;
        return getSearchedTreeData(dashboardPageControlGetters.privateDashboardTreeData, state.searchedDashboardIdList);
    }),
    isDashboardExist: computed<boolean>(() => {
        if (state.isAdminMode) {
            return !!dashboardPageControlGetters.publicDashboardItems.length || !!dashboardPageControlGetters.publicFolderItems.length;
        }
        return !!(
            dashboardPageControlGetters.publicDashboardItems.length
            || dashboardPageControlGetters.privateDashboardItems.length
            || dashboardPageControlGetters.deprecatedDashboardItems.length
            || dashboardPageControlGetters.publicFolderItems.length
            || dashboardPageControlGetters.privateFolderItems.length
        );
    }),
    treeCollapseMap: {
        public: false,
        private: false,
    } as Record<string, boolean>,
    publicTreeControlButtonDisableMap: computed<Record<string, boolean>>(() => {
        if (storeState.isAdminMode) return dashboardPageControlGetters.adminTreeControlButtonDisableMap;
        return dashboardPageControlGetters.publicTreeControlButtonDisableMap;
    }),
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        return targetMenuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[state.selectedMenuId]?.write),
    // search
    isSearching: {
        PUBLIC: false,
        PRIVATE: false,
    },
    searchFilters: [] as ConsoleFilter[],
    searchedDashboardIdList: new Set<string>(),
});

const queryState = reactive({
    urlQueryString: computed(() => ({
        filters: queryTagsHelper.urlQueryStringFilters.value,
    })),
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'labels', label: 'Label' },
        ],
    }]),
    valueHandlerMap: computed(() => ({
        labels: getDashboardValueHandler(),
    })),
    queryTags: computed<QueryTag[]>(() => queryTagsHelper.queryTags.value),
});

/* Util */
const getSearchedTreeData = (treeData: TreeNode<DashboardTreeDataType>[], searchedDashboardIdList: Set<string>): TreeNode<DashboardTreeDataType>[] => {
    const _results = [] as TreeNode<DashboardTreeDataType>[];
    treeData.forEach((node) => {
        if (node.data.type === 'DASHBOARD') {
            if (searchedDashboardIdList.has(node.data.id)) {
                _results.push(cloneDeep(node));
            }
        } else {
            const _children = getSearchedTreeData(node.children || [], searchedDashboardIdList);
            if (_children.length) {
                const _node = cloneDeep(node);
                _node.children = _children;
                _results.push(_node);
            }
        }
    });
    return _results;
};
const searchedDashboards = async () => {
    if (storeState.isAdminMode) {
        await fetchSearchedDashboard('PUBLIC');
    } else if (storeState.isWorkspaceOwner) {
        await fetchSearchedDashboard('PRIVATE');
        await fetchSearchedDashboard('PUBLIC');
    } else {
        await fetchSearchedDashboard('PRIVATE');
    }
};

/* Api */
const searchApiQueryHelper = new ApiQueryHelper();
const privateDashboardFetcher = getCancellableFetcher(SpaceConnector.clientV2.dashboard.privateDashboard.list);
const publicDashboardFetcher = getCancellableFetcher(SpaceConnector.clientV2.dashboard.publicDashboard.list);
const fetchSearchedDashboard = async (dashboardType: 'PUBLIC' | 'PRIVATE'): Promise<void> => {
    try {
        state.isSearching[dashboardType] = true;
        state.searchedDashboardIdList.clear();
        searchApiQueryHelper.setFilters(state.searchFilters);
        const fetcher = dashboardType === 'PRIVATE' ? privateDashboardFetcher : publicDashboardFetcher;
        const { status, response } = await fetcher<DashboardListParams, ListResponse<DashboardModel>>({
            query: {
                only: ['dashboard_id'],
                ...searchApiQueryHelper.data,
            },
        });
        if (status === 'succeed') {
            response.results?.map((d) => d.dashboard_id).forEach((id) => state.searchedDashboardIdList.add(id));
            state.isSearching[dashboardType] = false;
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        state.isSearching[dashboardType] = false;
    }
};

/* Event */
const handleCreateDashboard = () => { router.push(getProperRouteLocation({ name: DASHBOARDS_ROUTE.CREATE._NAME })); };
const handleCreateFolder = () => {
    dashboardPageControlStore.setFolderFormModalType('CREATE');
    dashboardPageControlStore.setFolderFormModalVisible(true);
};
const handleQueryChange = (options: ToolboxOptions = {}) => {
    if (options.queryTags !== undefined) {
        dashboardPageControlStore.setSearchQueryTags(options.queryTags);
    }
};
const handleUpdateSelectedIdMap = (type: 'PUBLIC' | 'PRIVATE', selectedIdMap: Record<string, boolean>) => {
    if (type === 'PUBLIC') {
        dashboardPageControlStore.setSelectedPublicIdMap(selectedIdMap);
    } else {
        dashboardPageControlStore.setSelectedPrivateIdMap(selectedIdMap);
    }
};

/* init */
let urlQueryStringWatcherStop;
const init = async () => {
    const currentQuery = SpaceRouter.router.currentRoute.query;
    queryTagsHelper.setURLQueryStringFilters(currentQuery.filters);
    dashboardPageControlStore.setSearchQueryTags(queryState.queryTags);

    urlQueryStringWatcherStop = watch(() => queryState.urlQueryString, (urlQueryString) => {
        replaceUrlQuery(urlQueryString);
    });
};

const getDashboardValueHandler = (): ValueHandler | undefined => {
    const publicLabelsValueHandler = makeDistinctValueHandler('dashboard.PublicDashboard', 'labels');
    const privateLabelsValueHandler = makeDistinctValueHandler('dashboard.PrivateDashboard', 'labels');
    if (!publicLabelsValueHandler && !privateLabelsValueHandler) return undefined;

    return async (inputText: string|number, keyItem: KeyItem, currentDataType?: KeyDataType, subPath?: string) => {
        const results = [] as ValueMenuItem[];
        const promises = [] as (HandlerResponse | Promise<HandlerResponse>)[];

        if (publicLabelsValueHandler) promises.push(publicLabelsValueHandler(inputText, keyItem, currentDataType, subPath));
        if (privateLabelsValueHandler) promises.push(privateLabelsValueHandler(inputText, keyItem, currentDataType, subPath));
        const responses = await Promise.allSettled(promises);

        // combine both of results and sort
        responses.forEach((res) => {
            if (res.status === 'fulfilled') {
                res.value.results.forEach((item) => {
                    if (results.some((d) => d.name === item.name)) return;
                    results.push(item);
                });
            }
        });
        results.sort((a, b) => (a.label > b.label ? 1 : -1));

        return {
            results,
            totalCount: results.length ?? 0,
        };
    };
};

(async () => {
    await init();
})();

watch(() => dashboardPageControlState.searchQueryTags, async (queryTags: QueryTag[]) => {
    queryTagsHelper.setQueryTags(queryTags || []);
    dashboardPageControlStore.resetSelectedIdMap();
    state.searchFilters = queryTagsHelper.filters.value;
    if (!state.searchFilters.length) {
        state.searchedDashboardIdList.clear();
        state.isSearching = false;
        return;
    }
    await searchedDashboards();
}, { immediate: true });

onUnmounted(() => {
    if (urlQueryStringWatcherStop) urlQueryStringWatcherStop();
    state.searchFilters = [];
    state.searchedDashboardIdList.clear();
});
</script>

<template>
    <div class="dashboards-main-page">
        <p-heading :title="$t('DASHBOARDS.ALL_DASHBOARDS.DASHBOARDS_TITLE')">
            <template v-if="state.hasReadWriteAccess"
                      #extra
            >
                <p-button icon-left="ic_plus_bold"
                          style-type="tertiary"
                          class="mr-4"
                          @click="handleCreateFolder"
                >
                    {{ $t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.NEW_FOLDER') }}
                </p-button>
                <p-button icon-left="ic_plus_bold"
                          @click="handleCreateDashboard"
                >
                    {{ $t('DASHBOARDS.ALL_DASHBOARDS.NEW_DASHBOARD') }}
                </p-button>
            </template>
        </p-heading>
        <p-divider class="dashboard-divider" />
        <p-toolbox filters-visible
                   search-type="query"
                   placeholder="Search Dashboard"
                   :pagination-visible="false"
                   :page-size-changeable="false"
                   :key-item-sets="queryState.keyItemSets"
                   :value-handler-map="queryState.valueHandlerMap"
                   :query-tags="queryState.queryTags"
                   @change="handleQueryChange"
                   @refresh="handleQueryChange()"
        />
        <p-data-loader :loading="dashboardPageControlGetters.loading"
                       :data="state.isDashboardExist"
                       class="dashboard-list-wrapper"
        >
            <template #no-data>
                <p-empty
                    show-image
                    :show-button="state.hasReadWriteAccess"
                >
                    <template #image>
                        <img alt="empty-default-image"
                             src="@/assets/images/illust_jellyocto-with-a-telescope.svg"
                        >
                    </template>
                    <template v-if="state.hasReadWriteAccess"
                              #button
                    >
                        <p-button icon-left="ic_plus_bold"
                                  @click="handleCreateDashboard"
                        >
                            {{ $t('DASHBOARDS.ALL_DASHBOARDS.CREAT_NEW_DASHBOARD') }}
                        </p-button>
                    </template>
                    {{ $t('DASHBOARDS.ALL_DASHBOARDS.HELP_TEXT_CREATE') }}
                </p-empty>
            </template>
            <div v-if="(storeState.isAdminMode || storeState.isWorkspaceOwner) && state.refinedPublicTreeData.length"
                 class="tree-wrapper"
            >
                <dashboard-folder-tree-title v-if="storeState.isWorkspaceOwner"
                                             :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.SHARED')"
                                             :is-collapsed.sync="state.treeCollapseMap.public"
                />
                <dashboard-folder-tree v-if="!state.treeCollapseMap.public"
                                       :selected-id-map="dashboardPageControlState.selectedPublicIdMap"
                                       :dashboard-tree-data="state.refinedPublicTreeData"
                                       :button-disable-map="state.publicTreeControlButtonDisableMap"
                                       @update:selectedIdMap="handleUpdateSelectedIdMap('PUBLIC', $event)"
                                       @click-clone="controlButtonsHelper.clickBundleCloneMenu('PUBLIC')"
                                       @click-delete="controlButtonsHelper.clickBundleDeleteMenu('PUBLIC')"
                                       @click-move="controlButtonsHelper.clickBundleMoveMenu('PUBLIC')"
                />
            </div>
            <div v-if="!storeState.isAdminMode && state.refinedPrivateTreeData.length"
                 class="tree-wrapper"
            >
                <dashboard-folder-tree-title :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE')"
                                             :is-collapsed.sync="state.treeCollapseMap.private"
                />
                <dashboard-folder-tree v-if="!state.treeCollapseMap.private"
                                       :selected-id-map="dashboardPageControlState.selectedPrivateIdMap"
                                       :dashboard-tree-data="state.refinedPrivateTreeData"
                                       :button-disable-map="dashboardPageControlGetters.privateTreeControlButtonDisableMap"
                                       @update:selectedIdMap="handleUpdateSelectedIdMap('PRIVATE', $event)"
                                       @click-clone="controlButtonsHelper.clickBundleCloneMenu('PRIVATE')"
                                       @click-delete="controlButtonsHelper.clickBundleDeleteMenu('PRIVATE')"
                                       @click-move="controlButtonsHelper.clickBundleMoveMenu('PRIVATE')"
                />
            </div>
            <dashboard-main-board-list v-if="dashboardPageControlGetters.deprecatedDashboardItems.length"
                                       class="dashboard-list"
                                       :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.DEPRECATED')"
                                       :dashboard-list="dashboardPageControlGetters.deprecatedDashboardItems"
                                       is-collapsed
            />
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.dashboards-main-page {
    @apply w-full;

    .dashboard-divider {
        margin-bottom: 1.125rem;
    }
    .dashboard-list-wrapper {
        @apply flex w-full;
        gap: 0.5rem;
        min-height: 16.875rem;

        .tree-wrapper {
            margin-bottom: 1rem;
        }
        .dashboard-list {
            @apply flex-grow w-full;
        }
    }

    @screen tablet {
        .dashboard-list-wrapper {
            display: block;
        }
    }
}
</style>
