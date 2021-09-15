import { RouteConfig } from 'vue-router';

const PowerSchedulerPage = () => import(/* webpackChunkName: "PowerSchedulerLanding" */ '@/services/automation/power-scheduler/PowerSchedulerPage.vue');
const PowerSchedulerDetailPage = () => import(/* webpackChunkName: "PowerSchedulerDetailPage" */ '@/services/automation/power-scheduler/power-scheduler-detail/PowerSchedulerDetailPage.vue');
const ResourceGroupPage = () => import(/* webpackChunkName: "ResourceGroup" */ '@/services/automation/power-scheduler/power-scheduler-detail/resource-group/ResourceGroupPage.vue');

const SpotAutomationPage = () => import(/* webpackChunkName: "SpotAutomationPage" */ '@/services/automation/spot-automation/SpotAutomationPage.vue');
const SpotDashboardPage = () => import(/* webpackChunkName: "SpotDashboardPage" */ '@/services/automation/spot-automation/spot-dashboard/SpotDashboardPage.vue');
const SpotGroupPage = () => import(/* webpackChunkName: "SpotGroupPage" */ '@/services/automation/spot-automation/spot-group/SpotGroupPage.vue');
const SpotGroupDetailPage = () => import(/* webpackChunkName: "SpotGroupDetailPage" */ '@/services/automation/spot-automation/spot-group/spot-group-detail/SpotGroupDetailPage.vue');
const SpotGroupAddPage = () => import(/* webpackChunkName: "SpotGroupAddPage" */ '@/services/automation/spot-automation/spot-group/spot-group-add/SpotGroupAddPage.vue');

export const AUTOMATION_ROUTE = Object.freeze({
    _NAME: 'automation',
    POWER_SCHEDULER: {
        _NAME: 'powerSchedulerLanding',
        ADD: { _NAME: 'powerScheduler' },
        DETAIL: { _NAME: 'powerSchedulerDetail' },
        RESOURCE_GROUP: { _NAME: 'powerSchedulerResourceGroup' },
    },
    SPOT_AUTOMATION: {
        _NAME: 'spotAutomation',
        DASHBOARD: { _NAME: 'spotDashboard' },
        SPOT_GROUP: {
            _NAME: 'spotGroup',
            ADD: { _NAME: 'addSpotGroup' },
            DETAIL: { _NAME: 'spotGroupDetail' },
        },
    },
});

export default {
    path: 'automation',
    name: AUTOMATION_ROUTE._NAME,
    redirect: '/automation/power-scheduler',
    meta: { label: 'Automation' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'power-scheduler',
            meta: { label: 'Power Scheduler' },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: AUTOMATION_ROUTE.POWER_SCHEDULER._NAME,
                    component: PowerSchedulerPage,
                },
                {
                    path: ':projectId',
                    name: AUTOMATION_ROUTE.POWER_SCHEDULER.ADD._NAME,
                    props: true,
                    component: PowerSchedulerDetailPage,
                },
                {
                    path: ':projectId/:scheduleId',
                    name: AUTOMATION_ROUTE.POWER_SCHEDULER.DETAIL._NAME,
                    props: true,
                    component: PowerSchedulerDetailPage,
                    children: [
                        {
                            path: ':resourceGroupId',
                            name: AUTOMATION_ROUTE.POWER_SCHEDULER.RESOURCE_GROUP._NAME,
                            props: true,
                            component: ResourceGroupPage,
                        },
                    ],
                },
            ],
        },
        {
            path: 'spot-automation',
            meta: { label: 'Spot Automation' },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: AUTOMATION_ROUTE.SPOT_AUTOMATION._NAME,
                    component: SpotAutomationPage,
                    children: [
                        {
                            path: 'spot-dashboard',
                            name: AUTOMATION_ROUTE.SPOT_AUTOMATION.DASHBOARD._NAME,
                            component: SpotDashboardPage,
                        },
                        {
                            path: 'spot-group',
                            name: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP._NAME,
                            component: SpotGroupPage,
                        },
                    ],
                },
                {
                    path: 'spot-group/add/:projectId?',
                    name: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP.ADD._NAME,
                    component: SpotGroupAddPage,
                },
                {
                    path: 'spot-group/:id',
                    name: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP.DETAIL._NAME,
                    props: true,
                    component: SpotGroupDetailPage,
                },
            ],
        },
    ],
} as RouteConfig;
