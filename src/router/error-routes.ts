import { RouteConfig } from 'vue-router';
import ErrorPage from '@/common/pages/ErrorPage.vue';
import { ROUTE_ACCESS_LEVEL } from '@/lib/access-control';

export const ERROR_ROUTE = Object.freeze({
    _NAME: 'error',
});


export const errorRoutes: RouteConfig[] = [
    {
        path: '/error-page',
        name: ERROR_ROUTE._NAME,
        meta: { accessLevel: ROUTE_ACCESS_LEVEL.EXCLUDE_AUTH },
        component: ErrorPage,
    },
    {
        path: '*',
        component: ErrorPage,
    },
];
