import type { RouteConfig } from 'vue-router';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

const DashboardsContainer = () => import(/* webpackChunkName: "DashboardsContainer" */ '@/services/dashboards/DashboardsContainer.vue');
const AllDashboardsPage = () => import(/* webpackChunkName: "DashboardsPage" */ '@/services/dashboards/all-dashboards/AllDashboardsPage.vue');
const DashboardCreatePage = () => import(/* webpackChunkName: "DashboardCreatePage" */ '@/services/dashboards/dashboard-create/DashboardCreatePage.vue');
const DashboardCustomizePage = () => import(/* webpackChunkName: "DashboardCustomizePage" */ '@/services/dashboards/dashboard-customize/DashboardCustomizePage.vue');
const DashboardDetailPage = () => import(/* webpackChunkName: "DashboardDetailPage" */ '@/services/dashboards/dashboard-detail/DashboardDetailPage.vue');

const dashboardsRoute: RouteConfig = {
    path: 'dashboards',
    component: DashboardsContainer,
    children: [
        {
            path: '/',
            name: DASHBOARDS_ROUTE._NAME,
            meta: { lnbVisible: true },
            component: AllDashboardsPage,
        },
        {
            path: ':dashboardId',
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            meta: { lnbVisible: true },
            component: DashboardDetailPage,
        },
        {
            path: 'create',
            name: DASHBOARDS_ROUTE.CREATE._NAME,
            component: DashboardCreatePage,
        },
        {
            path: ':dashboardId/edit',
            name: DASHBOARDS_ROUTE.CUSTOMIZE._NAME,
            component: DashboardCustomizePage,
        },
    ],
};

export default dashboardsRoute;
