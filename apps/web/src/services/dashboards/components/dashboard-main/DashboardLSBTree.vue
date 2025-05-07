<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PI, PTreeView, PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { TreeNode, TreeDisplayMap } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/api-clients/dashboard/_types/folder-type';
import type { PrivateFolderModel } from '@/api-clients/dashboard/private-folder/schema/model';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { gray } from '@/styles/colors';

import { useDashboardControlMenuHelper } from '@/services/_shared/dashboard/core/composables/use-dashboard-control-menu-helper';
import { isDashboardOrFolderManageable } from '@/services/dashboards/helpers/dashboard-manageable-helper';
import { getDashboardTreeData } from '@/services/dashboards/helpers/dashboard-tree-data-helper';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';

interface Props {
    dashboards: DashboardModel[];
    folders: (PrivateFolderModel|PublicFolderModel)[];
    type: 'PRIVATE' | 'PUBLIC';
}
const props = withDefaults(defineProps<Props>(), {
    dashboards: () => ([]),
    type: 'PUBLIC',
});
const route = useRoute();
const router = useRouter();
const dashboardPageControlStore = useDashboardPageControlStore();
const appContextStore = useAppContextStore();
const authorizationStore = useAuthorizationStore();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceOwner: computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
});

const { getControlDashboardMenuItems, getControlFolderMenuItems } = useDashboardControlMenuHelper();

const state = reactive({
    currentParentPathIds: [] as string[],
    currentFolderId: undefined as string|undefined,
    treeDisplayMap: {} as TreeDisplayMap,
    dashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => getDashboardTreeData(props.folders, props.dashboards)),
    selectedTreeId: undefined as string|undefined,
});

/* Util */
const updateTreeDisplayMap = (selectedTreeId: string) => {
    state.treeDisplayMap[selectedTreeId] = { isOpen: !state.treeDisplayMap[selectedTreeId]?.isOpen };
    state.currentFolderId = selectedTreeId;
    state.treeDisplayMap = { ...state.treeDisplayMap };
};
const init = (dashboardId?: string, _onMounted?: boolean) => {
    if (!dashboardId) {
        state.selectedTreeId = undefined;
        return;
    }
    state.selectedTreeId = dashboardId as string;
    const folderId = props.dashboards.find((d) => d.dashboard_id === dashboardId)?.folder_id;
    if (_onMounted && folderId) {
        updateTreeDisplayMap(folderId);
    }
};

const getControlMenuItems = (node: TreeNode<DashboardTreeDataType>): MenuItem[] => {
    if (node.data.type === 'DASHBOARD') {
        const _dashboard = node.data as DashboardModel;
        const _isPrivate = _dashboard.dashboard_id?.startsWith('private') || false;
        const _manageable = isDashboardOrFolderManageable(
            storeState.isAdminMode,
            storeState.isWorkspaceOwner,
            _isPrivate,
            _dashboard?.shared,
            _dashboard?.resource_group,
        );
        return getControlDashboardMenuItems(node.data.id, _manageable, _dashboard);
    }
    if (node.data.type === 'FOLDER') {
        const _folder = node.data as FolderModel;
        const _isPrivate = _folder.folder_id?.startsWith('private') || false;
        const _manageable = isDashboardOrFolderManageable(
            storeState.isAdminMode,
            storeState.isWorkspaceOwner,
            _isPrivate,
            _folder?.shared,
            _folder?.resource_group,
        );
        return getControlFolderMenuItems(node.data.id, _manageable, _folder);
    }
    return [];
};



/* Event */
const handleClickTreeItem = (node: TreeNode<DashboardTreeDataType>) => {
    if (node.data.type === 'FOLDER') {
        updateTreeDisplayMap(node.data.id);
        return;
    }
    const dashboardDetailRouteName = storeState.isAdminMode
        ? ADMIN_DASHBOARDS_ROUTE.DETAIL._NAME
        : DASHBOARDS_ROUTE.DETAIL._NAME;
    router.push({
        name: dashboardDetailRouteName,
        params: {
            dashboardId: node.data.id || '',
        },
    }).catch(() => {});
};
const handleSelectControlButton = (id: string, item: MenuItem) => {
    if (item.name === 'edit') dashboardPageControlStore.openEditNameModal(id);
    if (item.name === 'clone') dashboardPageControlStore.openCloneModal(id);
    if (item.name === 'move') dashboardPageControlStore.openMoveModal(id);
    if (item.name === 'share') dashboardPageControlStore.openShareModal(id);
    if (item.name === 'shareWithCode') dashboardPageControlStore.openShareWithCodeModal(id);
    if (item.name === 'delete') dashboardPageControlStore.openDeleteModal(id);
};

/* Watcher */
watch(() => route.params, ({ dashboardId }) => {
    init(dashboardId);
});

/* Lifecycle */
onMounted(() => {
    init(route.params.dashboardId, true);
});
</script>

<template>
    <div class="project-main-tree"
         :style="{ maxHeight: storeState.isAdminMode ? undefined : '19rem' }"
    >
        <p-tree-view :tree-data="state.dashboardTreeData"
                     :tree-display-map="state.treeDisplayMap"
                     :selected-id="state.selectedTreeId"
                     use-default-indent
        >
            <template #content="{ node }">
                <div class="dashboard-menu-item-content"
                     @click="handleClickTreeItem(node)"
                >
                    <div class="contents-wrapper">
                        <p-i class="dashboard-icon"
                             :name="Array.isArray(node.children) ? 'ic_folder' : 'ic_service_dashboard'"
                             :color="gray[600]"
                             width="0.875rem"
                             height="0.875rem"
                        />
                        <span class="text">{{ node.data.name }}</span>
                    </div>
                    <div class="hover-contents-wrapper">
                        <p-select-dropdown style-type="tertiary-icon-button"
                                           button-icon="ic_ellipsis-horizontal"
                                           :menu="getControlMenuItems(node)"
                                           :selected="[]"
                                           size="sm"
                                           menu-position="left"
                                           reset-selection-on-menu-close
                                           use-fixed-menu-style
                                           @select="handleSelectControlButton(node.data.id, $event)"
                        />
                        <favorite-button v-if="node.data.type === 'DASHBOARD'"
                                         :item-id="node.id"
                                         :favorite-type="FAVORITE_TYPE.DASHBOARD"
                                         scale="0.8"
                                         class="favorite-button"
                        />
                    </div>
                </div>
            </template>
        </p-tree-view>
    </div>
</template>

<style scoped lang="postcss">
.project-main-tree {
    width: 100%;
    overflow-y: auto;
    .dashboard-menu-item-content {
        @apply flex items-center justify-between w-full;
        height: 2rem;
        .contents-wrapper {
            @apply flex items-center gap-1 w-full;

            .dashboard-icon {
                min-width: 0.875rem;
            }
            .text {
                @apply text-label-md text-gray-900;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .hover-contents-wrapper {
            display: none;
            min-width: 1.5rem;
            height: 1rem;
            align-items: center;
            gap: 0.25rem;
            padding-left: 0.5rem;
        }

        &:hover {
            .contents-wrapper {
                width: calc(100% - 3rem);
            }
            .hover-contents-wrapper {
                display: flex;
            }
        }
    }
}
</style>
