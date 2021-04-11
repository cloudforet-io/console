import { RouteConfig } from 'vue-router';

const PowerSchedulerLandingPage = () => import(/* webpackChunkName: "PowerSchedulerLanding" */ '@/views/automation/power-scheduler/pages/PowerSchedulerLandingPage.vue');
const PowerSchedulerPage = () => import(/* webpackChunkName: "PowerSchedulerPage" */ '@/views/automation/power-scheduler/pages/PowerSchedulerPage.vue');
const ResourceGroupPage = () => import(/* webpackChunkName: "ResourceGroup" */ '@/views/automation/power-scheduler/pages/ResourceGroupPage.vue');

const SpotAutomationMainPage = () => import(/* webpackChunkName: "SpotAutomationMainPage" */ '@/views/automation/spot-automation/pages/SpotAutomationMainPage.vue');
const SpotDashboardPage = () => import(/* webpackChunkName: "SpotDashboardPage" */ '@/views/automation/spot-automation/pages/SpotDashboardPage.vue');
const SpotGroupListPage = () => import(/* webpackChunkName: "SpotGroupPage" */ '@/views/automation/spot-automation/pages/SpotGroupListPage.vue');
const SpotGroupDetailPage = () => import(/* webpackChunkName: "SpotGroupDetailPage" */ '@/views/automation/spot-automation/pages/SpotGroupDetailPage.vue');
const AddSpotGroupPage = () => import(/* webpackChunkName: "AddSpotGroupPage" */ '@/views/automation/spot-automation/pages/AddSpotGroupPage.vue');

export default {
    path: 'automation',
    name: 'automation',
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
        {
            path: 'spot-automation',
            meta: { label: 'Spot Automation' },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: 'spotAutomation',
                    component: SpotAutomationMainPage,
                    children: [
                        {
                            path: 'spot-dashboard',
                            name: 'spotDashboard',
                            component: SpotDashboardPage,
                        },
                        {
                            path: 'spot-group',
                            name: 'spotGroup',
                            component: SpotGroupListPage,
                        },
                    ],
                },
                {
                    path: 'spot-group/add/:projectId?',
                    name: 'addSpotGroup',
                    component: AddSpotGroupPage,
                },
                {
                    path: 'spot-group/:id',
                    name: 'spotGroupDetail',
                    props: true,
                    component: SpotGroupDetailPage,
                },
            ],
        },
    ],
} as RouteConfig;
