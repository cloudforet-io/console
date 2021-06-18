import { RouteConfig } from 'vue-router';

const UserAccount = () => import(/* webpackChunkName: "UserAccount" */ '@/views/identity/user/pages/UserAccountPage.vue');
const UserAPIKeyPage = () => import(/* webpackChunkName: "UserAPIKey" */ '@/views/identity/user/pages/APIKeyPage.vue');
const UserNotificationPage = () => import(/* webpackChunkName: "UserNotificationPage" */ '@/views/identity/user/pages/NotificationPage.vue');
const AddNotificationPage = () => import(/* webpackChunkName: "AddNotificationPage" */ '@/views/identity/user/pages/AddNotificationPage.vue');
const ManageNotificationPage = () => import(/* webpackChunkName: "ManageNotificationPage" */ '@/views/identity/user/pages/ManageNotificationPage.vue');
const UserManagement = () => import(/* webpackChunkName: "UserManagement" */ '@/views/identity/user/pages/UserManagementPage.vue');
const UserPage = () => import(/* webpackChunkName: "User" */ '@/views/identity/user/pages/UserPage.vue');
const ServiceAccount = () => import(/* webpackChunkName: "ServiceAccount" */ '@/views/identity/service-account/pages/ServiceAccountPage.vue');
const AddServiceAccountPage = () => import(/* webpackChunkName: "AddServiceAccount" */ '@/views/identity/service-account/pages/AddServiceAccountPage.vue');
const ServiceAccountSearchPage = () => import(/* webpackChunkName: "ServiceAccountSearchPage" */ '@/views/identity/service-account/pages/ServiceAccountSearchPage.vue');
const NoResource = () => import(/* webpackChunkName: "NoResource" */ '@/common/pages/NoResource.vue');

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
                    component: ServiceAccount,
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
                    component: AddServiceAccountPage,
                },
                {
                    path: 'no-resource',
                    name: IDENTITY_ROUTE.SERVICE_ACCOUNT.NO_RESOURCE._NAME,
                    component: NoResource,
                },
            ],
        },
        {
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
                            component: UserManagement,
                        },
                        {
                            path: 'account',
                            name: IDENTITY_ROUTE.USER.ACCOUNT._NAME,
                            component: UserAccount,
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
                {
                    path: 'notification/:userId',
                    name: IDENTITY_ROUTE.USER.NOTIFICATION.MANAGE._NAME,
                    component: ManageNotificationPage,
                    props: true,
                },
                {
                    path: 'notification/:protocol/:protocolId/:userId',
                    name: IDENTITY_ROUTE.USER.NOTIFICATION.ADD._NAME,
                    component: AddNotificationPage,
                    props: true,
                },
            ],
        },
    ],
} as RouteConfig;
