import type { RouteRecordRaw } from 'vue-router';

import { store } from '@/store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';

import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

const AdministrationContainer = () => import('@/services/administration/AdministrationContainer.vue');

const UserPage = () => import('@/services/administration/iam/user/UserPage.vue');
const RolePage = () => import('@/services/administration/iam/role/RolePage.vue');
const RoleCreatePage = () => import('@/services/administration/iam/role/role-create/RoleCreatePage.vue');
const RoleUpdatePage = () => import('@/services/administration/iam/role/role-update/RoleUpdatePage.vue');
const PolicyPage = () => import('@/services/administration/iam/policy/PolicyPage.vue');
const PolicyCreatePage = () => import('@/services/administration/iam/policy/policy-create/PolicyCreatePage.vue');
const PolicyDetailPage = () => import('@/services/administration/iam/policy/policy-detail/PolicyDetailPage.vue');
// TODO: provider 부분이 1.10.2 스프린트에서 제외되어 주석 처리
// const ProviderPage = () => import('@/services/administration/additional-settings/provider/ProviderPage.vue');
// const ProviderAddPage = () => import('@/services/administration/additional-settings/provider/provider-add/ProviderAddPage.vue');

const administrationRoutes: RouteRecordRaw = {
    path: 'administration',
    name: ADMINISTRATION_ROUTE._NAME,
    meta: { menuId: MENU_ID.ADMINISTRATION, accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
    redirect: () => getRedirectRouteByPagePermission(MENU_ID.ADMINISTRATION, store.getters['user/pagePermissionMap']),
    component: AdministrationContainer,
    children: [
        {
            path: 'iam',
            name: ADMINISTRATION_ROUTE.IAM._NAME,
            meta: { menuId: MENU_ID.ADMINISTRATION_IAM },
            redirect: () => getRedirectRouteByPagePermission(MENU_ID.ADMINISTRATION_IAM, store.getters['user/pagePermissionMap']),
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'user',
                    name: ADMINISTRATION_ROUTE.IAM.USER._NAME,
                    meta: { lnbVisible: true, menuId: MENU_ID.ADMINISTRATION_USER },
                    component: UserPage as any,
                },
                {
                    path: 'role',
                    meta: { menuId: MENU_ID.ADMINISTRATION_ROLE },
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '',
                            name: ADMINISTRATION_ROUTE.IAM.ROLE._NAME,
                            meta: { lnbVisible: true },
                            props: true,
                            component: RolePage,
                        },
                        {
                            path: 'create',
                            name: ADMINISTRATION_ROUTE.IAM.ROLE.CREATE._NAME,
                            meta: { translationId: 'IAM.ROLE.FORM.CREATE_TITLE', accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION },
                            component: RoleCreatePage,
                        },
                        {
                            path: 'edit/:id',
                            name: ADMINISTRATION_ROUTE.IAM.ROLE.EDIT._NAME,
                            meta: { translationId: 'IAM.ROLE.FORM.EDIT_TITLE', accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION },
                            props: true,
                            component: RoleUpdatePage,
                        },
                    ],
                },
                {
                    path: 'policy',
                    meta: { menuId: MENU_ID.ADMINISTRATION_POLICY },
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '',
                            name: ADMINISTRATION_ROUTE.IAM.POLICY._NAME,
                            meta: { lnbVisible: true },
                            props: true,
                            component: PolicyPage,
                        },
                        {
                            path: 'create',
                            name: ADMINISTRATION_ROUTE.IAM.POLICY.CREATE._NAME,
                            meta: { lnbVisible: false, translationId: 'IAM.POLICY.FORM.CREATE_TITLE', accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION },
                            props: true,
                            component: PolicyCreatePage,
                        },
                        {
                            path: ':id?',
                            name: ADMINISTRATION_ROUTE.IAM.POLICY.DETAIL._NAME,
                            meta: { lnbVisible: true, label: ({ params }) => params.id, copiable: true },
                            props: true,
                            component: PolicyDetailPage,
                        },
                    ],
                },
            ],
        },
        // TODO: provider 부분이 1.10.2 스프린트에서 제외되어 주석 처리
        // {
        //     path: 'settings',
        //     name: ADMINISTRATION_ROUTE.SETTINGS._NAME,
        //     meta: { menuId: MENU_ID.ADMINISTRATION_SETTINGS },
        //     redirect: () => getRedirectRouteByPagePermission(MENU_ID.ADMINISTRATION_SETTINGS, store.getters['user/pagePermissionMap']),
        //     component: { template: '<router-view />' },
        //     children: [
        //         {
        //             path: 'provider',
        //             name: ADMINISTRATION_ROUTE.SETTINGS.PROVIDER._NAME,
        //             meta: { lnbVisible: true, menuId: MENU_ID.ADMINISTRATION_PROVIDER },
        //             component: { template: '<router-view/>' },
        //             children: [
        //                 {
        //                     path: '/',
        //                     name: ADMINISTRATION_ROUTE.SETTINGS.PROVIDER._NAME,
        //                     meta: { lnbVisible: true },
        //                     props: true,
        //                     component: ProviderPage,
        //                 },
        //                 {
        //                     path: 'add',
        //                     name: ADMINISTRATION_ROUTE.SETTINGS.PROVIDER.ADD._NAME,
        //                     // song-lang  => Add Provider
        //                     meta: { lnbVisible: false, translationId: 'Add Provider' }, // TODO: access level 확인 필요
        //                     props: true,
        //                     component: ProviderAddPage,
        //                 },
        //             ],
        //         },
        //
        //     ],
        // },
    ],
};
export default administrationRoutes;
