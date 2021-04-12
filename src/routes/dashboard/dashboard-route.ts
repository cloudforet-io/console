import { RouteConfig } from 'vue-router';

const Dashboard = () => import(/* webpackChunkName: "Dashboard" */ '@/views/dashboard/pages/Dashboard.vue');

export const DASHBOARD_ROUTE = Object.freeze({
    MAIN: 'dashboard',
});

export default {
    path: 'dashboard',
    name: DASHBOARD_ROUTE.MAIN,
    meta: { label: 'Dashboard' },
    component: Dashboard,
} as RouteConfig;
