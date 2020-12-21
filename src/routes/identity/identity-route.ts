import { RouteConfig } from 'vue-router';

const UserAccount = () => import('@/views/identity/user/modules/UserAccount.vue');
const UserManagement = () => import('@/views/identity/user/modules/UserManagement.vue');
const User = () => import('@/views/identity/user/pages/UserPage.vue');
const ServiceAccount = () => import('@/views/identity/service-account/pages/ServiceAccountPage.vue');
const AddServiceAccountPage = () => import('@/views/identity/service-account/pages/AddServiceAccountPage.vue');
const ServiceAccountSearchPage = () => import('@/views/identity/service-account/pages/ServiceAccountSearchPage.vue');
const NoResource = () => import('@/views/common/pages/NoResource.vue');

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
                    component: User,
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
                    ]
                },
            ],
        },
    ],
} as RouteConfig;
