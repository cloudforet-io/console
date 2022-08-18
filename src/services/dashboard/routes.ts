import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';

import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';

const Dashboard = () => import(/* webpackChunkName: "Dashboard" */ '@/services/dashboard/DashboardPage.vue');

export default {
    path: 'dashboard',
    name: DASHBOARD_ROUTE._NAME,
    meta: { accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
    component: Dashboard,
    redirect: () => {
        if (store.getters['user/isDomainOwner'] || store.getters['user/hasSystemRole']) return { name: ADMINISTRATION_ROUTE._NAME };
        return ({ name: DASHBOARD_ROUTE._NAME });
    },
} as RouteConfig;
