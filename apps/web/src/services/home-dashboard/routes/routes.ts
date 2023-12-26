import type { RouteConfig } from 'vue-router';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { MENU_ID } from '@/lib/menu/config';

import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';

const HomeDashboard = () => import('@/services/home-dashboard/pages/HomeDashboardPage.vue');

export default {
    path: 'home-dashboard',
    name: HOME_DASHBOARD_ROUTE._NAME,
    meta: { accessLevel: ACCESS_LEVEL.WORKSPACE_PERMISSION, menuId: MENU_ID.HOME_DASHBOARD },
    component: HomeDashboard,
} as RouteConfig;
