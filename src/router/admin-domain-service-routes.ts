import { RouteConfig } from 'vue-router';
import authRoutes from '@/services/auth/routes';
import { errorRoutes } from '@/router/error-routes';
import { userRoute } from '@/services/administration/routes';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

const TotalDashboardPage = () => import(/* webpackChunkName: "TotalDashboardPage" */ '@/services/total-dashboard/TotalDashboardPage.vue');


const ROOT_DOMAIN_ROUTE = Object.freeze({
    _NAME: 'root',
    DASHBOARD: { _NAME: 'dashboard' },
    IDENTITY: {
        _NAME: ADMINISTRATION_ROUTE._NAME,
        USER: ADMINISTRATION_ROUTE.USER,
    },
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
            },
            {
                path: 'identity',
                name: ROOT_DOMAIN_ROUTE.IDENTITY._NAME,
                redirect: `identity/${userRoute.path}`,
                meta: { label: 'Identity' },
                component: { template: '<router-view />' },
                children: [
                    userRoute,
                ],
            },
        ] as RouteConfig[],
    },
    ...errorRoutes,
];
