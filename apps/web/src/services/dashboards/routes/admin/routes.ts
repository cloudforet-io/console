import type { RouteConfig } from 'vue-router';

import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import type { Breadcrumb } from '@/common/modules/page-layouts/type';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';

const DashboardsContainer = () => import('@/services/dashboards/DashboardsContainer.vue');
const AdminDashboardMainPage = () => import('@/services/dashboards/pages/admin/AdminDashboardMainPage.vue');
const AdminDashboardCreatePage = () => import('@/services/dashboards/pages/admin/AdminDashboardCreatePage.vue');
const AdminDashboardCustomizePage = () => import('@/services/dashboards/pages/admin/AdminDashboardCustomizePage.vue');
const AdminDashboardDetailPage = () => import('@/services/dashboards/pages/admin/AdminDashboardDetailPage.vue');

const adminDashboardsRoute: RouteConfig = {
    path: 'dashboards',
    meta: {
        menuId: MENU_ID.DASHBOARDS,
        translationId: MENU_INFO_MAP[MENU_ID.DASHBOARDS].translationId,
    },
    component: DashboardsContainer,
    children: [
        {
            path: '/',
            name: makeAdminRouteName(DASHBOARDS_ROUTE._NAME),
            meta: { lnbVisible: true, menuId: MENU_ID.DASHBOARDS },
            component: AdminDashboardMainPage,
        },
        {
            path: 'create',
            name: makeAdminRouteName(DASHBOARDS_ROUTE.CREATE._NAME),
            meta: {
                centeredLayout: true,
                translationId: 'DASHBOARDS.CREATE.TITLE',
            },
            component: AdminDashboardCreatePage,
        },
        {
            path: 'detail/:dashboardId',
            name: makeAdminRouteName(DASHBOARDS_ROUTE.DETAIL._NAME),
            meta: { lnbVisible: true, label: ({ params }) => params.dashboardId, copiable: true },
            props: true,
            component: AdminDashboardDetailPage,
        },
        {
            path: 'customize/:dashboardId?',
            name: makeAdminRouteName(DASHBOARDS_ROUTE.CUSTOMIZE._NAME),
            meta: {
                breadcrumbs: ({ params }) => {
                    const breadcrumbs: Breadcrumb[] = [
                        {
                            name: i18n.t('DASHBOARDS.DETAIL.CUSTOMIZE'),
                            to: {
                                name: makeAdminRouteName(DASHBOARDS_ROUTE.CUSTOMIZE._NAME),
                            },
                        },
                    ];
                    if (params.dashboardId) {
                        breadcrumbs.push({
                            name: params.dashboardId,
                            to: {
                                name: makeAdminRouteName(DASHBOARDS_ROUTE.CUSTOMIZE._NAME),
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
            component: AdminDashboardCustomizePage,
        },
    ],
};

export default adminDashboardsRoute;
