import { RouteConfig } from 'vue-router';
import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';
import { ROUTE_ACCESS_LEVEL } from '@/lib/access-control';

const Dashboard = () => import(/* webpackChunkName: "Dashboard" */ '@/services/dashboard/DashboardPage.vue');

export default {
    path: 'dashboard',
    name: DASHBOARD_ROUTE._NAME,
    meta: { accessLevel: ROUTE_ACCESS_LEVEL.AUTHENTICATED },
    component: Dashboard,
} as RouteConfig;
