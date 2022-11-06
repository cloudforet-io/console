import type { RouteConfig } from 'vue-router';

import { ACCESS_LEVEL } from '@/lib/access-control/config';

import ErrorPage from '@/common/pages/ErrorPage.vue';

export const ERROR_ROUTE = Object.freeze({
    _NAME: 'error',
});

export const errorRoutes: RouteConfig[] = [
    {
        path: '/error-page',
        name: ERROR_ROUTE._NAME,
        meta: { accessLevel: ACCESS_LEVEL.EXCLUDE_AUTH },
        component: ErrorPage,
    },
    {
        path: '*',
        component: ErrorPage,
    },
];
