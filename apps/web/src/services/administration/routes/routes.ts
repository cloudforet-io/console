import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';

import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';

const AdministrationContainer = () => import('@/services/administration/AdministrationContainer.vue');

const UserPage = () => import('@/services/administration/pages/UserPage.vue');

const administrationRoutes: RouteConfig = {
    path: 'administration',
    name: ADMINISTRATION_ROUTE._NAME,
    meta: { menuId: MENU_ID.ADMINISTRATION, accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
    redirect: (to) => getRedirectRouteByPagePermission(to, store.getters['user/pagePermissionMap']),
    component: AdministrationContainer,
    children: [
        {
            path: 'iam',
            name: ADMINISTRATION_ROUTE.IAM._NAME,
            meta: { menuId: MENU_ID.IAM },
            redirect: (to) => getRedirectRouteByPagePermission(to, store.getters['user/pagePermissionMap']),
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'user',
                    name: ADMINISTRATION_ROUTE.IAM.USER._NAME,
                    meta: { lnbVisible: true, menuId: MENU_ID.USER },
                    component: UserPage as any,
                },
            ],
        },
    ],
};
export default administrationRoutes;
