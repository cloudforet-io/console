import { RouteConfig } from 'vue-router';
import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';

const Dashboard = () => import(/* webpackChunkName: "Dashboard" */ '@/services/dashboard/DashboardPage.vue');

export default {
    path: 'dashboard',
    name: DASHBOARD_ROUTE._NAME,
    component: Dashboard,
} as RouteConfig;
