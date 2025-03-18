import type { RouteConfig } from 'vue-router';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';

const ProjectContainer = () => import('@/services/project/v1/ProjectContainer.vue');

const ProjectMainPage = () => import('@/services/project/v1/pages/ProjectMainPage.vue');
const ProjectDetailPage = () => import('@/services/project/v1/pages/ProjectDetailPage.vue');
const ProjectDetailTabPage = () => import('@/services/project/v1/pages/ProjectDetailTabPage.vue');
const ProjectDashboardPage = () => import('@/services/project/v1/pages/ProjectDashboardPage.vue');
const ProjectSummaryPage = () => import('@/services/project/v1/pages/ProjectSummaryPage.vue');
const ProjectAlertPage = () => import('@/services/project/v1/pages/ProjectAlertPage.vue');
const ProjectAlertWebhookCreatePage = () => import('@/services/project/v1/pages/ProjectAlertWebhookCreatePage.vue');
const ProjectNotificationsPage = () => import('@/services/project/v1/pages/ProjectNotificationPage.vue');
const ProjectAlertEventRulePage = () => import('@/services/project/v1/pages/ProjectAlertEventRulePage.vue');
const ProjectNotificationAddPage = () => import('@/services/project/v1/pages/ProjectNotificationAddPage.vue');

const projectRoutes: RouteConfig = {
    path: 'project',
    meta: {
        menuId: MENU_ID.PROJECT,
        translationId: MENU_INFO_MAP[MENU_ID.PROJECT].translationId,
    },
    component: ProjectContainer,
    children: [
        {
            path: ':projectGroupId?',
            name: PROJECT_ROUTE_V1._NAME,
            meta: {
                menuId: MENU_ID.PROJECT,
                lsbVisible: true,
            },
            props: true,
            component: ProjectMainPage,
        },
        {
            path: 'detail/:id',
            name: PROJECT_ROUTE_V1.DETAIL._NAME,
            redirect: PROJECT_ROUTE_V1.DETAIL.TAB.SUMMARY._NAME,
            props: true,
            component: ProjectDetailPage,
            children: [
                {
                    path: '/',
                    name: PROJECT_ROUTE_V1.DETAIL.TAB._NAME,
                    redirect: PROJECT_ROUTE_V1.DETAIL.TAB.SUMMARY._NAME,
                    props: true,
                    component: ProjectDetailTabPage,
                    children: [
                        {
                            path: 'summary',
                            name: PROJECT_ROUTE_V1.DETAIL.TAB.SUMMARY._NAME,
                            meta: { lsbVisible: true },
                            props: true,
                            component: ProjectSummaryPage,
                        },
                        {
                            path: 'alert',
                            name: PROJECT_ROUTE_V1.DETAIL.TAB.ALERT._NAME,
                            meta: { lsbVisible: true },
                            props: true,
                            component: ProjectAlertPage,
                        },
                        {
                            path: 'notification',
                            name: PROJECT_ROUTE_V1.DETAIL.TAB.NOTIFICATIONS._NAME,
                            meta: { lsbVisible: true },
                            props: true,
                            component: ProjectNotificationsPage,
                        },
                        {
                            path: '*',
                            redirect: 'summary',
                        },
                        {
                            path: 'dashboard/:dashboardId',
                            name: PROJECT_ROUTE_V1.DETAIL.TAB.DASHBOARD._NAME,
                            meta: { lsbVisible: true },
                            props: true,
                            component: ProjectDashboardPage,
                        },
                    ],
                },
                {
                    path: 'event-rule',
                    name: PROJECT_ROUTE_V1.DETAIL.EVENT_RULE._NAME,
                    props: (route) => ({ projectId: route.params.id }),
                    meta: { lsbVisible: true },
                    component: ProjectAlertEventRulePage,
                },
                {
                    path: 'notification/:protocolId',
                    name: PROJECT_ROUTE_V1.DETAIL.TAB.NOTIFICATIONS.ADD._NAME,
                    meta: { lsbVisible: true },
                    component: ProjectNotificationAddPage,
                    props: true,
                },
                {
                    path: 'webhook/create',
                    name: PROJECT_ROUTE_V1.DETAIL.TAB.ALERT.WEBHOOK.CREATE._NAME,
                    meta: { centeredLayout: true },
                    component: ProjectAlertWebhookCreatePage,
                },
            ],
        },
    ],
};

export default projectRoutes;
