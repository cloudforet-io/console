import type { RouteConfig } from 'vue-router';

import { ROUTE_SCOPE } from '@/router/constant';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';

const LandingContainer = () => import('@/services/landing/components/workspace-landing/LandingContainer.vue');
const WorkspaceLandingPage = () => import('@/services/landing/pages/WorkspaceLandingPage.vue');
const DomainLandingPage = () => import('@/services/landing/pages/DomainLandingPage.vue');


const landingPageRoutes: RouteConfig = {
    path: 'landing',
    name: LANDING_ROUTE._NAME,
    meta: {
        scope: ROUTE_SCOPE.USER,
    },
    redirect: () => ({ name: LANDING_ROUTE.WORKSPACE._NAME }),
    component: LandingContainer,
    children: [
        {
            path: 'workspace',
            name: LANDING_ROUTE.WORKSPACE._NAME,
            meta: {
                scope: ROUTE_SCOPE.USER,
            },
            beforeEnter: (to, from, next) => {
                const userWorkspaceStore = useUserWorkspaceStore();
                if (userWorkspaceStore.getters.workspaceList.length === 0) {
                    next({ name: LANDING_ROUTE.DOMAIN._NAME });
                } else {
                    next();
                }
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
