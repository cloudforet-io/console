import type { RouteConfig } from 'vue-router';

import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';

import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { IAM_ROUTE } from '@/services/iam/routes/route-constant';

const IamContainer = () => import('@/services/iam/IamContainer.vue');

const UserMainPage = () => import('@/services/iam/pages/UserMainPage.vue');
const UserGroupMainPage = () => import('@/services/iam/pages/UserGroupMainPage.vue');
const AppMainPage = () => import('@/services/iam/pages/AppMainPage.vue');


const iamRoutes: RouteConfig = {
    path: 'iam',
    name: IAM_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.IAM,
        translationId: MENU_INFO_MAP[MENU_ID.IAM].translationId,
    },
    redirect: (to) => {
        const userStore = useUserStore(pinia);
        return getRedirectRouteByPagePermission(to, userStore.getters.pageAccessPermissionMap, userStore.getters.domainId);
    },
    component: IamContainer,
    children: [
        {
            path: 'user',
            name: IAM_ROUTE.USER._NAME,
            meta: {
                menuId: MENU_ID.USER,
                translationId: MENU_INFO_MAP[MENU_ID.USER].translationId,
            },
            component: UserMainPage as any,
        },
        {
            path: 'user-group',
            name: IAM_ROUTE.USER_GROUP._NAME,
            meta: {
                menuId: MENU_ID.USER_GROUP,
                translationId: MENU_INFO_MAP[MENU_ID.USER_GROUP].translationId,
            },
            component: UserGroupMainPage as any,
        },
        {
            path: 'app',
            name: IAM_ROUTE.APP._NAME,
            meta: {
                menuId: MENU_ID.APP,
                translationId: MENU_INFO_MAP[MENU_ID.APP].translationId,
            },
            component: AppMainPage as any,
        },
    ],
};
export default iamRoutes;
