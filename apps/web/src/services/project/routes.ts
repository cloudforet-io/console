import type { RouteConfig } from 'vue-router';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { MENU_ID } from '@/lib/menu/config';

import { PROJECT_ROUTE } from '@/services/project/route-config';

const ProjectPage = () => import('@/services/project/ProjectPage.vue');
const ProjectDetailPage = () => import('@/services/project/project-detail/ProjectDetailPage.vue');

const ProjectDashboardPage = () => import('@/services/project/project-detail/project-summary/ProjectSummaryPage.vue');
const ProjectMemberPage = () => import('@/services/project/project-detail/project-member/ProjectMemberPage.vue');
const ProjectAlertPage = () => import('@/services/project/project-detail/project-alert/ProjectAlertPage.vue');
const ProjectNotificationsPage = () => import('@/services/project/project-detail/project-notification/ProjectNotificationPage.vue');
const ProjectTagPage = () => import('@/services/project/project-detail/project-tag/ProjectTagPage.vue');
// eslint-disable-next-line max-len
const ProjectAlertEventRulePage = () => import('@/services/project/project-detail/project-alert/project-alert-event-rule/ProjectAlertEventRulePage.vue');
const ProjectNotificationAddPage = () => import('@/services/project/project-detail/project-notification/ProjectNotificationAddPage.vue');

const ProjectAlertListPage = () => import('@/services/project/project-detail/project-alert/project-alert-list/ProjectAlertListPage.vue');
// eslint-disable-next-line max-len
const ProjectMaintenanceWindowPage = () => import('@/services/project/project-detail/project-alert/project-maintenance-window/ProjectMaintenanceWindowPage.vue');
const ProjectWebhookPage = () => import('@/services/project/project-detail/project-alert/project-webhook/ProjectWebhookPage.vue');
const ProjectAlertSettingsPage = () => import('@/services/project/project-detail/project-alert/project-alert-settings/ProjectAlertSettingsPage.vue');

export default {
    path: 'project',
    meta: { menuId: MENU_ID.PROJECT },
    component: { template: '<router-view />' },
    children: [
        {
            path: '/',
            name: PROJECT_ROUTE._NAME,
            meta: { accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
            props: true,
            component: ProjectPage,
        },
        {
            path: ':id',
            name: PROJECT_ROUTE.DETAIL._NAME,
            meta: { accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
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
                                    component: ProjectAlertListPage,
                                },
                                {
                                    path: 'maintenance-window',
                                    name: PROJECT_ROUTE.DETAIL.TAB.ALERT.MAINTENANCE_WINDOW._NAME,
                                    props: true,
                                    component: ProjectMaintenanceWindowPage,
                                },
                                {
                                    path: 'webhook',
                                    name: PROJECT_ROUTE.DETAIL.TAB.ALERT.WEBHOOK._NAME,
                                    props: true,
                                    component: ProjectWebhookPage,
                                },
                                {
                                    path: 'settings',
                                    name: PROJECT_ROUTE.DETAIL.TAB.ALERT.SETTINGS._NAME,
                                    props: true,
                                    component: ProjectAlertSettingsPage,
                                },
                            ],
                        },
                        {
                            path: 'notification',
                            name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS._NAME,
                            props: true,
                            component: ProjectNotificationsPage,
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
                    props: (route) => ({ projectId: route.params.id }),
                    component: ProjectAlertEventRulePage,
                },
                {
                    path: 'notification/:protocol/:protocolId/:userId',
                    name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS.ADD._NAME,
                    component: ProjectNotificationAddPage,
                    props: true,
                },
            ],
        },
    ],
} as RouteConfig;
