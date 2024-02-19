import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { IAM_ROUTE } from '@/services/iam/routes/route-constant';

const IamContainer = () => import('@/services/iam/IamContainer.vue');

const UserMainPage = () => import('@/services/iam/pages/UserMainPage.vue');
const AppMainPage = () => import('@/services/iam/pages/AppMainPage.vue');

const iamRoutes: RouteConfig = {
    path: 'iam',
    name: IAM_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.IAM,
        lnbVisible: true,
        translationId: MENU_INFO_MAP[MENU_ID.IAM].translationId,
    },
    redirect: (to) => getRedirectRouteByPagePermission(to, store.getters['user/pageAccessPermissionMap']),
    component: IamContainer,
    children: [
        {
            path: 'user',
            name: IAM_ROUTE.USER._NAME,
            meta: {
                lnbVisible: true,
                menuId: MENU_ID.USER,
                translationId: MENU_INFO_MAP[MENU_ID.USER].translationId,
            },
            component: UserMainPage as any,
        },
        {
            path: 'app',
            name: IAM_ROUTE.APP._NAME,
            meta: {
                lnbVisible: true,
                menuId: MENU_ID.APP,
                translationId: MENU_INFO_MAP[MENU_ID.APP].translationId,
            },
            component: AppMainPage as any,
        },
    ],
};
export default iamRoutes;
