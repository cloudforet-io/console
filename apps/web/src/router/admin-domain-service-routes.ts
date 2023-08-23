import type { RouteRecordRaw } from 'vue-router';

import { errorRoutes } from '@/router/error-routes';

import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import administrationRoute from '@/services/administration/routes';
import authRoutes from '@/services/auth/routes';

const TotalDashboardPage = () => import('@/services/total-dashboard/TotalDashboardPage.vue');

const ROOT_DOMAIN_ROUTE = Object.freeze({
    _NAME: 'root',
    HOME_DASHBOARD: { _NAME: 'home_dashboard' },
    IDENTITY: {
        _NAME: ADMINISTRATION_ROUTE._NAME,
        USER: ADMINISTRATION_ROUTE.IAM.USER,
    },
});

export const adminDomainServiceRoutes: RouteRecordRaw[] = [
    ...authRoutes,
    {
        path: '/',
        name: ROOT_DOMAIN_ROUTE._NAME,
        redirect: '/home-dashboard',
        component: { template: '<router-view />' },
        children: [
            {
                path: 'home-dashboard',
                name: ROOT_DOMAIN_ROUTE.HOME_DASHBOARD._NAME,
                component: TotalDashboardPage,
            },
            administrationRoute,
        ] as RouteRecordRaw[],
    },
    ...errorRoutes,
];
