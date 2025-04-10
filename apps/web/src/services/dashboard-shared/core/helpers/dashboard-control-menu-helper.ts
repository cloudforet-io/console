import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/api-clients/dashboard/_types/folder-type';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';
import { i18n } from '@/translations';

const _getShareMenuItems = (isShared: boolean): MenuItem[] => [
    {
        type: 'item',
        name: 'share',
        label: isShared ? i18n.t('DASHBOARDS.ALL_DASHBOARDS.UNSHARE') : i18n.t('DASHBOARDS.ALL_DASHBOARDS.SHARE'),
        icon: 'ic_share',
    },
];

export const getControlDashboardMenuItems = (
    dashboardId: string,
    manageable: boolean,
    dashboard: DashboardModel,
    isProject = false,
): MenuItem[] => {
    const _isPrivate = dashboardId.startsWith('private');
    const _isDeprecated = dashboard.version === '1.0';
    const _isShared = !!(dashboard as PublicDashboardModel)?.shared;
    if (!manageable) {
        if (_isDeprecated) return [];
        return [
            {
                type: 'item', name: 'clone', label: i18n.t('DASHBOARDS.DETAIL.CLONE'), icon: 'ic_clone',
            },
        ];
    }
    if (_isDeprecated) {
        return [
            {
                type: 'item', name: 'delete', label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.DELETE'), icon: 'ic_delete',
            },
        ];
    }

    const _shareContextMenuItems: MenuItem[] = [
        {
            type: 'item', name: 'shareWithCode', label: i18n.t('DASHBOARDS.DETAIL.SHARE_WITH_CODE'), icon: 'ic_share-code',
        },
        ...(_isPrivate ? [] : _getShareMenuItems(_isShared)),
        { type: 'divider', name: 'divider' },
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
        ...(isProject ? [] : _shareContextMenuItems),
        {
            type: 'item', name: 'delete', label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.DELETE'), icon: 'ic_delete',
        },
    ];
};

export const getControlFolderMenuItems = (folderId: string, manageable: boolean, folder: FolderModel): MenuItem[] => {
    const _isPrivate = folderId.startsWith('private');
    const _isShared = !!(folder as PublicFolderModel)?.shared;
    if (!manageable) {
        return [
            {
                type: 'item', name: 'clone', label: i18n.t('DASHBOARDS.DETAIL.CLONE'), icon: 'ic_clone',
            },
        ];
    }

    return [
        {
            type: 'item', name: 'edit', label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.EDIT_NAME'), icon: 'ic_edit-text',
        },
        {
            type: 'item', name: 'clone', label: i18n.t('DASHBOARDS.DETAIL.CLONE'), icon: 'ic_clone',
        },
        { type: 'divider', name: 'divider' },
        ...(_isPrivate ? [] : _getShareMenuItems(_isShared)),
        { type: 'divider', name: 'divider' },
        {
            type: 'item', name: 'delete', label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.DELETE'), icon: 'ic_delete',
        },
    ];
};
