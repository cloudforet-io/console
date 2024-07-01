import type { Location } from 'vue-router/types/router';

import { ROOT_ROUTE } from '@/router/constant';

import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';

const GENERAL_USER_DEFAULT_ROUTE = Object.freeze({
    name: ROOT_ROUTE.WORKSPACE._NAME,
});
const NO_ROLE_USER_DEFAULT_ROUTE = Object.freeze({
    name: LANDING_ROUTE._NAME,
});

export const getDefaultRouteAfterSignIn = (hasBoundWorkpsace: boolean): Location => {
    if (hasBoundWorkpsace) {
        return GENERAL_USER_DEFAULT_ROUTE;
    }
    return NO_ROLE_USER_DEFAULT_ROUTE;
};
