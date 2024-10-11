import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { DashboardModel } from '@/schema/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/schema/dashboard/_types/folder-type';
import { i18n } from '@/translations';



interface UseDashboardControlMenuItems {
    isAdminMode: ComputedRef<boolean>;
    isWorkspaceOwner: ComputedRef<boolean>;
    dashboardList?: ComputedRef<DashboardModel[]>;
    folderList?: ComputedRef<FolderModel[]>;
}
interface UseDashboardControlMenuItemsReturn {
    getControlMenuItems: (id: string) => ComputedRef<MenuItem[]>|MenuItem[];
}

export const useDashboardControlMenuItems = ({
    isAdminMode, isWorkspaceOwner, dashboardList, folderList,
}: UseDashboardControlMenuItems): UseDashboardControlMenuItemsReturn => {
    const _getDashboardManageable = (dashboard: DashboardModel): boolean => {
        if (dashboard.dashboard_id.startsWith('private')) return true;
        if (isAdminMode.value) return true;
        if (isWorkspaceOwner.value) {
            return dashboard?.workspace_id !== '*';
        }
        return false;
    };
    const _getFolderManageable = (folder: FolderModel): boolean => {
        if (folder.folder_id.startsWith('private')) return true;
        if (isAdminMode.value) return true;
        if (isWorkspaceOwner.value) {
            return folder?.workspace_id !== '*';
        }
        return false;
    };
    const _getDashboardControlMenuItems = (dashboardId: string): ComputedRef<MenuItem[]>|MenuItem[] => {
        const _isPrivate = dashboardId.startsWith('private');
        const _dashboard = dashboardList?.value.find((item) => item.dashboard_id === dashboardId);
        if (!_dashboard) return [];

        const _isDeprecated = _dashboard.version === '1.0';
        const _isDashboardManageable = _getDashboardManageable(_dashboard);
        if (!_isDashboardManageable) {
            if (_isDeprecated) return [];
            return computed(() => ([
                {
                    type: 'item', name: 'clone', label: i18n.t('DASHBOARDS.DETAIL.CLONE'), icon: 'ic_clone',
                },
            ]));
        }
        if (_isDeprecated) {
            return computed(() => ([{
                type: 'item', name: 'delete', label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.DELETE'), icon: 'ic_delete',
            }]));
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
        return computed(() => ([
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
        ]));
    };
    const _getFolderControlMenuItems = (folderId: string): ComputedRef<MenuItem[]>|MenuItem[] => {
        const _isPrivate = folderId.startsWith('private');
        const _folder = folderList?.value.find((item) => item.folder_id === folderId);
        if (!_folder) return [];

        const _isFolderManageable = _getFolderManageable(_folder);
        if (!_isFolderManageable) {
            return computed(() => ([
                {
                    type: 'item', name: 'clone', label: i18n.t('DASHBOARDS.DETAIL.CLONE'), icon: 'ic_clone',
                },
            ]));
        }

        const _isShared = !!_folder?.shared;
        const _shareMenuItems: MenuItem[] = [
            {
                type: 'item',
                name: 'share',
                label: _isShared ? i18n.t('DASHBOARDS.ALL_DASHBOARDS.UNSHARE') : i18n.t('DASHBOARDS.ALL_DASHBOARDS.SHARE'),
                icon: 'ic_share',
            },
        ];
        return computed(() => ([
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
        ]));
    };
    const getControlMenuItems = (id: string): ComputedRef<MenuItem[]>|MenuItem[] => {
        if (id.includes('folder')) return _getFolderControlMenuItems(id);
        return _getDashboardControlMenuItems(id);
    };

    return {
        getControlMenuItems,
    };
};
