import type { RouteConfig } from 'vue-router';

import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';

const DashboardContainer = () => import(/* webpackChunkName: "DashboardContainer" */ '@/services/dashboard/DashboardContainer.vue');
const DashboardPage = () => import(/* webpackChunkName: "DashboardPage" */ '@/services/dashboard/dashboard/DashboardPage.vue');
const CreateDashboardPage = () => import(/* webpackChunkName: "CreateDashboardPage" */ '@/services/dashboard/create-dashboard/CreateDashboardPage.vue');

const dashboardRoute: RouteConfig = {
    path: 'dashboard',
    component: DashboardContainer,
    redirect: () => ({ name: DASHBOARD_ROUTE._NAME }),
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
};

export default dashboardRoute;
