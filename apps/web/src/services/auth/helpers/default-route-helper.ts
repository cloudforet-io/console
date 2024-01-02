import type { Location } from 'vue-router/types/router';

import { ROOT_ROUTE } from '@/router/constant';

// import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';
import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';

// TODO: need to refactor with admin mode
const GENERAL_DEFAULT_ROUTE = Object.freeze({
    name: ROOT_ROUTE.WORKSPACE._NAME,
});

const NO_ROLE_USER_DEFAULT_ROUTE = Object.freeze({
    name: MY_PAGE_ROUTE._NAME,
});

// const SYTEM_DEFAULT_ROUTE = Object.freeze({
//     name: ADMINISTRATION_ROUTE.IAM._NAME,
// });

export const getDefaultRouteAfterSignIn = (hasSystemRole: boolean, hasAnyPermissions: boolean): Location => {
    // TODO: need to decide SYSTEM ROLE
    if (hasAnyPermissions) return GENERAL_DEFAULT_ROUTE;
    return NO_ROLE_USER_DEFAULT_ROUTE;
};
