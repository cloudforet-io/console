import { RouteConfig } from 'vue-router';

const UserAccount = () => import(/* webpackChunkName: "UserAccount" */ '@/views/identity/user/modules/UserAccount.vue');
const UserManagement = () => import(/* webpackChunkName: "UserManagement" */ '@/views/identity/user/modules/UserManagement.vue');
const UserPage = () => import(/* webpackChunkName: "User" */ '@/views/identity/user/pages/UserPage.vue');
const ServiceAccount = () => import(/* webpackChunkName: "ServiceAccount" */ '@/views/identity/service-account/pages/ServiceAccountPage.vue');
const AddServiceAccountPage = () => import(/* webpackChunkName: "AddServiceAccount" */ '@/views/identity/service-account/pages/AddServiceAccountPage.vue');
const ServiceAccountSearchPage = () => import(/* webpackChunkName: "ServiceAccountSearchPage" */ '@/views/identity/service-account/pages/ServiceAccountSearchPage.vue');
const NoResource = () => import(/* webpackChunkName: "NoResource" */ '@/views/common/pages/NoResource.vue');

export default {
    path: 'identity',
    name: 'identity',
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
                    name: 'user',
                    component: UserPage,
                    children: [
                        {
                            path: 'user-management',
                            name: 'userManagement',
                            component: UserManagement,
                        },
                        {
                            path: 'account',
                            name: 'userAccount',
                            component: UserAccount,
                        },
                    ],
                },
            ],
        },
    ],
} as RouteConfig;
