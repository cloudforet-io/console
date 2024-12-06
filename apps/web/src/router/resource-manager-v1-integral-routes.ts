import type { RouteConfig } from 'vue-router';

import { ROOT_ROUTE, ROUTE_SCOPE } from '@/router/constant';
import { errorRoutes } from '@/router/error-routes';
import { externalRoutes } from '@/router/external-routes';
import { makeAdminRouteName } from '@/router/helpers/route-helper';
import { resourceManagerV1AdminRoutes } from '@/router/resource-manager-v1-admin-routes';
import { resourceManagerV1WorkspaceRoutes } from '@/router/resource-manager-v1-workspace-routes';

import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';

import authRoutes from '@/services/auth/routes/routes';
import landingPageRoutes from '@/services/landing/routes/routes';
import myPageRoutes from '@/services/my-page/routes/routes';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

const userStore = useUserStore(pinia);

export const resourceManagerV1IntegralRoutes: RouteConfig[] = [
    {
        path: '/',
        component: { template: '<router-view />' },
        children: [
            {
                path: '',
                name: ROOT_ROUTE._NAME,
                redirect: () => ({
                    name: ROOT_ROUTE.WORKSPACE._NAME,
                }),
            },
            ...authRoutes,
            landingPageRoutes,
            ...externalRoutes,
            {
                path: 'admin',
                name: ROOT_ROUTE.ADMIN._NAME,
                meta: { scope: ROUTE_SCOPE.DOMAIN },
                redirect: () => {
                    if (!userStore.getters.isDomainAdmin) return { name: ROOT_ROUTE.WORKSPACE._NAME };
                    return ({ name: makeAdminRouteName(WORKSPACE_HOME_ROUTE._NAME) });
                },
                component: { template: '<router-view />' },
                children: [
                    ...resourceManagerV1AdminRoutes,
                ],
            },
            {
                path: 'workspace/:workspaceId?',
                name: ROOT_ROUTE.WORKSPACE._NAME,
                meta: { scope: ROUTE_SCOPE.WORKSPACE },
                redirect: (to) => ({
                    name: WORKSPACE_HOME_ROUTE._NAME,
                    params: {
                        ...to.params,
                    },
                }),
                component: { template: '<router-view />' },
                children: [
                    ...resourceManagerV1WorkspaceRoutes,
                ],
            },
            myPageRoutes,
            ...errorRoutes,
        ],
    },
];
