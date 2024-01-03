import type { RouteConfig } from 'vue-router';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { MENU_ID } from '@/lib/menu/config';

import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';

const ProjectPage = () => import('@/services/project/pages/ProjectPage.vue');
const ProjectDetailPage = () => import('@/services/project/pages/ProjectDetailPage.vue');

const ProjectSummaryPage = () => import('@/services/project/pages/ProjectSummaryPage.vue');
const ProjectMemberPage = () => import('@/services/project/pages/ProjectMemberPage.vue');
const ProjectAlertPage = () => import('@/services/project/pages/ProjectAlertPage.vue');
const ProjectNotificationsPage = () => import('@/services/project/pages/ProjectNotificationPage.vue');
const ProjectTagPage = () => import('@/services/project/pages/ProjectTagPage.vue');
const ProjectAlertEventRulePage = () => import('@/services/project/pages/ProjectAlertEventRulePage.vue');
const ProjectNotificationAddPage = () => import('@/services/project/pages/ProjectNotificationAddPage.vue');

const ProjectAlertListPage = () => import('@/services/project/pages/ProjectAlertListPage.vue');
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
            meta: { accessLevel: ACCESS_LEVEL.WORKSPACE_PERMISSION, menuId: MENU_ID.PROJECT },
            props: true,
            component: ProjectPage,
        },
        {
            path: ':id',
            name: PROJECT_ROUTE.DETAIL._NAME,
            meta: { accessLevel: ACCESS_LEVEL.WORKSPACE_PERMISSION },
            redirect: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
            props: true,
            component: { template: '<keep-alive><router-view /></keep-alive>' },
            children: [
                {
                    path: '/',
                    name: PROJECT_ROUTE.DETAIL.TAB._NAME,
                    redirect: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
                    props: true,
                    component: ProjectDetailPage,
                    children: [
                        {
                            path: 'summary',
                            name: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
                            props: true,
                            component: ProjectSummaryPage,
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
                    path: 'notification/:protocolId',
                    name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS.ADD._NAME,
                    component: ProjectNotificationAddPage,
                    props: true,
                },
            ],
        },
    ],
} as RouteConfig;
