import { computed } from 'vue';

import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/api-clients/dashboard/_types/folder-type';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';
import { i18n } from '@/translations';

export const useDashboardControlMenuHelper = () => {
    const CLONE_MENU_ITEM = computed<MenuItem>(() => ({
        type: 'item',
        name: 'clone',
        label: i18n.t('DASHBOARDS.DETAIL.CLONE'),
        icon: 'ic_clone',
    }));

    const DELETE_MENU_ITEM = computed<MenuItem>(() => ({
        type: 'item',
        name: 'delete',
        label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.DELETE'),
        icon: 'ic_delete',
    }));

    const getShareMenuItems = (isShared: boolean): MenuItem[] => [
        {
            type: 'item',
            name: 'share',
            label: isShared ? i18n.t('DASHBOARDS.ALL_DASHBOARDS.UNSHARE') : i18n.t('DASHBOARDS.ALL_DASHBOARDS.SHARE'),
            icon: 'ic_share',
        },
    ];

    const getControlDashboardMenuItems = (
        dashboardId: string,
        manageable: boolean,
        dashboard: DashboardModel,
        isProject = false,
    ): MenuItem[] => {
        const isPrivate = dashboardId.startsWith('private');
        const isDeprecated = dashboard.version === '1.0';
        const isShared = !!(dashboard as PublicDashboardModel)?.shared;

        if (!manageable) return isDeprecated ? [] : [CLONE_MENU_ITEM.value];
        if (isDeprecated) return [DELETE_MENU_ITEM.value];

        const shareContextMenuItems: MenuItem[] = [
            {
                type: 'item',
                name: 'shareWithCode',
                label: i18n.t('DASHBOARDS.DETAIL.SHARE_WITH_CODE'),
                icon: 'ic_share-code',
            },
            ...(!isPrivate ? getShareMenuItems(isShared) : []),
            { type: 'divider', name: 'divider' },
        ];

        return [
            {
                type: 'item',
                name: 'edit',
                label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.EDIT_NAME'),
                icon: 'ic_edit-text',
            },
            CLONE_MENU_ITEM.value,
            {
                type: 'item',
                name: 'move',
                label: i18n.t('DASHBOARDS.DETAIL.MOVE'),
                icon: 'ic_move',
            },
            { type: 'divider', name: 'divider' },
            ...(!isProject ? shareContextMenuItems : []),
            DELETE_MENU_ITEM.value,
        ];
    };

    const getControlFolderMenuItems = (folderId: string, manageable: boolean, folder: FolderModel): MenuItem[] => {
        const isPrivate = folderId.startsWith('private');
        const isShared = !!(folder as PublicFolderModel)?.shared;

        if (!manageable) return [CLONE_MENU_ITEM.value];

        return [
            {
                type: 'item',
                name: 'edit',
                label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.EDIT_NAME'),
                icon: 'ic_edit-text',
            },
            CLONE_MENU_ITEM.value,
            { type: 'divider', name: 'divider' },
            ...(!isPrivate ? getShareMenuItems(isShared) : []),
            { type: 'divider', name: 'divider' },
            DELETE_MENU_ITEM.value,
        ];
    };

    return {
        getControlDashboardMenuItems,
        getControlFolderMenuItems,
    };
};

