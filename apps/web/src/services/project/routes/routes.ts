import type { RouteConfig } from 'vue-router';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { MENU_ID } from '@/lib/menu/config';

import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';

const ProjectPage = () => import('@/services/project/pages/ProjectPage.vue');
const ProjectDetailPage = () => import('@/services/project/pages/ProjectDetailPage.vue');

const ProjectDashboardPage = () => import('@/services/project/pages/ProjectSummaryPage.vue');
const ProjectMemberPage = () => import('@/services/project/pages/ProjectMemberPage.vue');
const ProjectAlertPage = () => import('@/services/project/pages/ProjectAlertPage.vue');
const ProjectNotificationsPage = () => import('@/services/project/pages/ProjectNotificationPage.vue');
const ProjectTagPage = () => import('@/services/project/pages/ProjectTagPage.vue');
// eslint-disable-next-line max-len
const ProjectAlertEventRulePage = () => import('@/services/project/pages/ProjectAlertEventRulePage.vue');
const ProjectNotificationAddPage = () => import('@/services/project/pages/ProjectNotificationAddPage.vue');

const ProjectAlertListPage = () => import('@/services/project/pages/ProjectAlertListPage.vue');
// eslint-disable-next-line max-len
const ProjectMaintenanceWindowPage = () => import('@/services/project/pages/ProjectMaintenanceWindowPage.vue');
const ProjectWebhookPage = () => import('@/services/project/pages/ProjectWebhookPage.vue');
const ProjectAlertSettingsPage = () => import('@/services/project/pages/ProjectAlertSettingsPage.vue');

export default {
    path: 'project',
    meta: { menuId: MENU_ID.PROJECT },
    component: { template: '<router-view />' },
    children: [
        {
            path: '/',
            name: PROJECT_ROUTE._NAME,
            meta: { accessLevel: ACCESS_LEVEL.WORKSPACE_PERMISSION },
            props: true,
            component: ProjectPage,
        },
        {
            path: ':id',
            name: PROJECT_ROUTE.DETAIL._NAME,
            meta: { accessLevel: ACCESS_LEVEL.WORKSPACE_PERMISSION },
            // redirect: ':id/summary',
            redirect: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
            props: true,
            component: { template: '<keep-alive><router-view /></keep-alive>' },
            children: [
                {
                    path: '/',
                    name: PROJECT_ROUTE.DETAIL.TAB._NAME,
                    // redirect: 'summary',
                    redirect: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
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
