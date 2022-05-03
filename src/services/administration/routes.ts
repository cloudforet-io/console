import { RouteConfig } from 'vue-router';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { getMenuLabel } from '@/lib/menu/menu-info';
import { MENU_ID } from '@/lib/menu/config';

const AdministrationContainer = () => import(/* webpackChunkName: "AdministrationContainer" */ '@/services/administration/AdministrationContainer.vue');

const UserPage = () => import(/* webpackChunkName: "UserPage" */ '@/services/administration/iam/user/UserPage.vue');
const RolePage = () => import(/* webpackChunkName: "RolePage" */'@/services/administration/iam/role/RolePage.vue');
const RoleCreatePage = () => import(/* webpackChunkName: "RoleCreatePage" */'@/services/administration/iam/role/create-role/RoleCreatePage.vue');
const RoleEditPage = () => import(/* webpackChunkName: "RoleEditPage" */'@/services/administration/iam/role/edit-role/RoleEditPage.vue');
const PolicyPage = () => import(/* webpackChunkName: "PolicyPage" */ '@/services/administration/iam/policy/PolicyPage.vue');

const administrationRoutes: RouteConfig = {
    path: 'administration',
    name: ADMINISTRATION_ROUTE._NAME,
    meta: { label: getMenuLabel(MENU_ID.ADMINISTRATION) },
    redirect: '/administration/iam/user',
    component: AdministrationContainer,
    children: [
        {
            path: 'iam',
            name: ADMINISTRATION_ROUTE.IAM._NAME,
            meta: { label: getMenuLabel(MENU_ID.ADMINISTRATION_IAM) },
            redirect: '/administration/iam/user',
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'user',
                    name: ADMINISTRATION_ROUTE.IAM.USER._NAME,
                    meta: { lnbVisible: true, label: getMenuLabel(MENU_ID.ADMINISTRATION_USER) },
                    component: UserPage as any,
                },
                {
                    path: 'role',
                    meta: { label: getMenuLabel(MENU_ID.ADMINISTRATION_ROLE) },
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
                            meta: { label: 'Create Role' },
                            component: RoleCreatePage,
                        },
                        {
                            path: 'edit/:id',
                            name: ADMINISTRATION_ROUTE.IAM.ROLE.EDIT._NAME,
                            meta: { label: 'Edit Role' },
                            props: true,
                            component: RoleEditPage,
                        },
                    ],
                },
                {
                    path: 'policy',
                    name: ADMINISTRATION_ROUTE.IAM.POLICY._NAME,
                    meta: { lnbVisible: true, label: getMenuLabel(MENU_ID.ADMINISTRATION_POLICY) },
                    component: PolicyPage as any,
                },
            ],
        },
    ],
};
export default administrationRoutes;
