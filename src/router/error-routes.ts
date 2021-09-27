import { RouteConfig } from 'vue-router';
import ErrorPage from '@/common/pages/ErrorPage.vue';

export const ERROR_ROUTE = Object.freeze({
    _NAME: 'error',
});


export const errorRoutes: RouteConfig[] = [
    {
        path: '/error-page',
        name: ERROR_ROUTE._NAME,
        meta: { excludeAuth: true },
        component: ErrorPage,
    },
    {
        path: '*',
        component: ErrorPage,
    },
];
