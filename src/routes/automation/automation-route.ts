import { RouteConfig } from 'vue-router';

const PowerSchedulerLandingPage = () => import(/* webpackChunkName: "PowerSchedulerLanding" */ '@/views/automation/power-scheduler/pages/PowerSchedulerLandingPage.vue');
const PowerSchedulerPage = () => import(/* webpackChunkName: "PowerSchedulerPage" */ '@/views/automation/power-scheduler/pages/PowerSchedulerPage.vue');
const ResourceGroupPage = () => import(/* webpackChunkName: "ResourceGroup" */ '@/views/automation/power-scheduler/pages/ResourceGroupPage.vue');

const SpotAutomationMainPage = () => import(/* webpackChunkName: "SpotAutomationMainPage" */ '@/views/automation/spot-automation/pages/SpotAutomationMainPage.vue');
const SpotDashboardPage = () => import(/* webpackChunkName: "SpotDashboardPage" */ '@/views/automation/spot-automation/pages/SpotDashboardPage.vue');
const SpotGroupListPage = () => import(/* webpackChunkName: "SpotGroupPage" */ '@/views/automation/spot-automation/pages/SpotGroupListPage.vue');
const SpotGroupDetailPage = () => import(/* webpackChunkName: "SpotGroupDetailPage" */ '@/views/automation/spot-automation/pages/SpotGroupDetailPage.vue');
const AddSpotGroupPage = () => import(/* webpackChunkName: "AddSpotGroupPage" */ '@/views/automation/spot-automation/pages/AddSpotGroupPage.vue');

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
                    component: PowerSchedulerLandingPage,
                },
                {
                    path: ':projectId',
                    name: AUTOMATION_ROUTE.POWER_SCHEDULER.ADD._NAME,
                    props: true,
                    component: PowerSchedulerPage,
                },
                {
                    path: ':projectId/:scheduleId',
                    name: AUTOMATION_ROUTE.POWER_SCHEDULER.DETAIL._NAME,
                    props: true,
                    component: PowerSchedulerPage,
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
                    component: SpotAutomationMainPage,
                    children: [
                        {
                            path: 'spot-dashboard',
                            name: AUTOMATION_ROUTE.SPOT_AUTOMATION.DASHBOARD._NAME,
                            component: SpotDashboardPage,
                        },
                        {
                            path: 'spot-group',
                            name: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP._NAME,
                            component: SpotGroupListPage,
                        },
                    ],
                },
                {
                    path: 'spot-group/add/:projectId?',
                    name: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP.ADD._NAME,
                    component: AddSpotGroupPage,
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
