import type { RouteConfig } from 'vue-router';

import { i18n } from '@/translations';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import type { Breadcrumb } from '@/common/modules/page-layouts/type';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';

const DashboardsContainer = () => import('@/services/dashboards/DashboardsContainer.vue');
const DashboardsMainPage = () => import('@/services/dashboards/pages/DashboardsMainPage.vue');
const DashboardCreatePage = () => import('@/services/dashboards/pages/DashboardCreatePage.vue');
const DashboardCustomizePage = () => import('@/services/dashboards/pages/DashboardCustomizePage.vue');
const DashboardDetailPage = () => import('@/services/dashboards/pages/DashboardDetailPage.vue');

const dashboardsRoute: RouteConfig = {
    path: 'dashboards',
    name: DASHBOARDS_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.DASHBOARDS,
        accessLevel: ACCESS_LEVEL.WORKSPACE_PERMISSION,
        translationId: MENU_INFO_MAP[MENU_ID.DASHBOARDS].translationId,
    },
    redirect: () => ({
        name: DASHBOARDS_ROUTE.ALL._NAME,
    }),
    component: DashboardsContainer,
    children: [
        {
            path: '/',
            component: { template: '<router-view/>' },
            redirect: () => ({ name: DASHBOARDS_ROUTE.ALL._NAME }),
            children: [
                {
                    path: 'all',
                    name: DASHBOARDS_ROUTE.ALL._NAME,
                    meta: { lnbVisible: true, translationId: 'DASHBOARDS.ALL_DASHBOARDS.VIEW_ALL' },
                    component: DashboardsMainPage,
                },
                {
                    path: 'create',
                    name: DASHBOARDS_ROUTE.CREATE._NAME,
                    meta: {
                        centeredLayout: true,
                        translationId: 'DASHBOARDS.CREATE.TITLE',
                        accessLevel: ACCESS_LEVEL.WORKSPACE_PERMISSION,
                    },
                    component: DashboardCreatePage,
                },
                {
                    path: 'detail/:dashboardId',
                    name: DASHBOARDS_ROUTE.DETAIL._NAME,
                    meta: { lnbVisible: true, label: ({ params }) => params.dashboardId, copiable: true },
                    props: true,
                    component: DashboardDetailPage,
                },
                {
                    path: 'customize/:dashboardId?',
                    name: DASHBOARDS_ROUTE.CUSTOMIZE._NAME,
                    meta: {
                        accessLevel: ACCESS_LEVEL.WORKSPACE_PERMISSION,
                        breadcrumbs: ({ params }) => {
                            const breadcrumbs: Breadcrumb[] = [
                                {
                                    name: i18n.t('DASHBOARDS.DETAIL.CUSTOMIZE'),
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
};

export default dashboardsRoute;
