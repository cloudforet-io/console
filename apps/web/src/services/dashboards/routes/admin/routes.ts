import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';

const DashboardsContainer = () => import('@/services/dashboards/DashboardsContainer.vue');
const DashboardsMainPage = () => import('@/services/dashboards/pages/DashboardsMainPage.vue');
const DashboardCreatePage = () => import('@/services/dashboards/pages/DashboardCreatePage.vue');
const DashboardDetailPage = () => import('@/services/dashboards/pages/DashboardDetailPage.vue');

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
            meta: { lsbVisible: true, menuId: MENU_ID.DASHBOARDS },
            component: DashboardsMainPage,
        },
        {
            path: 'create',
            name: makeAdminRouteName(DASHBOARDS_ROUTE.CREATE._NAME),
            meta: {
                centeredLayout: true,
                translationId: 'DASHBOARDS.CREATE.TITLE',
            },
            component: DashboardCreatePage,
        },
        {
            path: 'detail/:dashboardId',
            name: makeAdminRouteName(DASHBOARDS_ROUTE.DETAIL._NAME),
            meta: { lsbVisible: true, label: ({ params }) => params.dashboardId, copiable: true },
            props: true,
            component: DashboardDetailPage,
        },
    ],
};

export default adminDashboardsRoute;
