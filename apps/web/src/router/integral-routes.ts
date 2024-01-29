import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { adminRoutes } from '@/router/admin-routes';
import { ROOT_ROUTE, ROUTE_SCOPE } from '@/router/constant';
import { errorRoutes } from '@/router/error-routes';
import { makeAdminRouteName } from '@/router/helpers/route-helper';
import { workspaceRoutes } from '@/router/workspace-routes';

import CostReportPage from '@/common/pages/CostReportPage.vue';

import authRoutes from '@/services/auth/routes/routes';
import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';
import myPageRoutes from '@/services/my-page/routes/routes';


export const integralRoutes: RouteConfig[] = [
    {
        path: '/',
        name: ROOT_ROUTE._NAME,
        component: { template: '<router-view />' },
        redirect: () => ({
            name: ROOT_ROUTE.WORKSPACE._NAME,
        }),
        children: [
            ...authRoutes,
            {
                path: 'cost-report',
                name: ROOT_ROUTE.COST_REPORT._NAME,
                props: (route) => ({
                    accessToken: route.query.sso_access_token,
                    costReportId: route.query.cost_report_id,
                    language: route.query.language,
                }),
                component: CostReportPage,
            },
            {
                path: '/admin',
                name: ROOT_ROUTE.ADMIN._NAME,
                meta: { scope: ROUTE_SCOPE.DOMAIN },
                redirect: () => {
                    if (!store.getters['user/isDomainAdmin']) return { name: ROOT_ROUTE.WORKSPACE._NAME };
                    return ({ name: makeAdminRouteName(HOME_DASHBOARD_ROUTE._NAME) });
                },
                component: { template: '<router-view />' },
                children: [
                    ...adminRoutes,
                ],
            },
            {
                path: 'workspace/:workspaceId?',
                name: ROOT_ROUTE.WORKSPACE._NAME,
                meta: { scope: ROUTE_SCOPE.WORKSPACE },
                redirect: (to) => ({
                    name: HOME_DASHBOARD_ROUTE._NAME,
                    params: {
                        ...to.params,
                    },
                }),
                component: { template: '<router-view />' },
                children: [
                    ...workspaceRoutes,
                ],
            },
            myPageRoutes,
            ...errorRoutes,

        ],
    },
];
