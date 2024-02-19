import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { IAM_ROUTE } from '@/services/iam/routes/route-constant';

const IamContainer = () => import('@/services/iam/IamContainer.vue');

const UserMainPage = () => import('@/services/iam/pages/UserMainPage.vue');
const AppMainPage = () => import('@/services/iam/pages/AppMainPage.vue');
const RolePage = () => import('@/services/iam/pages/admin/AdminRolePage.vue');
const RoleCreatePage = () => import('@/services/iam/pages/admin/AdminRoleCreatePage.vue');
const RoleUpdatePage = () => import('@/services/iam/pages/admin/AdminRoleUpdatePage.vue');

const adminIamRoutes: RouteConfig = {
    path: 'iam',
    name: makeAdminRouteName(IAM_ROUTE._NAME),
    meta: {
        menuId: MENU_ID.IAM,
        translationId: MENU_INFO_MAP[MENU_ID.IAM].translationId,
    },
    redirect: () => ({
        name: makeAdminRouteName(IAM_ROUTE.USER._NAME),
    }),
    component: IamContainer,
    children: [
        {
            path: 'user',
            name: makeAdminRouteName(IAM_ROUTE.USER._NAME),
            meta: {
                lnbVisible: true,
                menuId: MENU_ID.USER,
                translationId: MENU_INFO_MAP[MENU_ID.USER].translationId,
            },
            component: UserMainPage as any,
        },
        {
            path: 'app',
            name: makeAdminRouteName(IAM_ROUTE.APP._NAME),
            meta: {
                lnbVisible: true,
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
                    name: makeAdminRouteName(IAM_ROUTE.ROLE._NAME),
                    meta: { lnbVisible: true },
                    props: true,
                    component: RolePage,
                },
                {
                    path: 'create',
                    name: makeAdminRouteName(IAM_ROUTE.ROLE.CREATE._NAME),
                    meta: { translationId: 'IAM.ROLE.FORM.CREATE_TITLE' },
                    component: RoleCreatePage,
                },
                {
                    path: 'edit/:id',
                    name: makeAdminRouteName(IAM_ROUTE.ROLE.EDIT._NAME),
                    meta: { translationId: 'IAM.ROLE.FORM.EDIT_TITLE' },
                    props: true,
                    component: RoleUpdatePage,
                },
            ],
        },
    ],
};
export default adminIamRoutes;
