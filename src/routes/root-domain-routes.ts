import { RouteConfig } from 'vue-router';
import ErrorPage from '@/common/pages/ErrorPage.vue';
import SignOut from '@/common/pages/SignOut.vue';
import signInRoute, { SIGN_IN_ROUTE } from '@/routes/sign-in/sign-in-route';

const TotalDashboardPage = () => import(/* webpackChunkName: "TotalDashboardPage" */ '@/views/dashboard/pages/TotalDashboardPage.vue');

const ROOT_DOMAIN_ROUTE = Object.freeze({
    _NAME: 'root',
    ERROR: { _NAME: 'error' },
    SIGN_OUT: { _NAME: 'SignOut' },
    SIGN_IN: SIGN_IN_ROUTE,
    DASHBOARD: { _NAME: 'dashboard' },
});

export const rootDomainRoutes: RouteConfig[] = [
    {
        path: '/error-page',
        name: ROOT_DOMAIN_ROUTE.ERROR._NAME,
        meta: { label: '', excludeAuth: true },
        component: ErrorPage,
    },
    {
        path: '/sign-out',
        name: ROOT_DOMAIN_ROUTE.SIGN_OUT._NAME,
        component: SignOut,
        meta: { label: '', excludeAuth: true, isSignInPage: false },
    },
    signInRoute,
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
    { path: '*', component: ErrorPage },
];
