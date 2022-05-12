import { RouteConfig } from 'vue-router';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { getMenuLabel } from '@/lib/menu/menu-info';
import { MENU_ID } from '@/lib/menu/config';
import { ROUTE_ACCESS_LEVEL } from '@/lib/access-control';

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
    meta: { label: getMenuLabel(MENU_ID.ADMINISTRATION), accessLevel: ROUTE_ACCESS_LEVEL.VIEW_PERMISSION },
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
                            meta: { label: 'Create Role', accessLevel: ROUTE_ACCESS_LEVEL.MANAGE_PERMISSION },
                            component: RoleCreatePage,
                        },
                        {
                            path: 'edit/:id',
                            name: ADMINISTRATION_ROUTE.IAM.ROLE.EDIT._NAME,
                            meta: { label: 'Edit Role', accessLevel: ROUTE_ACCESS_LEVEL.MANAGE_PERMISSION },
                            props: true,
                            component: RoleEditPage,
                        },
                    ],
                },
                {
                    path: 'policy',
                    meta: { label: getMenuLabel(MENU_ID.ADMINISTRATION_POLICY) },
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
                            meta: { lnbVisible: false, accessLevel: ROUTE_ACCESS_LEVEL.MANAGE_PERMISSION },
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
