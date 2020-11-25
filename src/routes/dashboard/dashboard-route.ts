import { RouteConfig } from 'vue-router';

const Dashboard = () => import('@/views/dashboard/Dashboard.vue');

export default {
    path: 'dashboard',
    name: 'dashboard',
    meta: { label: 'Dashboard' },
    component: Dashboard,
} as RouteConfig;
