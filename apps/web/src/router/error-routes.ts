import type { RouteConfig } from 'vue-router';

import { ERROR_ROUTE } from '@/router/constant';

import ErrorPage from '@/common/pages/ErrorPage.vue';

export const errorRoutes: RouteConfig[] = [
    {
        path: '/error-page/:statusCode?',
        name: ERROR_ROUTE._NAME,
        props: true,
        component: ErrorPage,
    },
    {
        path: '*',
        component: ErrorPage,
    },
];
