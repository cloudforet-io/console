import { RouteConfig } from 'vue-router';

const UserAccount = () => import(/* webpackChunkName: "UserAccount" */ '@/views/identity/user/pages/UserAccountPage.vue');
const UserAPIKeyPage = () => import(/* webpackChunkName: "UserAPIKey" */ '@/views/identity/user/pages/UserAPIKeyPage.vue');
const UserNotificationPage = () => import(/* webpackChunkName: "UserNotificationPage" */ '@/views/identity/user/pages/UserNotificationPage.vue');
const AddNotiChannelPage = () => import(/* webpackChunkName: "AddNotiChannelPage" */ '@/views/identity/user/pages/AddNotiChannelPage.vue');
const UserManagement = () => import(/* webpackChunkName: "UserManagement" */ '@/views/identity/user/pages/UserManagementPage.vue');
const UserPage = () => import(/* webpackChunkName: "User" */ '@/views/identity/user/pages/UserPage.vue');
const ServiceAccount = () => import(/* webpackChunkName: "ServiceAccount" */ '@/views/identity/service-account/pages/ServiceAccountPage.vue');
const AddServiceAccountPage = () => import(/* webpackChunkName: "AddServiceAccount" */ '@/views/identity/service-account/pages/AddServiceAccountPage.vue');
const ServiceAccountSearchPage = () => import(/* webpackChunkName: "ServiceAccountSearchPage" */ '@/views/identity/service-account/pages/ServiceAccountSearchPage.vue');
const NoResource = () => import(/* webpackChunkName: "NoResource" */ '@/common/pages/NoResource.vue');

export const IDENTITY_ROUTE = Object.freeze({
    MAIN: 'identity',
    SERVICE_ACCOUNT: {
        MAIN: 'serviceAccount',
        SEARCH: 'serviceAccountSearch',
        ADD: 'addServiceAccount',
        NO_RESOURCE: 'noServiceAccount',
    },
    USER: {
        MAIN: 'user',
        MANAGEMENT: 'userManagement',
        ACCOUNT: 'userAccount',
        API_KEY: 'userAPIKey',
        NOTIFICATION: 'userNotification',
        ADD_NOTIFICATION: 'addNotification',
    },
});

export default {
    path: 'identity',
    name: IDENTITY_ROUTE.MAIN,
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
                    name: 'serviceAccount',
                    props: true,
                    component: ServiceAccount,
                },
                {
                    path: 'search/:id',
                    name: 'serviceAccountSearch',
                    meta: {
                        label: 'search',
                    },
                    props: true,
                    component: ServiceAccountSearchPage,
                },
                {
                    path: 'add/:provider',
                    name: 'addServiceAccount',
                    meta: { label: 'Add Service Account' },
                    props: true,
                    component: AddServiceAccountPage,
                },
                {
                    path: 'no-resource',
                    name: 'noServiceAccount',
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
                    name: IDENTITY_ROUTE.USER.MAIN,
                    component: UserPage,
                    children: [
                        {
                            path: 'user-management',
                            name: IDENTITY_ROUTE.USER.MANAGEMENT,
                            component: UserManagement,
                        },
                        {
                            path: 'account',
                            name: IDENTITY_ROUTE.USER.ACCOUNT,
                            component: UserAccount,
                        },
                        {
                            path: 'api-key',
                            name: IDENTITY_ROUTE.USER.API_KEY,
                            component: UserAPIKeyPage,
                        },
                        {
                            path: 'notification',
                            name: IDENTITY_ROUTE.USER.NOTIFICATION,
                            component: UserNotificationPage,
                        },
                    ],
                },
                {
                    path: 'notification/:channel',
                    name: IDENTITY_ROUTE.USER.ADD_NOTIFICATION,
                    component: AddNotiChannelPage,
                },
            ],
        },
    ],
} as RouteConfig;
