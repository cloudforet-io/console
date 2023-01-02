import type { RouteConfig } from 'vue-router';

import { i18n } from '@/translations';

import { MENU_ID } from '@/lib/menu/config';

import type { Breadcrumb } from '@/common/modules/page-layouts/type';

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
            redirect: () => ({ name: DASHBOARDS_ROUTE.ALL._NAME }),
            meta: { menuId: MENU_ID.DASHBOARDS },
            children: [
                {
                    path: 'all',
                    name: DASHBOARDS_ROUTE.ALL._NAME,
                    meta: { lnbVisible: true, translationId: 'DASHBOARDS.ALL_DASHBOARDS.VIEW_ALL' },
                    component: AllDashboardsPage,
                },
                {
                    path: 'create',
                    name: DASHBOARDS_ROUTE.CREATE._NAME,
                    meta: { translationId: 'DASHBOARDS.CREATE.TITLE' },
                    component: DashboardCreatePage,
                },
                // TODO: remove after test
                {
                    path: 'widgets/:widgetId',
                    props: true,
                    component: WidgetPreviewPage,
                },
                {
                    path: ':dashboardScope',
                    meta: {
                        translationId: ({ params }) => {
                            // song-lang
                            if (params.dashboardScope === 'project') return 'Project';
                            return 'Entire Workspaces';
                        },
                        copiable: true,
                    },
                    redirect: () => ({ name: DASHBOARDS_ROUTE.ALL._NAME }),
                    props: true,
                    component: { template: '<router-view/>' },
                    children: [
                        {
                            path: ':dashboardId',
                            name: DASHBOARDS_ROUTE.DETAIL._NAME,
                            meta: { lnbVisible: true, label: ({ params }) => params.dashboardId, copiable: true },
                            props: true,
                            component: DashboardDetailPage,
                        },
                        {
                            path: 'customize/:dashboardId?',
                            name: DASHBOARDS_ROUTE.CUSTOMIZE._NAME,
                            meta: {
                                breadcrumbs: ({ params }) => {
                                    const breadcrumbs: Breadcrumb[] = [
                                        {
                                            // song-lang
                                            name: i18n.t('Customize'),
                                            to: {
                                                name: DASHBOARDS_ROUTE.CUSTOMIZE._NAME,
                                            },
                                        },
                                    ];
                                    if (params.dashboardId) {
                                        breadcrumbs.push({
                                            name: params.dashboardId,
                                            to: {
                                                name: DASHBOARDS_ROUTE.CUSTOMIZE._NAME,
                                                params: {
                                                    dashboardId: params.dashboardId,
                                                },
                                            },
                                            copiable: true,
                                        });
                                    }
                                    return breadcrumbs;
                                },
                            },
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
