import type { RouteConfig } from 'vue-router';

import { MENU_ID } from '@/lib/menu/config';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

const DashboardsContainer = () => import('@/services/dashboards/DashboardsContainer.vue');
const AllDashboardsPage = () => import('@/services/dashboards/all-dashboards/AllDashboardsPage.vue');
const DashboardCreatePage = () => import('@/services/dashboards/dashboard-create/DashboardCreatePage.vue');
const DashboardCustomizePage = () => import('@/services/dashboards/dashboard-customize/DashboardCustomizePage.vue');
const DashboardDetailPage = () => import('@/services/dashboards/dashboard-detail/DashboardDetailPage.vue');

// TODO: remove after test
const WidgetPreviewPage = () => import('@/services/dashboards/widgets/WidgetsPreviewPage.vue');

const dashboardsRoute: RouteConfig = {
    path: 'dashboards',
    name: DASHBOARDS_ROUTE._NAME,
    redirect: () => ({ name: DASHBOARDS_ROUTE.ALL._NAME }),
    component: DashboardsContainer,
    children: [
        {
            path: '/',
            component: { template: '<router-view/>' },
            meta: { menuId: MENU_ID.DASHBOARDS },
            children: [
                {
                    path: 'all',
                    name: DASHBOARDS_ROUTE.ALL._NAME,
                    // song lang
                    meta: { lnbVisible: true, translationId: 'DASHBOARDS.ALL' },
                    component: AllDashboardsPage,
                },
                {
                    path: 'create',
                    name: DASHBOARDS_ROUTE.CREATE._NAME,
                    component: DashboardCreatePage,
                },
                // TODO: remove after test
                {
                    path: 'widgets/:widgetId',
                    props: true,
                    component: WidgetPreviewPage,
                },
                {
                    path: ':dashboardId?',
                    name: DASHBOARDS_ROUTE.DETAIL._NAME,
                    meta: { lnbVisible: true, label: ({ params }) => params.dashboardId, copiable: true },
                    component: DashboardDetailPage,
                },
                {
                    path: 'customize',
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: ':dashboardId',
                            name: DASHBOARDS_ROUTE.CUSTOMIZE._NAME,
                            meta: { label: ({ params }) => params.dashboardId, copiable: true },
                            props: true,
                            component: DashboardCustomizePage,
                        },
                    ],
                },
            ],
        },

    ],
};

export default dashboardsRoute;
