import type { RouteConfig } from 'vue-router';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ADMIN_IAM_ROUTE } from '@/services/iam/routes/admin/route-constant';

const IamContainer = () => import('@/services/iam/IamContainer.vue');

const UserMainPage = () => import('@/services/iam/pages/UserMainPage.vue');
const UserGroupMainPage = () => import('@/services/iam/pages/UserGroupMainPage.vue');
const AppMainPage = () => import('@/services/iam/pages/AppMainPage.vue');
const RolePage = () => import('@/services/iam/pages/admin/AdminRolePage.vue');
const RoleCreatePage = () => import('@/services/iam/pages/admin/AdminRoleCreatePage.vue');
const RoleUpdatePage = () => import('@/services/iam/pages/admin/AdminRoleUpdatePage.vue');

export const ADMIN_USER_GROUP_ROUTE = {
    path: 'user-group',
    name: ADMIN_IAM_ROUTE.USER_GROUP._NAME,
    meta: {
        menuId: MENU_ID.USER_GROUP,
        translationId: MENU_INFO_MAP[MENU_ID.USER_GROUP].translationId,
    },
    component: UserGroupMainPage as any,
} as const;

export const adminIamRoutesChildren = [
    {
        path: 'user',
        name: ADMIN_IAM_ROUTE.USER._NAME,
        meta: {
            menuId: MENU_ID.USER,
            translationId: MENU_INFO_MAP[MENU_ID.USER].translationId,
        },
        component: UserMainPage as any,
    },
    {
        path: 'user-group',
        name: ADMIN_IAM_ROUTE.USER_GROUP._NAME,
        meta: {
            menuId: MENU_ID.USER_GROUP,
            translationId: MENU_INFO_MAP[MENU_ID.USER_GROUP].translationId,
        },
        component: UserGroupMainPage as any,
    },
    {
        path: 'app',
        name: ADMIN_IAM_ROUTE.APP._NAME,
        meta: {
            menuId: MENU_ID.APP,
            translationId: MENU_INFO_MAP[MENU_ID.APP].translationId,
        },
        component: AppMainPage as any,
    },
    {
        path: 'role',
        meta: {
            menuId: MENU_ID.ROLE,
            translationId: MENU_INFO_MAP[MENU_ID.ROLE].translationId,
        },
        component: { template: '<router-view />' },
        children: [
            {
                path: '/',
                name: ADMIN_IAM_ROUTE.ROLE._NAME,
                props: true,
                component: RolePage,
            },
            {
                path: 'create',
                name: ADMIN_IAM_ROUTE.ROLE.CREATE._NAME,
                meta: { translationId: 'IAM.ROLE.FORM.CREATE_TITLE' },
                component: RoleCreatePage,
            },
            {
                path: 'edit/:id',
                name: ADMIN_IAM_ROUTE.ROLE.EDIT._NAME,
                meta: { translationId: 'IAM.ROLE.FORM.EDIT_TITLE' },
                props: true,
                component: RoleUpdatePage,
            },
        ],
    },
];

const adminIamRoutes: RouteConfig = {
    path: 'iam',
    name: ADMIN_IAM_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.IAM,
        translationId: MENU_INFO_MAP[MENU_ID.IAM].translationId,
    },
    redirect: () => ({
        name: ADMIN_IAM_ROUTE.USER._NAME,
    }),
    component: IamContainer,
    children: adminIamRoutesChildren,
};
export default adminIamRoutes;
