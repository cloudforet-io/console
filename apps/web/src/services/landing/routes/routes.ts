import type { RouteConfig } from 'vue-router';

import { ROUTE_SCOPE } from '@/router/constant';

import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';

const LandingPage = () => import('@/services/landing/pages/LandingPage.vue');


const landingPageRoutes: RouteConfig = {
    path: 'landing',
    name: LANDING_ROUTE._NAME,
    meta: {
        scope: ROUTE_SCOPE.USER,
    },
    component: LandingPage,
};

export default landingPageRoutes;
