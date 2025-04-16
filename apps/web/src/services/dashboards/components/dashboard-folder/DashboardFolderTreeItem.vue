<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import {
    PI, PTreeItem, PLabel, PPopover, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { QueryTag } from '@cloudforet/mirinae/types/controls/search/query-search-tags/type';
import type { TreeNode } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/api-clients/dashboard/_types/folder-type';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';

import NewMark from '@/common/components/marks/NewMark.vue';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { gray, indigo, violet } from '@/styles/colors';

import { useDashboardControlMenuHelper } from '@/services/_shared/dashboard/core/composables/use-dashboard-control-menu-helper';
import { isDashboardOrFolderManageable } from '@/services/dashboards/helpers/dashboard-manageable-helper';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';

interface Props {
    treeData: TreeNode<DashboardTreeDataType>;
    // for dashboard create page
    disableLink?: boolean;
    readonlyMode?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
});
const emit = defineEmits<{(e: 'toggle-folder'): void;
}>();
const LABELS_LIMIT = 2;
const router = useRouter();
const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardPageControlState = dashboardPageControlStore.state;
const userStore = useUserStore();

const { getControlDashboardMenuItems, getControlFolderMenuItems } = useDashboardControlMenuHelper();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceOwner: computed(() => userStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
});
const state = reactive({
    slicedLabels: computed(() => props.treeData.data?.labels?.slice(0, LABELS_LIMIT) || []),
    showMoreLabels: computed(() => {
        if (!props.treeData?.data?.labels) return false;
        return props.treeData.data.labels.length > LABELS_LIMIT;
    }),
});

/* Util */
const getSharedColor = (node: TreeNode<DashboardTreeDataType>): string|undefined => {
    if (node.data?.shared) {
        if (node.data?.scope === 'PROJECT') return violet[500];
        return indigo[500];
    }
    return undefined;
};
const getSharedText = (node: TreeNode<DashboardTreeDataType>): TranslateResult|undefined => {
    if (node.data?.shared) {
        if (storeState.isAdminMode) {
            if (node.data?.scope === 'PROJECT') return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_ALL_PROJECTS');
            return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_WORKSPACES');
        }
        if (node.data?.scope === 'PROJECT') return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_ALL_PROJECTS');
        return i18n.t('DASHBOARDS.DETAIL.SHARED_BY_ADMIN');
    }
    return undefined;
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
const handleClickTreeItem = (): void => {
    if (props.treeData.data.type === 'FOLDER') {
        emit('toggle-folder');
        return;
    }
    if (props.disableLink) return;
    const dashboardDetailRouteName = storeState.isAdminMode
        ? ADMIN_DASHBOARDS_ROUTE.DETAIL._NAME
        : DASHBOARDS_ROUTE.DETAIL._NAME;
    const _location = {
        name: dashboardDetailRouteName,
        params: {
            workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
            dashboardId: props.treeData.data.id || '',
        },
    };
    const _target = props.readonlyMode ? '_blank' : '_self';
    if (_target === '_blank') {
        window.open(router.resolve(_location).href, _target);
        return;
    }
    router.push(_location).catch(() => {});
};
const handleClickLabel = (label: string) => {
    dashboardPageControlStore.setSearchQueryTags([
        ...dashboardPageControlState.searchQueryTags,
        {
            key: { name: 'labels', label: 'Label' },
            value: { name: label, label },
            operator: '=',
        } as QueryTag,
    ]);
};
const handleSelectControlButton = (id: string, item: MenuItem) => {
    if (item.name === 'edit') dashboardPageControlStore.openEditNameModal(id);
    if (item.name === 'clone') dashboardPageControlStore.openCloneModal(id);
    if (item.name === 'move') dashboardPageControlStore.openMoveModal(id);
    if (item.name === 'share') dashboardPageControlStore.openShareModal(id);
    if (item.name === 'shareWithCode') dashboardPageControlStore.openShareWithCodeModal(id);
    if (item.name === 'delete') dashboardPageControlStore.openDeleteModal(id);
};
</script>

<template>
    <p-tree-item :node="props.treeData"
                 class="dashboard-folder-tree-item"
    >
        <template #content="{ node }">
            <div class="dashboard-folder-tree-item-content"
                 @click="handleClickTreeItem"
            >
                <div class="contents-wrapper">
                    <div :class="{'left-part': true, 'is-dashboard-item': !Array.isArray(node.children) && node.depth === 0 }">
                        <p-i class="dashboard-icon"
                             :name="Array.isArray(node.children) ? 'ic_folder' : 'ic_service_dashboard'"
                             :color="gray[600]"
                             width="1rem"
                             height="1rem"
                        />
                        <p-i v-if="props.readonlyMode && node.id.startsWith('private')"
                             name="ic_lock-filled"
                             width="0.75rem"
                             height="0.75rem"
                             :color="gray[500]"
                        />
                        <span class="text">{{ node.data.name }}</span>
                        <div v-if="node.data.isNew">
                            <new-mark class="new-mark" />
                        </div>
                        <p-i v-if="!props.disableLink && node.data.type === 'DASHBOARD' && props.readonlyMode"
                             name="ic_arrow-right-up"
                             width="0.75rem"
                             height="0.75rem"
                        />
                        <div v-if="!props.readonlyMode"
                             class="hidden-wrapper"
                        >
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
                            <favorite-button v-if="node.data.type === 'DASHBOARD' && !props.readonlyMode"
                                             :item-id="node.data.id"
                                             :favorite-type="FAVORITE_TYPE.DASHBOARD"
                                             scale="0.8"
                            />
                            <span v-if="node.data.shared"
                                  class="shared-text"
                                  :style="{'color': getSharedColor(node)}"
                            >- {{ getSharedText(node) }}</span>
                        </div>
                    </div>
                    <div class="right-part">
                        <template v-if="props.treeData.data.type === 'DASHBOARD'">
                            <div class="flex gap-1">
                                <p-label v-for="label in node.data?.labels?.slice(0, LABELS_LIMIT)"
                                         :key="`${node.data.id}-label-${label}`"
                                         :text="label"
                                         :clickable="!props.readonlyMode"
                                         @item-click="handleClickLabel(label)"
                                />

                                <p-popover v-if="state.showMoreLabels"
                                           position="bottom-end"
                                >
                                    <p-label :text="`+${node.data.labels.length - LABELS_LIMIT}`"
                                             clickable
                                    />
                                    <template #content>
                                        <div class="popper-label-wrapper">
                                            <p-label v-for="label in node.data.labels.slice(LABELS_LIMIT)"
                                                     :key="`${node.data.id}-label-${label}`"
                                                     :text="label"
                                                     :clickable="!props.readonlyMode"
                                                     @item-click="handleClickLabel(label)"
                                            />
                                        </div>
                                    </template>
                                </p-popover>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </template>
    </p-tree-item>
</template>

<style lang="postcss" scoped>
.dashboard-folder-tree-item {
    .dashboard-folder-tree-item-content {
        position: relative;
        padding: 0.5rem 0;
        .contents-wrapper {
            position: relative;
            height: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .left-part {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                &.is-dashboard-item {
                    padding-left: 1rem;
                }
                .dashboard-icon {
                    min-width: 0.875rem;
                }
                .text {
                    @apply text-gray-900;
                    font-size: 0.875rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .new-mark {
                    margin-left: 0;
                }
            }
            .right-part {
                display: flex;
                align-items: center;
                .popper-label-wrapper {
                    display: grid;
                    gap: 0.25rem;
                    min-width: 8rem;
                }
            }
        }
    }
    .hidden-wrapper {
        display: flex;
        gap: 0.25rem;
        align-items: center;
        visibility: hidden;
        .shared-text {
            @apply text-label-sm;
        }
    }
    &:hover {
        .hidden-wrapper {
            visibility: visible;
        }
    }

    @screen tablet {
        .dashboard-folder-tree-item-content {
            .contents-wrapper {
                flex-flow: wrap;
                gap: 0.5rem;
                height: auto;
                .left-part {
                    width: 95%;
                }
            }
        }
        .hidden-wrapper {
            .shared-text {
                display: none;
            }
        }
    }
}
</style>
