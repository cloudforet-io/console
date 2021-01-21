import { RouteConfig } from 'vue-router';

const SupervisorPluginPage = () => import(/* webpackChunkName: "SupervisorPlugin" */ '@/views/management/supervisor/pages/SupervisorPluginPage.vue');
const CollectorHistory = () => import(/* webpackChunkName: "CollectorHistory" */ '@/views/management/collector-history/CollectorHistory.vue');

export default {
    path: 'management',
    name: 'management',
    redirect: '/management/supervisor/plugins',
    meta: { label: 'Management' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'supervisor',
            name: 'supervisor',
            meta: { label: 'Supervisor' },
            redirect: '/management/supervisor/plugins',
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'plugins',
                    name: 'supervisorPlugins',
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
            name: 'collectorHistory',
            meta: { label: 'Collector History' },
            component: CollectorHistory,
        },
    ],
} as RouteConfig;
