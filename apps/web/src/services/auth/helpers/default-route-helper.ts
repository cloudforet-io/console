import type { Location } from 'vue-router/types/router';

import { MENU_ID } from '@/lib/menu/config';

const GENERAL_USER_DEFAULT_ROUTE = Object.freeze({
    name: MENU_ID.HOME_DASHBOARD,
});

const NO_ROLE_USER_DEFAULT_ROUTE = Object.freeze({
    name: MENU_ID.MY_PAGE_ACCOUNT,
});

const DOMAIN_OWNER_DEFAULT_ROUTE = Object.freeze({
    name: MENU_ID.ADMINISTRATION_USER,
});

export const getDefaultRouteAfterSignIn = (isDomainOwner: boolean, hasSystemRole: boolean, hasAnyPermissions: boolean): Location => {
    if (isDomainOwner || hasSystemRole) return DOMAIN_OWNER_DEFAULT_ROUTE;
    if (hasAnyPermissions) return GENERAL_USER_DEFAULT_ROUTE;
    return NO_ROLE_USER_DEFAULT_ROUTE;
};
