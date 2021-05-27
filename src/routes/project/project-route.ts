import { RouteConfig } from 'vue-router';

const ProjectPage = () => import(/* webpackChunkName: "ProjectPage" */ '@/views/project/project/pages/ProjectPage.vue');
const ProjectDetailPage = () => import(/* webpackChunkName: "ProjectDetailPage" */ '@/views/project/project/pages/ProjectDetailPage.vue');

const ProjectDashboardPage = () => import(/* webpackChunkName: "ProjectDashboardPage" */ '@/views/project/project/pages/ProjectDashboardPage.vue');
const ProjectMemberPage = () => import(/* webpackChunkName: "ProjectMemberPage" */ '@/views/project/project/pages/ProjectMemberPage.vue');
const ProjectAlertPage = () => import(/* webpackChunkName: "ProjectAlertPage" */ '@/views/project/project/pages/ProjectAlertPage.vue');
const ProjectNotificationsPage = () => import(/* webpackChunkName: "ProjectNotificationsPage" */ '@/views/project/project/pages/ProjectNotificationsPage.vue');
const ProjectMaintenanceWindowPage = () => import(/* webpackChunkName: "ProjectMaintenanceWindowPage" */ '@/views/project/project/pages/ProjectMaintenanceWindowPage.vue');
const ProjectTagPage = () => import(/* webpackChunkName: "ProjectTagPage" */ '@/views/project/project/pages/ProjectTagPage.vue');

export const PROJECT_ROUTE = Object.freeze({
    MAIN: 'projectMain',
    DETAIL: {
        MAIN: 'projectDetail',
        TAB: {
            SUMMARY: 'projectSummary',
            MEMBER: 'projectMember',
            ALERT: 'projectAlert',
            NOTIFICATIONS: 'projectNotifications',
            MAINTENANCE_WINDOW: 'projectMaintenanceWindow',
            TAG: 'projectTag',
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
            name: PROJECT_ROUTE.MAIN,
            props: true,
            component: ProjectPage,
        },
        {
            path: ':id',
            name: PROJECT_ROUTE.DETAIL.MAIN,
            redirect: ':id/summary',
            props: true,
            component: ProjectDetailPage,
            children: [
                {
                    path: 'summary',
                    name: PROJECT_ROUTE.DETAIL.TAB.SUMMARY,
                    props: true,
                    component: ProjectDashboardPage,
                },
                {
                    path: 'member',
                    name: PROJECT_ROUTE.DETAIL.TAB.MEMBER,
                    props: true,
                    component: ProjectMemberPage,
                },
                {
                    path: 'alert',
                    name: PROJECT_ROUTE.DETAIL.TAB.ALERT,
                    props: true,
                    component: ProjectAlertPage,
                },
                {
                    path: 'notifications',
                    name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS,
                    props: true,
                    component: ProjectNotificationsPage,
                },
                {
                    path: 'maintenance-window',
                    name: PROJECT_ROUTE.DETAIL.TAB.MAINTENANCE_WINDOW,
                    props: true,
                    component: ProjectMaintenanceWindowPage,
                },
                {
                    path: 'tag',
                    name: PROJECT_ROUTE.DETAIL.TAB.TAG,
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
