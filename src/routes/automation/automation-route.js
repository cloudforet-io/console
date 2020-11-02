const Automation = () => import('@/views/automation/Automation.vue');
const PowerSchedulerLandingPage = () => import('@/views/automation/power-scheduler/pages/PowerSchedulerLandingPage.vue');
const PowerSchedulerPage = () => import('@/views/automation/power-scheduler/pages/PowerSchedulerPage.vue');
const ResourceGroupPage = () => import('@/views/automation/power-scheduler/pages/ResourceGroupPage.vue');

export default {
    path: 'automation',
    name: 'automation',
    redirect: '/automation/power-scheduler',
    meta: { label: 'Automation' },
    component: Automation,
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
                    path: ':projectId',
                    name: 'powerScheduler',
                    props: true,
                    component: PowerSchedulerPage,
                },
                {
                    path: ':projectId/:scheduleId',
                    name: 'powerSchedulerDetail',
                    props: true,
                    component: PowerSchedulerPage,
                    children: [
                        {
                            path: ':resourceGroupId',
                            name: 'powerSchedulerResourceGroup',
                            props: true,
                            component: ResourceGroupPage,
                        },
                    ],
                },
            ],
        },
    ],
};
