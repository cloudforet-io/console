import type { RouteConfig } from 'vue-router';

import { errorRoutes } from '@/router/error-routes';

import authRoutes from '@/services/auth/routes/routes';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import iamRoutes from '@/services/iam/routes/routes';

const TotalDashboardPage = () => import('@/services/total-dashboard/TotalDashboardPage.vue');

const ROOT_DOMAIN_ROUTE = Object.freeze({
    _NAME: 'root',
    WORKSPACE_HOME: { _NAME: 'WORKSPACE_HOME' },
    IDENTITY: {
        _NAME: IAM_ROUTE._NAME,
        USER: IAM_ROUTE.USER,
    },
});

export const adminDomainServiceRoutes: RouteConfig[] = [
    ...authRoutes,
    {
        path: '/',
        name: ROOT_DOMAIN_ROUTE._NAME,
        redirect: '/home',
        component: { template: '<router-view />' },
        children: [
            {
                path: 'home',
                name: ROOT_DOMAIN_ROUTE.WORKSPACE_HOME._NAME,
                component: TotalDashboardPage,
            },
            iamRoutes,
        ] as RouteConfig[],
    },
    ...errorRoutes,
];
