import type { RouteConfig } from 'vue-router';

import { alertManagerV1AdminRoutes } from '@/router/alert-manager-v1-admin-routes';
import { alertManagerV1WorkspaceRoutes } from '@/router/alert-manager-v1-workspace-routes';
import { ROOT_ROUTE, ROUTE_SCOPE } from '@/router/constant';
import { errorRoutes } from '@/router/error-routes';
import { externalRoutes } from '@/router/external-routes';
import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';

import authRoutes from '@/services/auth/routes/routes';
import landingPageRoutes from '@/services/landing/routes/routes';
import myPageRoutes from '@/services/my-page/routes/routes';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

const userStore = useUserStore(pinia);

export const alertManagerV1IntegralRoutes: RouteConfig[] = [
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
                    ...alertManagerV1AdminRoutes,
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
                    ...alertManagerV1WorkspaceRoutes,
                ],
            },
            myPageRoutes,
            ...errorRoutes,
        ],
    },
];
