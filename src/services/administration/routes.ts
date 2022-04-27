import { RouteConfig } from 'vue-router';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { getMenuLabel } from '@/lib/menu/menu-info';
import { MENU_ID } from '@/lib/menu/config';

const AdministrationContainer = () => import(/* webpackChunkName: "AdministrationContainer" */ '@/services/administration/AdministrationContainer.vue');

const UserPage = () => import(/* webpackChunkName: "UserPage" */ '@/services/administration/iam/user/UserPage.vue');

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
            ],
        },
    ],
};
export default administrationRoutes;
