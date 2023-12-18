import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';

import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';

const HomeDashboard = () => import('@/services/home-dashboard/pages/HomeDashboardPage.vue');

export default {
    path: 'home-dashboard',
    name: makeAdminRouteName(HOME_DASHBOARD_ROUTE._NAME),
    meta: { menuId: MENU_ID.HOME_DASHBOARD },
    component: HomeDashboard,
} as RouteConfig;
