import { defineAsyncComponent } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import { ACCESS_LEVEL } from '@/lib/access-control/config';

import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/route-config';

const HomeDashboard = defineAsyncComponent(() => import('@/services/home-dashboard/HomeDashboardPage.vue'));

export default {
    path: 'home-dashboard',
    name: HOME_DASHBOARD_ROUTE._NAME,
    meta: { accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
    component: HomeDashboard,
} as RouteRecordRaw;
