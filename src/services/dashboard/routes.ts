import type { RouteConfig } from 'vue-router';

import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';

const DashboardContainer = () => import(/* webpackChunkName: "DashboardContainer" */ '@/services/dashboard/DashboardContainer.vue');
const DashboardPage = () => import(/* webpackChunkName: "DashboardPage" */ '@/services/dashboard/dashboard/DashboardPage.vue');
const CreateDashboardPage = () => import(/* webpackChunkName: "CreateDashboardPage" */ '@/services/dashboard/create-dashboard/CreateDashboardPage.vue');
const EditDashboardPage = () => import(/* webpackChunkName: "EditDashboardPage" */ '@/services/dashboard/edit-dashboard/EditDashboardPage.vue');
const DashboardDetailPage = () => import(/* webpackChunkName: "DashboardDetailPage */ '@/services/dashboard/dashboard-detail/DashboardDetailPage.vue');

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
        {
            path: ':dashboardId',
            name: DASHBOARD_ROUTE.DETAIL._NAME,
            meta: { lnbVisible: true },
            component: DashboardDetailPage,
        },
        {
            path: ':dashboardId/customize',
            name: DASHBOARD_ROUTE.CUSTOMIZE_DETAIL._NAME,
            meta: { lnbVisible: true },
            component: DashboardDetailPage,
        },
    ],
};

export default dashboardRoute;
