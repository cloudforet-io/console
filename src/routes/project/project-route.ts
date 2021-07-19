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
const AddNotificationPage = () => import(/* webpackChunkName: "AddNotificationPage" */ '@/views/identity/user/pages/AddNotificationPage.vue');

const ProjectAlert = () => import(/* webpackChunkName: "ProjectAlert" */ '@/views/project/project/modules/ProjectAlert.vue');
const ProjectWebhook = () => import(/* webpackChunkName: "ProjectWebhook" */ '@/views/project/project/modules/ProjectWebhook.vue');
const ProjectSettings = () => import(/* webpackChunkName: "ProjectSettings" */ '@/views/project/project/modules/ProjectSettings.vue');


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
                ALERT: { _NAME: 'projectAlertList' },
                WEBHOOK: { _NAME: 'projectWebhook' },
                SETTINGS: { _NAME: 'projectSettings' },
            },
            NOTIFICATIONS: {
                _NAME: 'projectNotifications',
                ADD: { _NAME: 'addProjectNotification' },
            },
            MAINTENANCE_WINDOW: { _NAME: 'projectMaintenanceWindow' },
            TAG: { _NAME: 'projectTag' },
        },
        EVENT_RULE: { _NAME: 'projectEventRule' },
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
            path: ':id',
            name: PROJECT_ROUTE.DETAIL._NAME,
            redirect: ':id/summary',
            props: true,
            component: { template: '<keep-alive><router-view /></keep-alive>' },
            children: [
                {
                    path: '/',
                    name: PROJECT_ROUTE.DETAIL.TAB._NAME,
                    redirect: 'summary',
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
                            redirect: 'alert/alert',
                            props: true,
                            component: ProjectAlertPage,
                            children: [
                                {
                                    path: 'alert',
                                    name: PROJECT_ROUTE.DETAIL.TAB.ALERT.ALERT._NAME,
                                    props: true,
                                    component: ProjectAlert,
                                },
                                {
                                    path: 'webhook',
                                    name: PROJECT_ROUTE.DETAIL.TAB.ALERT.WEBHOOK._NAME,
                                    props: true,
                                    component: ProjectWebhook,
                                },
                                {
                                    path: 'settings',
                                    name: PROJECT_ROUTE.DETAIL.TAB.ALERT.SETTINGS._NAME,
                                    props: true,
                                    component: ProjectSettings,
                                },
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
                {
                    path: 'event-rule',
                    name: PROJECT_ROUTE.DETAIL.EVENT_RULE._NAME,
                    props: route => ({ projectId: route.params.id }),
                    component: AddEventRulePage,
                },
                {
                    path: 'notification/:protocol/:protocolId/:userId',
                    name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS.ADD._NAME,
                    component: AddNotificationPage,
                    props: true,
                },
            ],
        },
    ],
} as RouteConfig;
