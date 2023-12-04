import type { Location } from 'vue-router/types/router';

import { MENU_ID } from '@/lib/menu/config';

import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';

// TODO: need to refactor with admin mode
const GENERAL_DEFAULT_ROUTE = Object.freeze({
    name: HOME_DASHBOARD_ROUTE._NAME,
});

const NO_ROLE_USER_DEFAULT_ROUTE = Object.freeze({
    name: MENU_ID.ACCOUNT,
});

const SYTEM_DEFAULT_ROUTE = Object.freeze({
    name: MENU_ID.USER,
});

export const getDefaultRouteAfterSignIn = (hasSystemRole: boolean, hasAnyPermissions: boolean): Location => {
    if (hasSystemRole) return SYTEM_DEFAULT_ROUTE;
    if (hasAnyPermissions) return GENERAL_DEFAULT_ROUTE;
    return NO_ROLE_USER_DEFAULT_ROUTE;
};
