import { RouteConfig } from 'vue-router';

const Dashboard = () => import(/* webpackChunkName: "Dashboard" */ '@/services/dashboard/DashboardPage.vue');

export const DASHBOARD_ROUTE = Object.freeze({
    _NAME: 'dashboard',
});

export default {
    path: 'dashboard',
    name: DASHBOARD_ROUTE._NAME,
    component: Dashboard,
} as RouteConfig;
