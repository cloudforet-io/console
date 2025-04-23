import { computed } from 'vue';

import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/api-clients/dashboard/_types/folder-type';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';
import { i18n } from '@/translations';

import { DASHBOARD_CONTROL_MENU_ACTION_TYPES } from '@/services/_shared/dashboard/core/constants/dashboard-control-menu-constant';


export const useDashboardControlMenuHelper = () => {
    const CLONE_MENU_ITEM = computed<MenuItem>(() => ({
        type: 'item',
        name: DASHBOARD_CONTROL_MENU_ACTION_TYPES.CLONE,
        label: i18n.t('DASHBOARDS.DETAIL.CLONE'),
        icon: 'ic_clone',
    }));

    const DELETE_MENU_ITEM = computed<MenuItem>(() => ({
        type: 'item',
        name: DASHBOARD_CONTROL_MENU_ACTION_TYPES.DELETE,
        label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.DELETE'),
        icon: 'ic_delete',
    }));
    const EDIT_MENU_ITEM = computed<MenuItem>(() => ({
        type: 'item',
        name: DASHBOARD_CONTROL_MENU_ACTION_TYPES.EDIT,
        label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.EDIT_NAME'),
        icon: 'ic_edit-text',
    }));
    const MOVE_MENU_ITEM = computed<MenuItem>(() => ({
        type: 'item',
        name: DASHBOARD_CONTROL_MENU_ACTION_TYPES.MOVE,
        label: i18n.t('DASHBOARDS.DETAIL.MOVE'),
        icon: 'ic_move',
    }));
    const SHARE_WITH_CODE_MENU_ITEM = computed<MenuItem>(() => ({
        type: 'item',
        name: DASHBOARD_CONTROL_MENU_ACTION_TYPES.SHARE_WITH_CODE,
        label: i18n.t('DASHBOARDS.DETAIL.SHARE_WITH_CODE'),
        icon: 'ic_share-code',
    }));

    const getShareMenuItems = (isShared: boolean): MenuItem[] => [
        {
            type: 'item',
            name: DASHBOARD_CONTROL_MENU_ACTION_TYPES.SHARE,
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
            SHARE_WITH_CODE_MENU_ITEM.value,
            ...(!isPrivate ? getShareMenuItems(isShared) : []),
            { type: 'divider', name: 'divider' },
        ];

        return [
            EDIT_MENU_ITEM.value,
            CLONE_MENU_ITEM.value,
            MOVE_MENU_ITEM.value,
            { type: 'divider', name: 'divider' },
            ...(!isProject ? shareContextMenuItems : []),
            DELETE_MENU_ITEM.value,
        ];
    };

    const getControlFolderMenuItems = (
        folderId: string,
        manageable: boolean,
        folder: FolderModel,
        isProject = false,
    ): MenuItem[] => {
        const isPrivate = folderId.startsWith('private');
        const isShared = !!(folder as PublicFolderModel)?.shared;

        if (!manageable) return [CLONE_MENU_ITEM.value];

        const shareContextMenuItems: MenuItem[] = [
            ...(!isPrivate ? getShareMenuItems(isShared) : []),
            { type: 'divider', name: 'divider' },
        ];

        return [
            EDIT_MENU_ITEM.value,
            CLONE_MENU_ITEM.value,
            { type: 'divider', name: 'divider' },
            ...(!isProject ? shareContextMenuItems : []),
            DELETE_MENU_ITEM.value,
        ];
    };

    return {
        getControlDashboardMenuItems,
        getControlFolderMenuItems,
    };
};

