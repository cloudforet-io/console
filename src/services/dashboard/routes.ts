import type { RouteConfig } from 'vue-router';

import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';

const DashboardContainer = () => import(/* webpackChunkName: "DashboardContainer" */ '@/services/dashboard/DashboardContainer.vue');
const DashboardPage = () => import(/* webpackChunkName: "DashboardPage" */ '@/services/dashboard/dashboard/DashboardPage.vue');
const CreateDashboardPage = () => import(/* webpackChunkName: "CreateDashboardPage" */ '@/services/dashboard/create-dashboard/CreateDashboardPage.vue');

const dashboardRoutes: RouteConfig = {
    path: 'dashboard',
    name: DASHBOARD_ROUTE._NAME,
    component: DashboardContainer,
    children: [
        {
            path: '/',
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: DASHBOARD_ROUTE._NAME,
                    meta: { lnbVisible: true },
                    component: DashboardPage,
                },
                {
                    path: 'create',
                    name: DASHBOARD_ROUTE.CREATE._NAME,
                    component: CreateDashboardPage,
                },
                {
                    path: 'edit',
                    name: DASHBOARD_ROUTE.EDIT._NAME,
                    component: CreateDashboardPage,
                },
            ],
        },

    ],
};

export default dashboardRoutes;
