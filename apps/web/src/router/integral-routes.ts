import type { RouteConfig } from 'vue-router';

import { ROOT_ROUTE, ROUTE_SCOPE } from '@/router/constant';
import { errorRoutes } from '@/router/error-routes';
import { externalRoutes } from '@/router/external-routes';

import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';

import authRoutes from '@/services/auth/routes/routes';
import landingPageRoutes from '@/services/landing/routes/routes';
import myPageRoutes from '@/services/my-page/routes/routes';
import { ADMIN_WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/admin/route-constant';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

export const integralRoutes: RouteConfig[] = [
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
                    const userStore = useUserStore(pinia);
                    if (!userStore.getters.isDomainAdmin) return { name: ROOT_ROUTE.WORKSPACE._NAME };
                    return ({ name: ADMIN_WORKSPACE_HOME_ROUTE._NAME });
                },
                component: { template: '<router-view />' },
                children: [],
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
                children: [],
            },
            myPageRoutes,
            ...errorRoutes,
        ],
    },
];
