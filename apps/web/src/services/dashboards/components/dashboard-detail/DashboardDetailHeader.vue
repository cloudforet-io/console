<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PHeading, PSkeleton, PSelectDropdown, PI, PBadge, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { DashboardScope } from '@/schema/dashboard/_types/dashboard-type';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import { gray } from '@/styles/colors';

import DashboardControlButtons from '@/services/dashboards/components/dashboard-detail/DashboardControlButtons.vue';
import DashboardLabelsButton from '@/services/dashboards/components/dashboard-detail/DashboardLabelsButton.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';


interface Props {
    dashboardId: string;
    templateName?: string;
}
const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardPageControlGetters = dashboardPageControlStore.getters;
const appContextStore = useAppContextStore();
const userStore = useUserStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceOwner: computed(() => userStore.getters.getCurrentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
});
const state = reactive({
    loading: false,
    isSharedDashboard: computed<boolean>(() => !!dashboardDetailState.dashboardInfo?.shared),
    sharedScope: computed<DashboardScope|undefined>(() => dashboardDetailState.dashboardInfo?.scope),
    selectedSharedScope: 'WORKSPACE' as DashboardScope,
    showBadge: computed<boolean>(() => {
        if (dashboardDetailState.dashboardInfo?.user_id) return true;
        return state.isSharedDashboard;
    }),
    badgeStyleType: computed<string>(() => {
        if (dashboardDetailState.dashboardScope === 'PRIVATE') return 'gray150';
        if (state.sharedScope === 'PROJECT') return 'primary3';
        return 'indigo100';
    }),
    badgeText: computed(() => {
        if (dashboardDetailState.dashboardId?.startsWith('private')) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE');
        if (state.isSharedDashboard) {
            if (storeState.isAdminMode) {
                if (dashboardDetailState.dashboardInfo?.scope === 'PROJECT') {
                    return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_ALL_PROJECTS');
                }
                return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_WORKSPACES');
            }
            if (state.sharedScope === 'PROJECT') return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_ALL_PROJECTS');
            return i18n.t('DASHBOARDS.DETAIL.SHARED_BY_ADMIN');
        }
        return '';
    }),
    menuItems: computed<MenuItem[]>(() => {
        if (dashboardDetailGetters.isDeprecatedDashboard) {
            return [
                {
                    type: 'item',
                    name: 'edit',
                    label: i18n.t('DASHBOARDS.DETAIL.EDIT_DASHBOARD_NAME'),
                    icon: 'ic_edit-text',
                },
                {
                    type: 'item',
                    name: 'delete',
                    label: i18n.t('DASHBOARDS.DETAIL.DELETE'),
                    icon: 'ic_delete',
                },
            ];
        }
        if (dashboardDetailGetters.disableManageButtons) {
            return [{
                type: 'item',
                name: 'duplicate',
                label: i18n.t('DASHBOARDS.DETAIL.CLONE'),
                icon: 'ic_clone',
            }];
        }
        let _shareMenuItems: MenuItem[] = [];
        if (storeState.isAdminMode) {
            _shareMenuItems = [{
                type: 'item',
                name: state.isSharedDashboard ? 'unshare' : 'share',
                label: state.isSharedDashboard ? i18n.t('DASHBOARDS.DETAIL.UNSHARE_DASHBOARD') : i18n.t('DASHBOARDS.DETAIL.SHARE_DASHBOARD'),
                icon: 'ic_share',
            }];
        } else if (dashboardDetailState.dashboardScope !== 'PRIVATE') {
            _shareMenuItems = [{
                type: 'item',
                name: 'share',
                label: state.isSharedDashboard ? i18n.t('DASHBOARDS.DETAIL.UNSHARE_FROM_ALL_PROJECTS') : i18n.t('DASHBOARDS.DETAIL.SHARE_TO_ALL_PROJECTS'),
                icon: 'ic_share',
            }];
        }
        return [
            {
                type: 'item',
                name: 'edit',
                label: i18n.t('DASHBOARDS.DETAIL.EDIT_DASHBOARD_NAME'),
                icon: 'ic_edit-text',
            },
            {
                type: 'item',
                name: 'duplicate',
                label: i18n.t('DASHBOARDS.DETAIL.CLONE'),
                icon: 'ic_clone',
            },
            {
                type: 'item',
                name: 'move',
                label: i18n.t('DASHBOARDS.DETAIL.MOVE'),
                icon: 'ic_move',
            },
            { type: 'divider', name: 'divider' },
            {
                type: 'item',
                name: 'shareWithCode',
                label: i18n.t('DASHBOARDS.DETAIL.SHARE_WITH_CODE'),
                icon: 'ic_share-code',
            },
            ..._shareMenuItems,
            { type: 'divider', name: 'divider' },
            {
                type: 'item',
                name: 'delete',
                label: i18n.t('DASHBOARDS.DETAIL.DELETE'),
                icon: 'ic_delete',
            },
        ];
    }),
    folderName: computed<string|undefined>(() => {
        const _folderId = dashboardPageControlGetters.allDashboardItems.find((d) => d.dashboard_id === props.dashboardId)?.folder_id;
        const folder = dashboardPageControlGetters.allFolderItems.find((d) => d.folder_id === _folderId);
        return folder?.name;
    }),
});

/* Event */
const handleSelectItem = (selected: MenuItem) => {
    if (selected.name === 'edit') dashboardDetailStore.setDashboardNameEditModalVisible(true);
    if (selected.name === 'duplicate') dashboardDetailStore.setDashboardCloneModalVisible(true);
    if (selected.name === 'shareWithCode') dashboardDetailStore.setShareWithCodeModalVisible(true);
    if (selected.name === 'delete') dashboardDetailStore.setDashboardDeleteModalVisible(true);
    if (selected.name === 'share') {
        dashboardDetailStore.setDashboardShareModalType('SHARE');
        dashboardDetailStore.setDashboardShareModalVisible(true);
    }
    if (selected.name === 'unshare') {
        dashboardDetailStore.setDashboardShareModalType('UNSHARE');
        dashboardDetailStore.setDashboardShareModalVisible(true);
    }
    if (selected.name === 'move') dashboardDetailStore.setFolderMoveModalVisible(true);
};
</script>

<template>
    <div class="dashboard-detail-header">
        <div v-if="state.folderName"
             class="folder-name-wrapper"
        >
            <p-i name="ic_folder"
                 width="1rem"
                 height="1rem"
                 :color="gray[600]"
            />
            <span class="folder-name">{{ state.folderName }}</span>
        </div>
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="dashboardDetailState.name">
                    <p-skeleton v-if="!dashboardDetailState.name"
                                width="20rem"
                                height="1.5rem"
                    />
                    <template #title-right-extra>
                        <p-badge v-if="state.showBadge"
                                 badge-type="subtle"
                                 :style-type="state.badgeStyleType"
                        >
                            <p-i v-if="dashboardDetailState.dashboardScope === 'PRIVATE'"
                                 name="ic_lock-filled"
                                 width="0.75rem"
                                 height="0.75rem"
                                 color="gray900"
                                 class="mr-1"
                            />
                            {{ state.badgeText }}
                        </p-badge>
                        <p-select-dropdown class="dashboard-setting-dropdown"
                                           style-type="tertiary-icon-button"
                                           button-icon="ic_ellipsis-horizontal"
                                           size="sm"
                                           :menu="state.menuItems"
                                           :selected="[]"
                                           use-fixed-menu-style
                                           reset-selection-on-menu-close
                                           @select="handleSelectItem"
                        />
                        <dashboard-labels-button class="label-button"
                                                 :dashboard-id="props.dashboardId"
                        />
                    </template>
                </p-heading>
            </template>
            <template v-if="!dashboardDetailGetters.isDeprecatedDashboard"
                      #extra
            >
                <dashboard-control-buttons v-if="!dashboardDetailGetters.disableManageButtons"
                                           :dashboard-id="props.dashboardId"
                                           :name="dashboardDetailState.name"
                />
            </template>
        </p-heading-layout>
        <p v-if="props.templateName"
           class="template-name"
        >
            {{ props.templateName }}
        </p>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-detail-header {
    margin-bottom: 0.75rem;
    .folder-name-wrapper {
        display: flex;
        align-items: center;
        .folder-name {
            @apply text-paragraph-sm text-gray-600;
            margin-left: 0.125rem;
        }
    }
    .template-name {
        @apply text-paragraph-sm text-gray-500;
        margin-left: 2.5rem;
    }
    .label-button {
        display: inline-flex;
        margin-left: 0.5rem;
    }
}
.select-card-wrapper {
    @apply grid grid-cols-12;
    gap: 0.5rem;
    .p-select-card {
        @apply col-span-6;
    }
}
</style>
