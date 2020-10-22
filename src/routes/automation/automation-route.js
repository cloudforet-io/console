const Automation = () => import('@/views/automation/Automation.vue');
const PowerSchedulerLandingPage = () => import('@/views/automation/power-scheduler/pages/PowerSchedulerLandingPage.vue');
const PowerSchedulerPage = () => import('@/views/automation/power-scheduler/pages/PowerSchedulerPage.vue');

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
                    name: 'powerSchedulerLanding',
                    component: PowerSchedulerLandingPage,
                },
                {
                    path: ':projectId/:scheduleId?',
                    name: 'powerScheduler',
                    props: true,
                    component: PowerSchedulerPage,
                },
            ],
        },
    ],
};
