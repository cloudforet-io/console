import type { Route } from 'vue-router';

import { clone } from 'lodash';

import type { MenuId } from '@/lib/menu/config';

export const calculateIsAccessibleRoute = (route: Route, pagePermissions: MenuId[]): boolean => {
    const closetMenuRoute = clone(route?.matched)?.reverse().find((match) => !!match.meta.menuId);
    const menuId = closetMenuRoute?.meta.menuId;
    return pagePermissions.some((id) => id === menuId);
};

export const isUserAccessibleToMenu = (menuId: MenuId, pageAccessList: MenuId[]): boolean => pageAccessList.some((id) => id === menuId);
