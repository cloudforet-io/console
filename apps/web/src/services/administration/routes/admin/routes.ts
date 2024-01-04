import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';

const AdministrationContainer = () => import('@/services/administration/AdministrationContainer.vue');

const UserMainPage = () => import('@/services/administration/pages/UserMainPage.vue');
const AppMainPage = () => import('@/services/administration/pages/AppMainPage.vue');
const RolePage = () => import('@/services/administration/pages/admin/RolePage.vue');
const RoleCreatePage = () => import('@/services/administration/pages/admin/RoleCreatePage.vue');
const RoleUpdatePage = () => import('@/services/administration/pages/admin/RoleUpdatePage.vue');

const DomainSettingsPage = () => import('@/services/administration/pages/admin/AdminDomainSettingsPage.vue');

const WorkspacesPage = () => import('@/services/administration/pages/admin/AdminWorkspacesPage.vue');

const adminAdministrationRoutes: RouteConfig = {
    path: 'administration',
    name: makeAdminRouteName(ADMINISTRATION_ROUTE._NAME),
    meta: {
        menuId: MENU_ID.ADMINISTRATION,
        translationId: MENU_INFO_MAP[MENU_ID.ADMINISTRATION].translationId,
    },
    redirect: () => ({
        name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM._NAME),
    }),
    component: AdministrationContainer,
    children: [
        {
            path: 'iam',
            name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM._NAME),
            meta: {
                menuId: MENU_ID.IAM,
                translationId: MENU_INFO_MAP[MENU_ID.IAM].translationId,
            },
            redirect: () => ({
                name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.USER._NAME),
            }),
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'user',
                    name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.USER._NAME),
                    meta: {
                        lnbVisible: true,
                        menuId: MENU_ID.USER,
                        translationId: MENU_INFO_MAP[MENU_ID.USER].translationId,
                    },
                    component: UserMainPage as any,
                },
                {
                    path: 'app',
                    name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.APP._NAME),
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
            meta: {
                menuId: MENU_ID.PREFERENCE,
                translationId: MENU_INFO_MAP[MENU_ID.PREFERENCE].translationId,
            },
            redirect: () => ({
                name: makeAdminRouteName(ADMINISTRATION_ROUTE.PREFERENCE.DOMAIN_SETTINGS._NAME),
            }),
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'domain-settings',
                    name: makeAdminRouteName(ADMINISTRATION_ROUTE.PREFERENCE.DOMAIN_SETTINGS._NAME),
                    meta: {
                        lnbVisible: true,
                        menuId: MENU_ID.DOMAIN_SETTINGS,
                        translationId: MENU_INFO_MAP[MENU_ID.DOMAIN_SETTINGS].translationId,
                    },
                    component: DomainSettingsPage,
                },
                {
                    path: 'workspaces',
                    name: makeAdminRouteName(ADMINISTRATION_ROUTE.PREFERENCE.WORKSPACES._NAME),
                    meta: {
                        lnbVisible: true,
                        menuId: MENU_ID.WORKSPACES,
                        translationId: MENU_INFO_MAP[MENU_ID.WORKSPACES].translationId,
                    },
                    component: WorkspacesPage,
                },
            ],
        },
    ],
};
export default adminAdministrationRoutes;
