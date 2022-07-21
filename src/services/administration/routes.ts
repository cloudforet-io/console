import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { MENU_ID } from '@/lib/menu/config';

import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

const AdministrationContainer = () => import(/* webpackChunkName: "AdministrationContainer" */ '@/services/administration/AdministrationContainer.vue');

const UserPage = () => import(/* webpackChunkName: "UserPage" */ '@/services/administration/iam/user/UserPage.vue');
const RolePage = () => import(/* webpackChunkName: "RolePage" */'@/services/administration/iam/role/RolePage.vue');
const RoleCreatePage = () => import(/* webpackChunkName: "RoleCreatePage" */'@/services/administration/iam/role/update-role/RoleCreatePage.vue');
const RoleEditPage = () => import(/* webpackChunkName: "RoleEditPage" */'@/services/administration/iam/role/update-role/RoleEditPage.vue');
const PolicyPage = () => import(/* webpackChunkName: "PolicyPage" */ '@/services/administration/iam/policy/PolicyPage.vue');
const PolicyCreatePage = () => import(/* webpackChunkName: "PolicyPage" */ '@/services/administration/iam/policy/policy-create/PolicyCreatePage.vue');
const PolicyDetailPage = () => import(/* webpackChunkName: "PolicyDetailPage" */ '@/services/administration/iam/policy/policy-detail/PolicyDetailPage.vue');

const administrationRoutes: RouteConfig = {
    path: 'administration',
    name: ADMINISTRATION_ROUTE._NAME,
    meta: { menuId: MENU_ID.ADMINISTRATION, accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
    redirect: '/administration/iam',
    component: AdministrationContainer,
    children: [
        {
            path: 'iam',
            name: ADMINISTRATION_ROUTE.IAM._NAME,
            meta: { menuId: MENU_ID.ADMINISTRATION_IAM },
            redirect: () => {
                let routeName;
                const permissionMap = store.getters['user/pagePermissionMap'];
                const redirectList = [
                    ADMINISTRATION_ROUTE.IAM.USER._NAME,
                    ADMINISTRATION_ROUTE.IAM.ROLE._NAME,
                    ADMINISTRATION_ROUTE.IAM.POLICY._NAME,
                ];
                redirectList.some((page) => {
                    if (permissionMap[page]) routeName = page;
                    return permissionMap[page];
                });
                return { name: routeName };
            },
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
                            path: '/',
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
                            component: RoleEditPage,
                        },
                    ],
                },
                {
                    path: 'policy',
                    meta: { menuId: MENU_ID.ADMINISTRATION_POLICY },
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '/',
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
    ],
};
export default administrationRoutes;
