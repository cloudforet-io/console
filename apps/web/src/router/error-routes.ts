import type { RouteConfig } from 'vue-router';

import { ERROR_ROUTE } from '@/router/constant';

import { ACCESS_LEVEL } from '@/lib/access-control/config';

import ErrorPage from '@/common/pages/ErrorPage.vue';

export const errorRoutes: RouteConfig[] = [
    {
        path: '/error-page/:statusCode?',
        name: ERROR_ROUTE._NAME,
        meta: { accessLevel: ACCESS_LEVEL.EXCLUDE_AUTH },
        props: true,
        component: ErrorPage,
    },
    {
        path: '*',
        component: ErrorPage,
    },
];
