import type { RouteConfig } from 'vue-router';

import { ACCESS_LEVEL } from '@/lib/access-control/config';

import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';

const Dashboard = () => import(/* webpackChunkName: "Dashboard" */ '@/services/dashboard/DashboardPage.vue');

export default {
    path: 'dashboard',
    name: DASHBOARD_ROUTE._NAME,
    meta: { accessLevel: ACCESS_LEVEL.AUTHENTICATED },
    component: Dashboard,
} as RouteConfig;
