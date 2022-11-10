import type { RouteConfig } from 'vue-router';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

const DashboardsContainer = () => import('@/services/dashboards/DashboardsContainer.vue');
const AllDashboardsPage = () => import('@/services/dashboards/all-dashboards/AllDashboardsPage.vue');
const DashboardCreatePage = () => import('@/services/dashboards/dashboard-create/DashboardCreatePage.vue');
const DashboardCustomizePage = () => import('@/services/dashboards/dashboard-customize/DashboardCustomizePage.vue');
const DashboardDetailPage = () => import('@/services/dashboards/dashboard-detail/DashboardDetailPage.vue');

const dashboardsRoute: RouteConfig = {
    path: 'dashboards',
    name: DASHBOARDS_ROUTE._NAME,
    redirect: () => ({ name: DASHBOARDS_ROUTE.ALL._NAME }),
    component: DashboardsContainer,
    children: [
        {
            path: '/',
            component: { template: '<router-view/>' },
            children: [
                {
                    path: 'all',
                    name: DASHBOARDS_ROUTE.ALL._NAME,
                    meta: { lnbVisible: true },
                    component: AllDashboardsPage,
                },
                {
                    path: 'create',
                    name: DASHBOARDS_ROUTE.CREATE._NAME,
                    component: DashboardCreatePage,
                },
                {
                    path: ':dashboardId',
                    name: DASHBOARDS_ROUTE.DETAIL._NAME,
                    meta: { lnbVisible: true },
                    component: DashboardDetailPage,
                },
                {
                    path: ':dashboardId/edit',
                    name: DASHBOARDS_ROUTE.CUSTOMIZE._NAME,
                    component: DashboardCustomizePage,
                },
            ],
        },

    ],
};

export default dashboardsRoute;
