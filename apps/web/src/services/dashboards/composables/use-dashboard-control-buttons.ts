import { computed, reactive } from 'vue';

import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { DashboardModel } from '@/schema/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/schema/dashboard/_types/folder-type';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';



export const useDashboardControlButtons = () => {
    const appContextStore = useAppContextStore();
    const dashboardPageControlStore = useDashboardPageControlStore();
    const dashboardPageControlGetters = dashboardPageControlStore.getters;
    const storeState = reactive({
        isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    });
    const state = reactive({
        cloneMenuItems: computed<MenuItem[]>(() => ([
            {
                type: 'item', name: 'clone', label: i18n.t('DASHBOARDS.DETAIL.CLONE'), icon: 'ic_clone',
            },
        ])),
    });

    const isDashboardManageable = (dashboard: DashboardModel) => {
        if (dashboard.dashboard_id.startsWith('private')) return true;
        if (storeState.isAdminMode) return true;
        if (storeState.isWorkspaceOwner) {
            return dashboard?.workspace_id !== '*';
        }
        return false;
    };
    const isFolderManageable = (folder: FolderModel) => {
        if (folder.folder_id.startsWith('private')) return true;
        if (storeState.isAdminMode) return true;
        if (storeState.isWorkspaceOwner) {
            return folder?.workspace_id !== '*';
        }
        return false;
    };
    const getDashboardControlButtonItems = (dashboardId: string): MenuItem[] => {
        const _isPrivate = dashboardId.startsWith('private');
        const _allDashboardItems = [...dashboardPageControlGetters.allDashboardItems, ...dashboardPageControlGetters.deprecatedDashboardItems];
        const _dashboard = _allDashboardItems.find((item: DashboardModel) => item.dashboard_id === dashboardId);
        if (!_dashboard) return [];

        const _isDeprecated = _dashboard.version === '1.0';
        const _isDashboardManageable = isDashboardManageable(_dashboard);
        if (!_isDashboardManageable) {
            if (_isDeprecated) return [];
            return state.cloneMenuItems;
        }
        if (_isDeprecated) {
            return [{
                type: 'item', name: 'delete', label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.DELETE'), icon: 'ic_delete',
            }];
        }

        const _isShared = !!_dashboard.shared;
        const _shareMenuItems: MenuItem[] = [
            {
                type: 'item',
                name: 'share',
                label: _isShared ? i18n.t('DASHBOARDS.ALL_DASHBOARDS.UNSHARE_DASHBOARD') : i18n.t('DASHBOARDS.ALL_DASHBOARDS.SHARE_DASHBOARD'),
                icon: 'ic_share',
            },
        ];
        return [
            {
                type: 'item',
                name: 'edit',
                label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.EDIT_NAME'),
                icon: 'ic_edit-text',
            },
            {
                type: 'item', name: 'clone', label: i18n.t('DASHBOARDS.DETAIL.CLONE'), icon: 'ic_clone',
            },
            {
                type: 'item', name: 'move', label: i18n.t('DASHBOARDS.DETAIL.MOVE'), icon: 'ic_move',
            },
            { type: 'divider', name: 'divider' },
            {
                type: 'item', name: 'shareWithCode', label: i18n.t('DASHBOARDS.DETAIL.SHARE_WITH_CODE'), icon: 'ic_share-code',
            },
            ...(_isPrivate ? [] : _shareMenuItems),
            { type: 'divider', name: 'divider' },
            {
                type: 'item', name: 'delete', label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.DELETE'), icon: 'ic_delete',
            },
        ];
    };
    const getFolderControlButtonItems = (folderId: string): MenuItem[] => {
        const _isPrivate = folderId.startsWith('private');
        const _folder: FolderModel = dashboardPageControlGetters.allFolderItems.find((item) => item.folder_id === folderId);
        if (!_folder) return [];

        const _isFolderManageable = isFolderManageable(_folder);
        if (!_isFolderManageable) return state.cloneMenuItems;

        const _isShared = !!_folder?.shared;
        const _shareMenuItems: MenuItem[] = [
            {
                type: 'item',
                name: 'share',
                label: _isShared ? i18n.t('DASHBOARDS.ALL_DASHBOARDS.UNSHARE') : i18n.t('DASHBOARDS.ALL_DASHBOARDS.SHARE'),
                icon: 'ic_share',
            },
        ];
        return [
            {
                type: 'item', name: 'edit', label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.EDIT_NAME'), icon: 'ic_edit-text',
            },
            {
                type: 'item', name: 'clone', label: i18n.t('DASHBOARDS.DETAIL.CLONE'), icon: 'ic_clone',
            },
            { type: 'divider', name: 'divider' },
            ...(_isPrivate ? [] : _shareMenuItems),
            { type: 'divider', name: 'divider' },
            {
                type: 'item', name: 'delete', label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.DELETE'), icon: 'ic_delete',
            },
        ];
    };
    const getControlButtonItems = (id: string): MenuItem[] => {
        if (id.includes('folder')) return getFolderControlButtonItems(id);
        return getDashboardControlButtonItems(id);
    };

    /* Event */
    // Single (Folder or Dashboard)
    const clickEditNameMenu = (id: string) => {
        if (id.includes('folder')) {
            dashboardPageControlStore.setFolderFormModalType('UPDATE');
            dashboardPageControlStore.setSelectedFolderId(id);
            dashboardPageControlStore.setFolderFormModalVisible(true);
        } else {
            dashboardPageControlStore.setSelectedDashboardId(id);
            dashboardPageControlStore.setDashboardNameEditModalVisible(true);
        }
    };
    const clickShareMenu = (id: string) => {
        if (id.includes('folder')) {
            dashboardPageControlStore.setSelectedFolderId(id);
            dashboardPageControlStore.setShareModalVisible(true);
        } else {
            dashboardPageControlStore.setSelectedDashboardId(id);
            dashboardPageControlStore.setShareModalVisible(true);
        }
    };
    const clickShareWithCodeMenu = (dashboardId: string) => {
        dashboardPageControlStore.setSelectedDashboardId(dashboardId);
        dashboardPageControlStore.setDashboardShareWithCodeModalVisible(true);
    };
    const clickCloneMenu = (id: string) => {
        if (id.includes('folder')) {
            dashboardPageControlStore.setSelectedFolderId(id);
            dashboardPageControlStore.setFolderCloneModalVisible(true);
        } else {
            dashboardPageControlStore.setSelectedDashboardId(id);
            dashboardPageControlStore.setDashboardCloneModalVisible(true);
        }
    };
    const clickDeleteMenu = (id: string) => {
        if (id.includes('folder')) {
            dashboardPageControlStore.setSelectedFolderId(id);
            dashboardPageControlStore.setFolderDeleteModalVisible(true);
        } else {
            dashboardPageControlStore.setSelectedDashboardId(id);
            dashboardPageControlStore.setDashboardDeleteModalVisible(true);
        }
    };
    const clickMoveMenu = (dashboardId: string) => {
        dashboardPageControlStore.setSelectedDashboardId(dashboardId);
        dashboardPageControlStore.setDashboardFolderSingleMoveModalVisible(true);
    };

    // Bundle (Folder + Dashboard)
    const clickBundleCloneMenu = (type: 'PRIVATE'|'PUBLIC') => {
        dashboardPageControlStore.setFolderModalType(type);
        dashboardPageControlStore.setFolderCloneModalVisible(true);
    };
    const clickBundleMoveMenu = (type: 'PRIVATE'|'PUBLIC') => {
        dashboardPageControlStore.setFolderModalType(type);
        dashboardPageControlStore.setDashboardFolderBundleMoveModalVisible(true);
    };
    const clickBundleDeleteMenu = (type: 'PRIVATE'|'PUBLIC') => {
        dashboardPageControlStore.setFolderModalType(type);
        dashboardPageControlStore.setFolderDeleteModalVisible(true);
    };

    return {
        // single (folder or dashboard)
        clickEditNameMenu,
        clickShareMenu,
        clickShareWithCodeMenu,
        clickCloneMenu,
        clickDeleteMenu,
        clickMoveMenu,
        // bundle
        clickBundleCloneMenu,
        clickBundleMoveMenu,
        clickBundleDeleteMenu,
        // control button
        getControlButtonItems,
    };
};
