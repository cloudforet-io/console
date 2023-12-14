import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';

import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';

const AdministrationContainer = () => import('@/services/administration/AdministrationContainer.vue');

const UserPage = () => import('@/services/administration/pages/UserPage.vue');
const RolePage = () => import('@/services/administration/pages/admin/RolePage.vue');
const RoleCreatePage = () => import('@/services/administration/pages/admin/RoleCreatePage.vue');
const RoleUpdatePage = () => import('@/services/administration/pages/admin/RoleUpdatePage.vue');

const DomainSettingsPage = () => import('@/services/administration/pages/admin/AdminDomainSettingsPage.vue');

const adminAdministrationRoutes: RouteConfig = {
    path: 'administration',
    name: makeAdminRouteName(ADMINISTRATION_ROUTE._NAME),
    meta: { menuId: MENU_ID.ADMINISTRATION },
    redirect: () => ({
        name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM._NAME),
    }),
    component: AdministrationContainer,
    children: [
        {
            path: 'iam',
            name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM._NAME),
            meta: { menuId: MENU_ID.IAM },
            redirect: () => ({
                name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.USER._NAME),
            }),
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'user',
                    name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.USER._NAME),
                    meta: { lnbVisible: true, menuId: MENU_ID.USER },
                    component: UserPage as any,
                },
                {
                    path: 'role',
                    meta: { menuId: MENU_ID.ROLE },
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '/',
                            name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.ROLE._NAME),
                            meta: { lnbVisible: true },
                            props: true,
                            component: RolePage,
                        },
                        {
                            path: 'create',
                            name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.ROLE.CREATE._NAME),
                            meta: { translationId: 'IAM.ROLE.FORM.CREATE_TITLE' },
                            component: RoleCreatePage,
                        },
                        {
                            path: 'edit/:id',
                            name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.ROLE.EDIT._NAME),
                            meta: { translationId: 'IAM.ROLE.FORM.EDIT_TITLE' },
                            props: true,
                            component: RoleUpdatePage,
                        },
                    ],
                },
            ],
        },
        {
            path: 'preference',
            name: makeAdminRouteName(ADMINISTRATION_ROUTE.PREFERENCE._NAME),
            meta: { menuId: MENU_ID.PREFERENCE },
            redirect: () => ({
                name: makeAdminRouteName(ADMINISTRATION_ROUTE.PREFERENCE.DOMAIN_SETTINGS._NAME),
            }),
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'domain-settings',
                    name: makeAdminRouteName(ADMINISTRATION_ROUTE.PREFERENCE.DOMAIN_SETTINGS._NAME),
                    meta: { lnbVisible: true, menuId: MENU_ID.DOMAIN_SETTINGS },
                    component: DomainSettingsPage,
                },
                {
                    path: 'workspaces',
                    name: makeAdminRouteName(ADMINISTRATION_ROUTE.PREFERENCE.WORKSPACES._NAME),
                    meta: { lnbVisible: true, menuId: MENU_ID.WORKSPACES },
                    component: { template: '<router-view />' },
                },
            ],
        },
    ],
};
export default adminAdministrationRoutes;
