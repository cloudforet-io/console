import type { RouteConfig } from 'vue-router';

import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';

const DashboardContainer = () => import(/* webpackChunkName: "DashboardContainer" */ '@/services/dashboard/DashboardContainer.vue');
const DashboardPage = () => import(/* webpackChunkName: "DashboardPage" */ '@/services/dashboard/dashboard/DashboardPage.vue');
const CreateDashboardPage = () => import(/* webpackChunkName: "CreateDashboardPage" */ '@/services/dashboard/create-dashboard/CreateDashboardPage.vue');
const EditDashboardPage = () => import(/* webpackChunkName: "EditDashboardPage" */ '@/services/dashboard/edit-dashboard/EditDashboardPage.vue');

const dashboardRoute: RouteConfig = {
    path: 'dashboard',
    component: DashboardContainer,
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
            path: 'edit/:dashboardId',
            name: DASHBOARD_ROUTE.EDIT._NAME,
            component: EditDashboardPage,
        },
    ],
};

export default dashboardRoute;
