import type { Location } from 'vue-router/types/router';

import { ROOT_ROUTE } from '@/router/constant';


import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';

const GENERAL_USER_DEFAULT_ROUTE = Object.freeze({
    name: ROOT_ROUTE.WORKSPACE._NAME,
});
const NO_ROLE_USER_DEFAULT_ROUTE = Object.freeze({
    name: MY_PAGE_ROUTE._NAME,
});

export const getDefaultRouteAfterSignIn = (hasBoundWorkpsace: boolean): Location => {
    if (hasBoundWorkpsace) {
        return GENERAL_USER_DEFAULT_ROUTE;
    }
    return NO_ROLE_USER_DEFAULT_ROUTE;
};
