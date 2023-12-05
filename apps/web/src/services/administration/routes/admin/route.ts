import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';

import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';

const AdministrationContainer = () => import('@/services/administration/AdministrationContainer.vue');

const UserPage = () => import('@/services/administration/pages/UserPage.vue');
const RolePage = () => import('@/services/administration/pages/RolePage.vue');
const RoleCreatePage = () => import('@/services/administration/pages/RoleCreatePage.vue');
const RoleUpdatePage = () => import('@/services/administration/pages/RoleUpdatePage.vue');
const PolicyPage = () => import('@/services/administration/pages/PolicyPage.vue');
const PolicyCreatePage = () => import('@/services/administration/pages/PolicyCreatePage.vue');
const PolicyDetailPage = () => import('@/services/administration/pages/PolicyDetailPage.vue');

const adminAdministrationRoutes: RouteConfig = {
    path: 'administration',
    name: makeAdminRouteName(ADMINISTRATION_ROUTE._NAME),
    meta: { menuId: MENU_ID.ADMINISTRATION },
    redirect: () => ({
        name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.USER._NAME),
    }),
    component: AdministrationContainer,
    children: [
        {
            path: 'iam',
            name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM._NAME),
            meta: { menuId: MENU_ID.IAM },
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
                {
                    path: 'policy',
                    meta: { menuId: MENU_ID.POLICY },
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '/',
                            name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.POLICY._NAME),
                            meta: { lnbVisible: true },
                            props: true,
                            component: PolicyPage,
                        },
                        {
                            path: 'create',
                            name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.POLICY.CREATE._NAME),
                            meta: { lnbVisible: false, translationId: 'IAM.POLICY.FORM.CREATE_TITLE' },
                            props: true,
                            component: PolicyCreatePage,
                        },
                        {
                            path: ':id?',
                            name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.POLICY.DETAIL._NAME),
                            meta: { lnbVisible: true, label: ({ params }) => params.id, copiable: true },
                            props: true,
                            component: PolicyDetailPage,
                        },
                    ],
                },
            ],
        },
        {
            path: 'preference',
            name: makeAdminRouteName(ADMINISTRATION_ROUTE.PREFERENCE._NAME),
            meta: { menuId: MENU_ID.PREFERENCE },
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'domain-settings',
                    name: makeAdminRouteName(ADMINISTRATION_ROUTE.PREFERENCE.DOMAIN_SETTINGS._NAME),
                    meta: { lnbVisible: true, menuId: MENU_ID.DOMAIN_SETTINGS },
                    component: { template: '<router-view />' },
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
