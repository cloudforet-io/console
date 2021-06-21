import { RouteConfig } from 'vue-router';

const ProjectPage = () => import(/* webpackChunkName: "ProjectPage" */ '@/views/project/project/pages/ProjectPage.vue');
const ProjectDetailPage = () => import(/* webpackChunkName: "ProjectDetailPage" */ '@/views/project/project/pages/ProjectDetailPage.vue');

const ProjectDashboardPage = () => import(/* webpackChunkName: "ProjectDashboardPage" */ '@/views/project/project/pages/ProjectDashboardPage.vue');
const ProjectMemberPage = () => import(/* webpackChunkName: "ProjectMemberPage" */ '@/views/project/project/pages/ProjectMemberPage.vue');
const ProjectAlertPage = () => import(/* webpackChunkName: "ProjectAlertPage" */ '@/views/project/project/pages/ProjectAlertPage.vue');
const ProjectNotificationsPage = () => import(/* webpackChunkName: "ProjectNotificationsPage" */ '@/views/project/project/pages/ProjectNotificationsPage.vue');
const ProjectMaintenanceWindowPage = () => import(/* webpackChunkName: "ProjectMaintenanceWindowPage" */ '@/views/project/project/pages/ProjectMaintenanceWindowPage.vue');
const ProjectTagPage = () => import(/* webpackChunkName: "ProjectTagPage" */ '@/views/project/project/pages/ProjectTagPage.vue');
const AddEventRulePage = () => import(/* webpackChunkName: "AddEventRulePage" */ '@/views/project/project/pages/AddEventRulePage.vue');

export const PROJECT_ROUTE = Object.freeze({
    _NAME: 'projectMain',
    DETAIL: {
        _NAME: 'projectDetail',
        TAB: {
            _NAME: 'projectTab',
            SUMMARY: { _NAME: 'projectSummary' },
            MEMBER: { _NAME: 'projectMember' },
            ALERT: {
                _NAME: 'projectAlert',
                EVENT_RULE: { _NAME: 'projectEventRule' },
            },
            NOTIFICATIONS: { _NAME: 'projectNotifications' },
            MAINTENANCE_WINDOW: { _NAME: 'projectMaintenanceWindow' },
            TAG: { _NAME: 'projectTag' },
        },
    },
});

export default {
    path: 'project',
    meta: { label: 'Project' },
    component: { template: '<router-view />' },
    children: [
        {
            path: '/',
            name: PROJECT_ROUTE._NAME,
            props: true,
            component: ProjectPage,
        },
        {
            path: ':id/event-rule',
            name: PROJECT_ROUTE.DETAIL.TAB.ALERT.EVENT_RULE._NAME,
            props: true,
            component: AddEventRulePage,
        },
        {
            path: ':id',
            name: PROJECT_ROUTE.DETAIL._NAME,
            redirect: ':id/summary',
            props: true,
            component: ProjectDetailPage,
            children: [
                {
                    path: 'summary',
                    name: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
                    props: true,
                    component: ProjectDashboardPage,
                },
                {
                    path: 'member',
                    name: PROJECT_ROUTE.DETAIL.TAB.MEMBER._NAME,
                    props: true,
                    component: ProjectMemberPage,
                },
                {
                    path: 'alert',
                    name: PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME,
                    props: true,
                    component: ProjectAlertPage,
                    children: [
                        // {
                        //     path: 'event-rule',
                        //     name: PROJECT_ROUTE.DETAIL.TAB.ALERT.EVENT_RULE._NAME,
                        //     props: true,
                        //     component: AddEventRulePage,
                        // },
                    ],
                },
                {
                    path: 'notifications',
                    name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS._NAME,
                    props: true,
                    component: ProjectNotificationsPage,
                },
                {
                    path: 'maintenance-window',
                    name: PROJECT_ROUTE.DETAIL.TAB.MAINTENANCE_WINDOW._NAME,
                    props: true,
                    component: ProjectMaintenanceWindowPage,
                },
                {
                    path: 'tag',
                    name: PROJECT_ROUTE.DETAIL.TAB.TAG._NAME,
                    props: true,
                    component: ProjectTagPage,
                },
                {
                    path: '*',
                    redirect: 'summary',
                },
            ],
        },
    ],
} as RouteConfig;
