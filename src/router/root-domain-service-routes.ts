import { RouteConfig } from 'vue-router';
import ErrorPage from '@/common/pages/ErrorPage.vue';
import authRoutes from '@/services/auth/routes';

const TotalDashboardPage = () => import(/* webpackChunkName: "TotalDashboardPage" */ '@/services/total-dashboard/TotalDashboardPage.vue');

const ROOT_DOMAIN_ROUTE = Object.freeze({
    _NAME: 'root',
    ERROR: { _NAME: 'error' },
    DASHBOARD: { _NAME: 'dashboard' },
});

export const rootDomainServiceRoutes: RouteConfig[] = [
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
    {
        path: '/error-page',
        name: ROOT_DOMAIN_ROUTE.ERROR._NAME,
        meta: { excludeAuth: true },
        component: ErrorPage,
    },
    {
        path: '*',
        component: ErrorPage,
    },
];
