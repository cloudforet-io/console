import type { RouteConfig } from 'vue-router';

import { ROUTE_SCOPE } from '@/router/constant';

import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';

const LandingContainer = () => import('@/services/landing/components/LandingContainer.vue');
const WorkspaceLandingPage = () => import('@/services/landing/pages/WorkspaceLandingPage.vue');
const DomainLandingPage = () => import('@/services/landing/pages/DomainLandingPage.vue');


const landingPageRoutes: RouteConfig = {
    path: 'landing',
    name: LANDING_ROUTE._NAME,
    meta: {
        scope: ROUTE_SCOPE.USER,
    },
    component: LandingContainer,
    children: [
        {
            path: 'workspace',
            name: LANDING_ROUTE.WORKSPACE._NAME,
            meta: {
                scope: ROUTE_SCOPE.USER,
            },
            component: WorkspaceLandingPage,
        },
        {
            path: 'domain',
            name: LANDING_ROUTE.DOMAIN._NAME,
            meta: {
                scope: ROUTE_SCOPE.USER,
            },
            component: DomainLandingPage,
        },
    ],
};

export default landingPageRoutes;
