const Automation = () => import('@/views/automation/Automation.vue');
const PowerScheduler = () => import('@/views/automation/power-scheduler/pages/PowerScheduler.vue');
const PowerSchedulerDetail = () => import('@/views/automation/power-scheduler/pages/PowerSchedulerDetailPage.vue');

export default {
    path: 'automation',
    name: 'automation',
    redirect: '/automation/power-scheduler',
    meta: { label: 'Automation' },
    components: {
        main: Automation,
    },
    children: [
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
