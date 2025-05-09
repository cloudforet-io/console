<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { cloneDeep } from 'lodash';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import {
    PHeading, PDivider, PButton, PToolbox, PEmpty, PDataLoader, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { QueryTag } from '@cloudforet/mirinae/types/controls/search/query-search-tags/type';
import type {
    HandlerResponse, KeyDataType, KeyItem, KeyItemSet, ValueHandler, ValueMenuItem,
} from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';
import type { TreeNode } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { SpaceRouter } from '@/router';


import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import { replaceUrlQuery } from '@/lib/router-query-string';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useQueryTags } from '@/common/composables/query-tags';

import { DASHBOARD_CONTROL_MENU_ACTION_TYPES } from '@/services/_shared/dashboard/core/constants/dashboard-control-menu-constant';
import { DASHBOARD_SHARED_ENTRY_POINT } from '@/services/_shared/dashboard/core/constants/dashboard-shared-constant';
import type { DashboardControlActionType } from '@/services/_shared/dashboard/core/types/dashboard-control-menu-type';
import DashboardFolderTree from '@/services/dashboards/components/dashboard-folder/DashboardFolderTree.vue';
import DashboardFolderTreeTitle from '@/services/dashboards/components/dashboard-folder/DashboardFolderTreeTitle.vue';
import DashboardMainBoardList from '@/services/dashboards/components/dashboard-main/DashboardMainBoardList.vue';
import { useDashboardFolderQuery } from '@/services/dashboards/composables/use-dashboard-folder-query';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import { useDashboardSearchQuery } from '@/services/dashboards/composables/use-dashboard-search-query';
import {
    getDashboardTreeData,
    isPublicControlButtonDisabled,
} from '@/services/dashboards/helpers/dashboard-tree-data-helper';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';
import { useDashboardTreeControlStore } from '@/services/dashboards/stores/dashboard-tree-control-store';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';

const appContextStore = useAppContextStore();
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardTreeControlStore = useDashboardTreeControlStore();
const dashboardTreeControlState = dashboardTreeControlStore.state;
const authorizationStore = useAuthorizationStore();

const { hasReadWriteAccess } = usePageEditableStatus();

const router = useRouter();
const queryTagsHelper = useQueryTags({
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'labels', label: 'Label' },
        ],
    }],
});

/* Query */
const {
    publicDashboardList,
    privateDashboardList,
    isLoading: isDashboardLoading,
} = useDashboardQuery();
const {
    publicFolderList,
    privateFolderList,
    isLoading: isFolderLoading,
} = useDashboardFolderQuery();

const storeState = reactive({
    isWorkspaceOwner: computed<boolean>(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    isWorkspaceMember: computed<boolean>(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
});


const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    publicDashboardItems: computed(() => {
        const _v2DashboardItems = publicDashboardList.value.filter((d) => d.version !== '1.0');
        if (storeState.isAdminMode) return _v2DashboardItems;
        return _v2DashboardItems.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateDashboardItems: computed(() => privateDashboardList.value.filter((d) => d.version !== '1.0')),
    publicFolderItems: computed(() => {
        if (storeState.isAdminMode) return publicFolderList.value;
        return publicFolderList.value.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
    }),
    privateFolderItems: computed(() => privateFolderList.value),
    deprecatedDashboardItems: computed(() => {
        const _public = publicDashboardList.value.filter((d) => d.version === '1.0');
        const _private = privateDashboardList.value.filter((d) => d.version === '1.0');
        return [..._public, ..._private];
    }),
    publicDashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => getDashboardTreeData(state.publicFolderItems, state.publicDashboardItems, dashboardTreeControlState.newIdList)),
    privateDashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => getDashboardTreeData(state.privateFolderItems, state.privateDashboardItems, dashboardTreeControlState.newIdList)),
    publicTreeControlButtonDisableMap: computed<Record<string, boolean>>(() => {
        if (storeState.isAdminMode) {
            const _selectedPublicIdList: string[] = Object.entries(dashboardTreeControlState.selectedPublicIdMap).filter(([, isSelected]) => isSelected).map(([id]) => id);
            return {
                clone: _selectedPublicIdList.length === 0,
                move: _selectedPublicIdList.length === 0,
                delete: _selectedPublicIdList.length === 0,
            };
        }
        const _selectedPublicIdList: string[] = Object.entries(dashboardTreeControlState.selectedPublicIdMap).filter(([, isSelected]) => isSelected).map(([id]) => id);
        return {
            clone: _selectedPublicIdList.length === 0,
            move: isPublicControlButtonDisabled(state.publicDashboardItems, state.publicFolderItems, dashboardTreeControlState.selectedPublicIdMap),
            delete: isPublicControlButtonDisabled(state.publicDashboardItems, state.publicFolderItems, dashboardTreeControlState.selectedPublicIdMap),
        };
    }),
    privateTreeControlButtonDisableMap: computed<Record<string, boolean>>(() => {
        const _selectedPrivateIdList: string[] = Object.entries(dashboardTreeControlState.selectedPrivateIdMap).filter(([, isSelected]) => isSelected).map(([id]) => id);
        return {
            clone: _selectedPrivateIdList.length === 0,
            move: _selectedPrivateIdList.length === 0,
            delete: _selectedPrivateIdList.length === 0,
        };
    }),

    refinedPublicTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => {
        if (publicDashboardSearching.value) return [];
        if (!state.searchFilters.length) return state.publicDashboardTreeData;
        return getSearchedTreeData(state.publicDashboardTreeData, dashboardIdList.value);
    }),
    refinedPrivateTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => {
        if (privateDashboardSearching.value) return [];
        if (!state.searchFilters.length) return state.privateDashboardTreeData;
        return getSearchedTreeData(state.privateDashboardTreeData, dashboardIdList.value);
    }),
    isDashboardExist: computed<boolean>(() => {
        if (state.isAdminMode) {
            return !!state.publicDashboardItems.length || !!state.publicFolderItems.length;
        }
        return !!(
            state.publicDashboardItems.length
            || state.privateDashboardItems.length
            || state.deprecatedDashboardItems.length
            || state.publicFolderItems.length
            || state.privateFolderItems.length
        );
    }),
    treeCollapseMap: {
        public: false,
        private: false,
    } as Record<string, boolean>,
    searchFilters: [] as ConsoleFilter[],
    searchText: computed<string>(() => {
        if (!state.searchFilters.length) return '';
        const filter = state.searchFilters.find((_filter) => !_filter.k && !!_filter.v);
        if (!filter) return '';
        return String(filter.v);
    }),
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

/* Event */
const handleCreateDashboard = () => {
    const dashboardCreateRouteName = storeState.isAdminMode ? ADMIN_DASHBOARDS_ROUTE.CREATE._NAME : DASHBOARDS_ROUTE.CREATE._NAME;
    router.push({ name: dashboardCreateRouteName }).catch(() => {});
};
const handleCreateFolder = () => {
    dashboardPageControlStore.setFolderFormModalType('CREATE');
    dashboardPageControlStore.setFolderFormModalVisible(true);
};
const handleQueryChange = (options: ToolboxOptions = {}) => {
    if (options.queryTags !== undefined) {
        dashboardTreeControlStore.setSearchQueryTags(options.queryTags);
    }
};
const handleUpdateSelectedIdMap = (type: 'PUBLIC' | 'PRIVATE', selectedIdMap: Record<string, boolean>) => {
    if (type === 'PUBLIC') {
        dashboardTreeControlStore.setSelectedPublicIdMap(selectedIdMap);
    } else {
        dashboardTreeControlStore.setSelectedPrivateIdMap(selectedIdMap);
    }
};
const handleSelectControlActions = (type: DashboardControlActionType, id: string) => {
    if (type === DASHBOARD_CONTROL_MENU_ACTION_TYPES.EDIT) dashboardPageControlStore.openEditNameModal(id);
    if (type === DASHBOARD_CONTROL_MENU_ACTION_TYPES.CLONE) dashboardPageControlStore.openCloneModal(id);
    if (type === DASHBOARD_CONTROL_MENU_ACTION_TYPES.MOVE) dashboardPageControlStore.openMoveModal(id);
    if (type === DASHBOARD_CONTROL_MENU_ACTION_TYPES.SHARE) dashboardPageControlStore.openShareModal(id);
    if (type === DASHBOARD_CONTROL_MENU_ACTION_TYPES.SHARE_WITH_CODE) dashboardPageControlStore.openShareWithCodeModal(id);
    if (type === DASHBOARD_CONTROL_MENU_ACTION_TYPES.DELETE) dashboardPageControlStore.openDeleteModal(id);
};
const handleClickTreeItem = (node: TreeNode<DashboardTreeDataType>) => {
    if (node.data.type === 'DASHBOARD') {
        const dashboardDetailRouteName = storeState.isAdminMode
            ? ADMIN_DASHBOARDS_ROUTE.DETAIL._NAME
            : DASHBOARDS_ROUTE.DETAIL._NAME;
        const _location = {
            name: dashboardDetailRouteName,
            params: {
                dashboardId: node.data.id || '',
            },
        };
        router.push(_location).catch(() => {});
    }
};
/* init */
let urlQueryStringWatcherStop;
const init = async () => {
    const currentQuery = SpaceRouter.router.currentRoute.query;
    queryTagsHelper.setURLQueryStringFilters(currentQuery.filters);
    dashboardTreeControlStore.setSearchQueryTags(queryState.queryTags);

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

const {
    dashboardIdList,
    publicDashboardSearching,
    privateDashboardSearching,
} = useDashboardSearchQuery({
    searchFilters: computed(() => state.searchFilters),
});

watch(() => dashboardTreeControlState.searchQueryTags, async (queryTags: QueryTag[]) => {
    queryTagsHelper.setQueryTags(queryTags || []);
    dashboardTreeControlStore.resetSelectedIdMap();
    state.searchFilters = queryTagsHelper.filters.value;
}, { immediate: true });

onUnmounted(() => {
    if (urlQueryStringWatcherStop) urlQueryStringWatcherStop();
    state.searchFilters = [];
});
</script>

<template>
    <div class="dashboards-main-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('DASHBOARDS.ALL_DASHBOARDS.DASHBOARDS_TITLE')" />
            </template>
            <template v-if="hasReadWriteAccess"
                      #extra
            >
                <p-button icon-left="ic_plus_bold"
                          style-type="tertiary"
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
        </p-heading-layout>
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
        <p-data-loader :loading="isDashboardLoading || isFolderLoading"
                       :data="state.isDashboardExist"
                       class="dashboard-list-wrapper"
        >
            <template #no-data>
                <p-empty
                    show-image
                    :show-button="hasReadWriteAccess"
                >
                    <template #image>
                        <img alt="empty-default-image"
                             src="@/assets/images/illust_jellyocto-with-a-telescope.svg"
                        >
                    </template>
                    <template v-if="hasReadWriteAccess"
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
            <div v-if="state.refinedPublicTreeData.length"
                 class="tree-wrapper"
            >
                <dashboard-folder-tree-title v-if="!storeState.isAdminMode"
                                             :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.SHARED')"
                                             :is-collapsed.sync="state.treeCollapseMap.public"
                />
                <dashboard-folder-tree v-if="!state.treeCollapseMap.public"
                                       :entry-point="DASHBOARD_SHARED_ENTRY_POINT.DASHBOARDS"
                                       :selected-id-map="dashboardTreeControlState.selectedPublicIdMap"
                                       :dashboard-tree-data="state.refinedPublicTreeData"
                                       :button-disable-map="state.publicTreeControlButtonDisableMap"
                                       :show-control-buttons="!storeState.isWorkspaceMember"
                                       :search-text="state.searchText"
                                       @update:selectedIdMap="handleUpdateSelectedIdMap('PUBLIC', $event)"
                                       @click-control-clone="dashboardPageControlStore.openBundleCloneModal('PUBLIC')"
                                       @click-control-delete="dashboardPageControlStore.openBundleDeleteModal('PUBLIC')"
                                       @click-control-move="dashboardPageControlStore.openBundleMoveModal('PUBLIC')"
                                       @select-control-actions="handleSelectControlActions"
                                       @click-tree-item="handleClickTreeItem"
                />
            </div>
            <div v-if="!storeState.isAdminMode && state.refinedPrivateTreeData.length"
                 class="tree-wrapper"
            >
                <dashboard-folder-tree-title :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE')"
                                             :is-collapsed.sync="state.treeCollapseMap.private"
                />
                <dashboard-folder-tree v-if="!state.treeCollapseMap.private"
                                       :entry-point="DASHBOARD_SHARED_ENTRY_POINT.DASHBOARDS"
                                       :selected-id-map="dashboardTreeControlState.selectedPrivateIdMap"
                                       :dashboard-tree-data="state.refinedPrivateTreeData"
                                       :button-disable-map="state.privateTreeControlButtonDisableMap"
                                       show-control-buttons
                                       :search-text="state.searchText"
                                       @update:selectedIdMap="handleUpdateSelectedIdMap('PRIVATE', $event)"
                                       @click-control-clone="dashboardPageControlStore.openBundleCloneModal('PRIVATE')"
                                       @click-control-delete="dashboardPageControlStore.openBundleDeleteModal('PRIVATE')"
                                       @click-control-move="dashboardPageControlStore.openBundleMoveModal('PRIVATE')"
                                       @select-control-actions="handleSelectControlActions"
                                       @click-tree-item="handleClickTreeItem"
                />
            </div>
            <dashboard-main-board-list v-if="state.deprecatedDashboardItems.length"
                                       class="dashboard-list"
                                       :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.DEPRECATED')"
                                       :dashboard-list="state.deprecatedDashboardItems"
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
