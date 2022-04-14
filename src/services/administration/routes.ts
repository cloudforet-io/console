import { RouteConfig } from 'vue-router';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

const AdministrationContainer = () => import(/* webpackChunkName: "AdministrationContainer" */ '@/services/administration/AdministrationContainer.vue');

const UserPage = () => import(/* webpackChunkName: "UserPage" */ '@/services/administration/iam/user/UserPage.vue');

export default {
    path: 'administration',
    name: ADMINISTRATION_ROUTE._NAME,
    redirect: '/administration/iam/user',
    component: AdministrationContainer,
    children: [
        {
            path: 'iam',
            name: ADMINISTRATION_ROUTE.IAM._NAME,
            redirect: '/administration/iam/user',
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'user',
                    name: ADMINISTRATION_ROUTE.IAM.USER._NAME,
                    meta: { lnbVisible: true },
                    component: UserPage,
                },
            ],
        },
    ],
} as RouteConfig;
