import { RouteConfig } from 'vue-router';

const SupervisorPluginPage = () => import(/* webpackChunkName: "SupervisorPlugin" */ '@/views/management/supervisor/pages/SupervisorPluginPage.vue');
const CollectorHistoryPage = () => import(/* webpackChunkName: "CollectorHistory" */ '@/views/management/collector-history/pages/CollectorHistoryPage.vue');
const CollectorJobHistoryPage = () => import(/* webpackChunkName: "CollectorHistory" */ '@/views/management/collector-history/pages/CollectorJobHistoryPage.vue');

export const MANAGEMENT_ROUTE = Object.freeze({
    MAIN: 'management',
    SUPERVISOR: {
        MAIN: 'supervisor',
        PLUGIN: 'supervisorPlugins',
    },
    HISTORY: {
        COLLECTOR: {
            MAIN: 'collectorHistory',
            JOB: 'collectorJobHistory',
        },
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
            name: MANAGEMENT_ROUTE.HISTORY.COLLECTOR.MAIN,
            meta: { label: 'Collector History' },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: MANAGEMENT_ROUTE.HISTORY.COLLECTOR.MAIN,
                    component: CollectorHistoryPage,
                },
                {
                    path: ':jobId',
                    name: MANAGEMENT_ROUTE.HISTORY.COLLECTOR.JOB,
                    props: true,
                    component: CollectorJobHistoryPage,
                },
            ],
        },
    ],
} as RouteConfig;
