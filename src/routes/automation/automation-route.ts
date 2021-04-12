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
    MAIN: 'automation',
    POWER_SCHEDULER: {
        MAIN: 'powerSchedulerLanding',
        ADD: 'powerScheduler',
        DETAIL: 'powerSchedulerDetail',
        RESOURCE_GROUP: 'powerSchedulerResourceGroup',
    },
    SPOT_AUTOMATION: {
        MAIN: 'spotAutomation',
        DASHBOARD: 'spotDashboard',
        SPOT_GROUP: {
            MAIN: 'spotGroup',
            ADD: 'addSpotGroup',
            DETAIL: 'spotGroupDetail',
        },
    },
});

export default {
    path: 'automation',
    name: AUTOMATION_ROUTE.MAIN,
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
                    name: AUTOMATION_ROUTE.POWER_SCHEDULER.MAIN,
                    component: PowerSchedulerLandingPage,
                },
                {
                    path: ':projectId',
                    name: AUTOMATION_ROUTE.POWER_SCHEDULER.ADD,
                    props: true,
                    component: PowerSchedulerPage,
                },
                {
                    path: ':projectId/:scheduleId',
                    name: AUTOMATION_ROUTE.POWER_SCHEDULER.DETAIL,
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
        {
            path: 'spot-automation',
            meta: { label: 'Spot Automation' },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: AUTOMATION_ROUTE.SPOT_AUTOMATION.MAIN,
                    component: SpotAutomationMainPage,
                    children: [
                        {
                            path: 'spot-dashboard',
                            name: AUTOMATION_ROUTE.SPOT_AUTOMATION.DASHBOARD,
                            component: SpotDashboardPage,
                        },
                        {
                            path: 'spot-group',
                            name: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP.MAIN,
                            component: SpotGroupListPage,
                        },
                    ],
                },
                {
                    path: 'spot-group/add/:projectId?',
                    name: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP.ADD,
                    component: AddSpotGroupPage,
                },
                {
                    path: 'spot-group/:id',
                    name: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP.DETAIL,
                    props: true,
                    component: SpotGroupDetailPage,
                },
            ],
        },
    ],
} as RouteConfig;
