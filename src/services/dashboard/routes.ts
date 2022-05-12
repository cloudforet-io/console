import { RouteConfig } from 'vue-router';
import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';
import { PAGE_ACCESS_LEVEL } from '@/lib/access-control';

const Dashboard = () => import(/* webpackChunkName: "Dashboard" */ '@/services/dashboard/DashboardPage.vue');

export default {
    path: 'dashboard',
    name: DASHBOARD_ROUTE._NAME,
    meta: { accessLevel: PAGE_ACCESS_LEVEL.REQUIRED_AUTH },
    component: Dashboard,
} as RouteConfig;
