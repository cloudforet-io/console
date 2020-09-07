const Management = () => import('@/views/management/management');
const SupervisorPlugins = () => import('@/views/management/supervisor/pages/SupervisorPlugins.vue');
const CollectorHistory = () => import('@/views/management/collector-history/CollectorHistory');
const PowerScheduler = () => import('@/views/management/power-scheduler/pages/PowerScheduler.vue');

export default {
    path: 'management',
    name: 'management',
    redirect: '/management/supervisor/plugins',
    meta: { label: 'Management', breadcrumb: true },
    components: {
        main: Management,
    },
    children: [
        {
            path: 'supervisor',
            name: 'supervisor',
            meta: { label: 'Supervisor', breadcrumb: true },
            redirect: '/management/supervisor/plugins',
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'plugins',
                    name: 'supervisorPlugins',
                    meta: {
                        label: 'Plugins',
                        breadcrumb: true,
                        isDomainOwnerOnly: true,
                    },
                    component: SupervisorPlugins,
                },
            ],
        },
        {
            path: 'collector-history',
            name: 'collectorHistory',
            meta: { label: 'Collector History', breadcrumb: true },
            component: CollectorHistory,
        },
        {
            path: 'power-scheduler',
            name: 'powerScheduler',
            meta: { label: 'Power Scheduler', breadcrumb: true },
            component: PowerScheduler,
        },
    ],
};
