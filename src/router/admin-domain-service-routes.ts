import { RouteConfig } from 'vue-router';
import authRoutes from '@/services/auth/routes';
import { errorRoutes } from '@/router/error-routes';

const TotalDashboardPage = () => import(/* webpackChunkName: "TotalDashboardPage" */ '@/services/total-dashboard/TotalDashboardPage.vue');

const ROOT_DOMAIN_ROUTE = Object.freeze({
    _NAME: 'root',
    DASHBOARD: { _NAME: 'dashboard' },
});

export const adminDomainServiceRoutes: RouteConfig[] = [
    ...authRoutes,
    {
        path: '/',
        name: ROOT_DOMAIN_ROUTE._NAME,
        meta: { label: 'root' },
        redirect: '/dashboard',
        component: { template: '<router-view />' },
        children: [
            {
                path: 'dashboard',
                name: ROOT_DOMAIN_ROUTE.DASHBOARD._NAME,
                meta: { label: 'Dashboard' },
                component: TotalDashboardPage,
            } as RouteConfig,
        ],
    },
    ...errorRoutes,
];
