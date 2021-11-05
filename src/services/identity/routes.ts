import { RouteConfig } from 'vue-router';

const UserAccountPage = () => import(/* webpackChunkName: "UserAccountPage" */ '@/services/identity/user/user-account/UserAccountPage.vue');
const UserAPIKeyPage = () => import(/* webpackChunkName: "UserAPIKeyPage" */ '@/services/identity/user/user-api-key/UserAPIKeyPage.vue');
const UserNotificationPage = () => import(/* webpackChunkName: "UserNotificationPage" */ '@/services/identity/user/user-notification/UserNotificationPage.vue');
const NotificationAddPage = () => import(/* webpackChunkName: "NotificationAddPage" */ '@/services/notification/notification-add/NotificationAddPage.vue');
// eslint-disable-next-line max-len
const ManageUserNotificationPage = () => import(/* webpackChunkName: "ManageUserNotificationPage" */ '@/services/identity/user/user-management/manage-user-notification/ManageUserNotificationPage.vue');
const UserManagementPage = () => import(/* webpackChunkName: "UserManagementPage" */ '@/services/identity/user/user-management/UserManagementPage.vue');
const UserPage = () => import(/* webpackChunkName: "User" */ '@/services/identity/user/UserPage.vue');
const ServiceAccountPage = () => import(/* webpackChunkName: "ServiceAccountPage" */ '@/services/identity/service-account/ServiceAccountPage.vue');
const ServiceAccountAddPage = () => import(/* webpackChunkName: "ServiceAccountAddPage" */ '@/services/identity/service-account/service-account-add/ServiceAccountAddPage.vue');
const ServiceAccountSearchPage = () => import(/* webpackChunkName: "ServiceAccountSearchPage" */ '@/services/identity/service-account/service-account-search/ServiceAccountSearchPage.vue');
const NoResourcePage = () => import(/* webpackChunkName: "NoResourcePage" */ '@/common/pages/NoResourcePage.vue');

export const IDENTITY_ROUTE = Object.freeze({
    _NAME: 'identity',
    SERVICE_ACCOUNT: {
        _NAME: 'serviceAccount',
        SEARCH: { _NAME: 'serviceAccountSearch' },
        ADD: { _NAME: 'addServiceAccount' },
        NO_RESOURCE: { _NAME: 'noServiceAccount' },
    },
    USER: {
        _NAME: 'user',
        MANAGEMENT: { _NAME: 'userManagement' },
        ACCOUNT: { _NAME: 'userAccount' },
        API_KEY: { _NAME: 'userAPIKey' },
        NOTIFICATION: {
            _NAME: 'userNotification',
            ADD: { _NAME: 'addNotification' },
            MANAGE: { _NAME: 'manageNotification' },
        },
    },
});

export const userRoute = {
    path: 'user',
    meta: {
        label: 'User',
    },
    component: { template: '<router-view />' },
    children: [
        {
            path: '/',
            name: IDENTITY_ROUTE.USER._NAME,
            component: UserPage,
            children: [
                {
                    path: 'user-management',
                    name: IDENTITY_ROUTE.USER.MANAGEMENT._NAME,
                    component: UserManagementPage,
                },
                {
                    path: 'account',
                    name: IDENTITY_ROUTE.USER.ACCOUNT._NAME,
                    component: UserAccountPage,
                },
                {
                    path: 'api-key',
                    name: IDENTITY_ROUTE.USER.API_KEY._NAME,
                    component: UserAPIKeyPage,
                },
                {
                    path: 'notification',
                    name: IDENTITY_ROUTE.USER.NOTIFICATION._NAME,
                    component: UserNotificationPage,
                },
            ],
        },
        // TO BE
        // pages outside of vertical page layout
        // {
        //     path: 'user-management/notification/:userId',
        //     name: IDENTITY_ROUTE.USER.MANAGEMENT._NAME,
        //     component: ManageUserNotificationPage,
        // },
        // {
        //     path: 'user-management/notification/:userId/:protocol/:protocolId',
        //     name: IDENTITY_ROUTE.USER.NOTIFICATION.ADD._NAME,
        //     component: NotificationAddPage,
        //     props: true,
        // },
        // {
        //     path: 'notification/:protocol/:protocolId',
        //     name: IDENTITY_ROUTE.USER.NOTIFICATION.ADD._NAME,
        //     component: NotificationAddPage,
        //     props: true,
        // },

        // AS IS
        {
            path: 'notification/:userId',
            name: IDENTITY_ROUTE.USER.NOTIFICATION.MANAGE._NAME,
            component: ManageUserNotificationPage,
            props: true,
        },
        {
            path: 'notification/:protocol/:protocolId/:userId',
            name: IDENTITY_ROUTE.USER.NOTIFICATION.ADD._NAME,
            component: NotificationAddPage,
            props: true,
        },
    ],
} as RouteConfig;

export default {
    path: 'identity',
    name: IDENTITY_ROUTE._NAME,
    redirect: '/identity/service-account',
    meta: { label: 'Identity' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'service-account',
            meta: {
                label: 'Service Account',
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: IDENTITY_ROUTE.SERVICE_ACCOUNT._NAME,
                    props: true,
                    component: ServiceAccountPage,
                },
                {
                    path: 'search/:id',
                    name: IDENTITY_ROUTE.SERVICE_ACCOUNT.SEARCH._NAME,
                    meta: {
                        label: 'search',
                    },
                    props: true,
                    component: ServiceAccountSearchPage,
                },
                {
                    path: 'add/:provider',
                    name: IDENTITY_ROUTE.SERVICE_ACCOUNT.ADD._NAME,
                    meta: { label: 'Add Service Account' },
                    props: true,
                    component: ServiceAccountAddPage,
                },
                {
                    path: 'no-resource',
                    name: IDENTITY_ROUTE.SERVICE_ACCOUNT.NO_RESOURCE._NAME,
                    component: NoResourcePage,
                },
            ],
        },
        userRoute,
    ],
} as RouteConfig;
