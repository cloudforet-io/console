import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';

const LandingPage = () => import('@/services/landing/pages/LandingPage.vue');


const adminLandingPageRoutes: RouteConfig = {
    path: 'landing',
    name: makeAdminRouteName(LANDING_ROUTE._NAME),
    component: LandingPage,
};

export default adminLandingPageRoutes;
