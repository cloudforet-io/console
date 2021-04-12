import { RouteConfig } from 'vue-router';

const SupervisorPluginPage = () => import(/* webpackChunkName: "SupervisorPlugin" */ '@/views/management/supervisor/pages/SupervisorPluginPage.vue');
const CollectorHistory = () => import(/* webpackChunkName: "CollectorHistory" */ '@/views/management/collector-history/CollectorHistory.vue');

export const MANAGEMENT_ROUTE = Object.freeze({
    MAIN: 'management',
    SUPERVISOR: {
        MAIN: 'supervisor',
        PLUGIN: 'supervisorPlugins',
    },
    HISTORY: {
        COLLECTOR: 'collectorHistory',
    },
});

export default {
    path: 'management',
    name: MANAGEMENT_ROUTE.MAIN,
    redirect: '/management/supervisor/plugins',
    meta: { label: 'Management' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'supervisor',
            name: MANAGEMENT_ROUTE.SUPERVISOR.MAIN,
            meta: { label: 'Supervisor' },
            redirect: '/management/supervisor/plugins',
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'plugins',
                    name: MANAGEMENT_ROUTE.SUPERVISOR.PLUGIN,
                    meta: {
                        label: 'Plugins',
                        isDomainOwnerOnly: true,
                    },
                    component: SupervisorPluginPage,
                },
            ],
        },
        {
            path: 'collector-history',
            name: MANAGEMENT_ROUTE.HISTORY.COLLECTOR,
            meta: { label: 'Collector History' },
            component: CollectorHistory,
        },
    ],
} as RouteConfig;
