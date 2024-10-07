<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { clone } from 'lodash';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
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
import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { replaceUrlQuery } from '@/lib/router-query-string';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useQueryTags } from '@/common/composables/query-tags';

import DashboardFolderBundleMoveModal from '@/services/dashboards/components/dashboard-folder/DashboardFolderBundleMoveModal.vue';
import DashboardFolderCloneModal from '@/services/dashboards/components/dashboard-folder/DashboardFolderCloneModal.vue';
import DashboardFolderDeleteModal
    from '@/services/dashboards/components/dashboard-folder/DashboardFolderDeleteModal.vue';
import DashboardFolderFormModal
    from '@/services/dashboards/components/dashboard-folder/DashboardFolderFormModal.vue';
import DashboardFolderShareModal from '@/services/dashboards/components/dashboard-folder/DashboardFolderShareModal.vue';
import DashboardFolderTree from '@/services/dashboards/components/dashboard-folder/DashboardFolderTree.vue';
import DashboardFolderTreeTitle from '@/services/dashboards/components/dashboard-folder/DashboardFolderTreeTitle.vue';
import DashboardMainBoardList from '@/services/dashboards/components/dashboard-main/DashboardMainBoardList.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';

const { getProperRouteLocation } = useProperRouteLocation();
const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
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
    refinedPublicTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => getSearchedTreeData(dashboardPageControlGetters.publicDashboardTreeData, dashboardPageControlState.searchFilters)),
    refinedPrivateTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => getSearchedTreeData(dashboardPageControlGetters.privateDashboardTreeData, dashboardPageControlState.searchFilters)),
    deprecatedDashboardList: computed<Array<PublicDashboardModel|PrivateDashboardModel>>(() => {
        const _publicDeprecated = dashboardState.publicDashboardItems.filter((d) => d.version === '1.0');
        const _privateDeprecated = dashboardState.privateDashboardItems.filter((d) => d.version === '1.0');
        return [..._publicDeprecated, ..._privateDeprecated];
    }),
    isDashboardExist: computed<boolean>(() => {
        if (state.isAdminMode) {
            return !!dashboardPageControlState.publicDashboardList.length || !!dashboardPageControlState.publicFolderList.length;
        }
        return !!(
            dashboardPageControlState.publicDashboardList.length
            || dashboardPageControlState.privateDashboardList.length
            || state.deprecatedDashboardList.length
            || dashboardPageControlState.publicFolderList.length
            || dashboardPageControlState.privateFolderList.length
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
const getSearchedTreeData = (treeData: TreeNode<DashboardTreeDataType>[], searchFilters: ConsoleFilter[]): TreeNode<DashboardTreeDataType>[] => {
    if (!searchFilters.length) return treeData;
    return treeData.filter((node) => {
        if (node.data.type === 'DASHBOARD') return true;
        return !!node.children?.length;
    });
};

const handleCreateDashboard = () => { router.push(getProperRouteLocation({ name: DASHBOARDS_ROUTE.CREATE._NAME })); };
const handleCreateFolder = () => {
    dashboardPageControlStore.setFolderFormModalType('CREATE');
    dashboardPageControlStore.setFolderFormModalVisible(true);
};
const handleQueryChange = (options: ToolboxOptions = {}) => {
    if (options.queryTags !== undefined) {
        dashboardPageControlStore.setSearchQueryTags(options.queryTags);
    } else {
        dashboardPageControlStore.load();
    }
};
const handleUpdateSelectedIdMap = (type: 'PUBLIC' | 'PRIVATE', selectedIdMap: Record<string, boolean>) => {
    if (type === 'PUBLIC') {
        dashboardPageControlStore.setSelectedPublicIdMap(selectedIdMap);
    } else {
        dashboardPageControlStore.setSelectedPrivateIdMap(selectedIdMap);
    }
};
const handleClickCloneButton = (type: 'PUBLIC' | 'PRIVATE') => {
    dashboardPageControlStore.setFolderModalType(type);
    dashboardPageControlStore.setFolderCloneModalVisible(true);
};
const handleClickDeleteButton = (type: 'PUBLIC' | 'PRIVATE') => {
    dashboardPageControlStore.setFolderModalType(type);
    dashboardPageControlStore.setFolderDeleteModalVisible(true);
};
const handleClickMoveButton = (type: 'PUBLIC' | 'PRIVATE') => {
    dashboardPageControlStore.setFolderModalType(type);
    dashboardPageControlStore.setFolderMoveModalVisible(true);
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
    await dashboardPageControlStore.load();
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

watch(() => dashboardPageControlState.searchQueryTags, (queryTags) => {
    queryTagsHelper.setQueryTags(queryTags || []);
    dashboardPageControlStore.resetSelectedIdMap();
    dashboardPageControlStore.setSearchFilters(queryTagsHelper.filters.value);
    dashboardPageControlStore.load();
}, { immediate: true });

onUnmounted(() => {
    if (urlQueryStringWatcherStop) urlQueryStringWatcherStop();
    dashboardPageControlStore.setSearchFilters([]);
    dashboardPageControlStore.load();
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
        <p-data-loader :loading="dashboardPageControlState.loading"
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
                                       @click-clone="handleClickCloneButton('PUBLIC')"
                                       @click-delete="handleClickDeleteButton('PUBLIC')"
                                       @click-move="handleClickMoveButton('PUBLIC')"
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
                                       @click-clone="handleClickCloneButton('PRIVATE')"
                                       @click-delete="handleClickDeleteButton('PRIVATE')"
                                       @click-move="handleClickMoveButton('PRIVATE')"
                />
            </div>
            <dashboard-main-board-list v-if="state.deprecatedDashboardList.length"
                                       class="dashboard-list"
                                       :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.DEPRECATED')"
                                       :dashboard-list="state.deprecatedDashboardList"
                                       is-collapsed
            />
            <dashboard-folder-form-modal :visible="dashboardPageControlState.folderFormModalVisible"
                                         @update:visible="dashboardPageControlStore.setFolderFormModalVisible"
            />
            <dashboard-folder-delete-modal :visible="dashboardPageControlState.folderDeleteModalVisible"
                                           @update:visible="dashboardPageControlStore.setFolderDeleteModalVisible"
            />
            <dashboard-folder-bundle-move-modal :visible="dashboardPageControlState.folderMoveModalVisible"
                                                @update:visible="dashboardPageControlStore.setFolderMoveModalVisible"
            />
            <dashboard-folder-clone-modal :visible="dashboardPageControlState.folderCloneModalVisible"
                                          @update:visible="dashboardPageControlStore.setFolderCloneModalVisible"
            />
            <dashboard-folder-share-modal :visible="dashboardPageControlState.folderShareModalVisible"
                                          @update:visible="dashboardPageControlStore.setFolderShareModalVisible"
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
