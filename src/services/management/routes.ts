import { RouteConfig } from 'vue-router';

const SupervisorPluginPage = () => import(/* webpackChunkName: "SupervisorPlugin" */ '@/services/management/supervisor/supervisor-plugin/SupervisorPluginPage.vue');
const CollectorHistoryPage = () => import(/* webpackChunkName: "CollectorHistory" */ '@/services/management/collector-history/CollectorHistoryPage.vue');
const CollectJobPage = () => import(/* webpackChunkName: "CollectorHistory" */ '@/services/management/collector-history/collect-job/CollectJobPage.vue');

export const MANAGEMENT_ROUTE = Object.freeze({
    _NAME: 'management',
    SUPERVISOR: {
        _NAME: 'supervisor',
        PLUGIN: { _NAME: 'supervisorPlugin' },
    },
    HISTORY: {
        _NAME: 'history',
        COLLECTOR: {
            _NAME: 'collectorHistory',
            JOB: { _NAME: 'collectorJobHistory' },
        },
    },
});

export default {
    path: 'management',
    name: MANAGEMENT_ROUTE._NAME,
    redirect: '/management/supervisor/plugin',
    meta: { label: 'Management' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'supervisor',
            name: MANAGEMENT_ROUTE.SUPERVISOR._NAME,
            meta: { label: 'Supervisor' },
            redirect: '/management/supervisor/plugin',
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'plugin',
                    name: MANAGEMENT_ROUTE.SUPERVISOR.PLUGIN._NAME,
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
            meta: { label: 'Collector History' },
            component: { template: '<keep-alive><router-view /></keep-alive>' },
            children: [
                {
                    path: '/',
                    name: MANAGEMENT_ROUTE.HISTORY.COLLECTOR._NAME,
                    component: CollectorHistoryPage,
                },
                {
                    path: ':jobId',
                    name: MANAGEMENT_ROUTE.HISTORY.COLLECTOR.JOB._NAME,
                    props: true,
                    component: CollectJobPage,
                },
            ],
        },
    ],
} as RouteConfig;
