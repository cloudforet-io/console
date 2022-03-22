import { RouteConfig } from 'vue-router';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

const UserManagementPage = () => import(/* webpackChunkName: "UserManagementPage" */ '@/services/administration/iam/user/user-management/UserManagementPage.vue');
const UserPage = () => import(/* webpackChunkName: "User" */ '@/services/administration/iam/user/UserPage.vue');

export const userRoute = {
    path: 'iam',
    name: ADMINISTRATION_ROUTE.IAM._NAME,
    meta: { label: 'IAM' },
    redirect: '/administration/iam/user',
    component: UserPage,
    children: [
        {
            path: 'user',
            name: ADMINISTRATION_ROUTE.IAM.USER._NAME,
            component: UserManagementPage,
        },
    ],
} as RouteConfig;

export default {
    path: 'administration',
    name: ADMINISTRATION_ROUTE._NAME,
    redirect: '/administration/iam/user',
    meta: { label: 'Administration' },
    component: { template: '<router-view />' },
    children: [
        userRoute,
    ],
} as RouteConfig;
