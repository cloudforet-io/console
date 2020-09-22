const Management = () => import('@/views/management/management');
const SupervisorPlugins = () => import('@/views/management/supervisor/pages/SupervisorPlugins.vue');
const CollectorHistory = () => import('@/views/management/collector-history/CollectorHistory');
const PowerScheduler = () => import('@/views/management/power-scheduler/pages/PowerScheduler.vue');
const PowerSchedulerDetail = () => import('@/views/management/power-scheduler/pages/PowerSchedulerDetail.vue');

export default {
    path: 'management',
    name: 'management',
    redirect: '/management/supervisor/plugins',
    meta: { label: 'Management' },
    components: {
        main: Management,
    },
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
                    component: SupervisorPlugins,
                },
            ],
        },
        {
            path: 'collector-history',
            name: 'collectorHistory',
            meta: { label: 'Collector History' },
            component: CollectorHistory,
        },
        {
            path: 'power-scheduler',
            meta: { label: 'Power Scheduler' },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: 'powerScheduler',
                    component: PowerScheduler,
                },
                {
                    path: ':projectId',
                    name: 'powerSchedulerDetail',
                    props: true,
                    component: PowerSchedulerDetail,
                },
            ],
        },
    ],
};
