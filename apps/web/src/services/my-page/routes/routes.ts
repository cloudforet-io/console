import type { RouteConfig } from 'vue-router';

import { ROUTE_SCOPE } from '@/router/constant';

import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';

const MyPageContainer = () => import('@/services/my-page/MyPageContainer.vue');

const UserAccountPage = () => import('@/services/my-page/pages/UserAccountPage.vue');
const UserNotificationPage = () => import('@/services/my-page/pages/UserNotificationPage.vue');
const UserNotificationAddPage = () => import('@/services/my-page/pages/UserNotificationAddPage.vue');


const myPageRoutes: RouteConfig = {
    path: '/my-page',
    name: MY_PAGE_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.MY_PAGE,
        translationId: MENU_INFO_MAP[MENU_ID.MY_PAGE].translationId,
        scope: ROUTE_SCOPE.USER,
    },
    redirect: (to) => getRedirectRouteByPagePermission(to),
    component: MyPageContainer,
    children: [
        {
            path: 'profile',
            name: MY_PAGE_ROUTE.ACCOUNT_PROFILE._NAME,
            meta: {
                menuId: MENU_ID.ACCOUNT_PROFILE,
                translationId: MENU_INFO_MAP[MENU_ID.ACCOUNT_PROFILE].translationId,
            },
            component: UserAccountPage as any,
        },
        {
            path: 'notification',
            meta: {
                menuId: MENU_ID.NOTIFICATIONS,
                translationId: MENU_INFO_MAP[MENU_ID.NOTIFICATIONS].translationId,
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: MY_PAGE_ROUTE.NOTIFICATION._NAME,
                    component: UserNotificationPage as any,
                },
                {
                    path: ':protocolId',
                    name: MY_PAGE_ROUTE.NOTIFICATION.ADD._NAME,
                    meta: {
                        translationId: 'MY_PAGE.NOTIFICATION.ADD_CHANNEL',
                    },
                    props: true,
                    component: UserNotificationAddPage as any,
                },
            ],
        },
    ],
};

export default myPageRoutes;
