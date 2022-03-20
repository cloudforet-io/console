import { RouteConfig } from 'vue-router';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

const UserManagementPage = () => import(/* webpackChunkName: "UserManagementPage" */ '@/services/administration/iam/user/user-management/UserManagementPage.vue');
const UserPage = () => import(/* webpackChunkName: "User" */ '@/services/administration/iam/user/UserPage.vue');

export const userRoute = {
    path: 'user',
    meta: {
        label: 'User',
    },
    component: { template: '<router-view />' },
    children: [
        {
            path: '/',
            name: ADMINISTRATION_ROUTE.USER._NAME,
            component: UserPage,
            children: [
                {
                    path: 'user-management',
                    name: ADMINISTRATION_ROUTE.USER.MANAGEMENT._NAME,
                    component: UserManagementPage,
                },
            ],
        },
    ],
} as RouteConfig;

export default {
    path: 'administration',
    name: ADMINISTRATION_ROUTE._NAME,
    redirect: '/administration/iam/user',
    meta: { label: 'Identity' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'iam',
            meta: { label: 'IAM' },
            redirect: '/administration/iam/user',
            component: { template: '<router-view />' },
            children: [
                userRoute,
            ],
        },
    ],
} as RouteConfig;
