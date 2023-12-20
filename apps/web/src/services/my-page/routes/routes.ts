import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';

import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';

const MyPageContainer = () => import('@/services/my-page/MyPageContainer.vue');

const UserAccountPage = () => import('@/services/my-page/pages/UserAccountPage.vue');
const UserNotificationPage = () => import('@/services/my-page/pages/UserNotificationPage.vue');
const UserNotificationAddPage = () => import('@/services/my-page/pages/UserNotificationAddPage.vue');

// eslint-disable-next-line max-len
// const UserManageNotificationPage = () => import('@/services/administration/iam/user/user-manage-notification/UserManageNotificationPage.vue');

const myPageRoutes: RouteConfig = {
    path: '/my-page',
    name: MY_PAGE_ROUTE._NAME,
    meta: { menuId: MENU_ID.MY_PAGE, accessLevel: ACCESS_LEVEL.AUTHENTICATED },
    redirect: (to) => getRedirectRouteByPagePermission(to, store.getters['user/pageAccessPermissionMap']),
    component: MyPageContainer,
    children: [
        {
            path: 'account',
            name: MY_PAGE_ROUTE.MY_ACCOUNT._NAME,
            meta: { menuId: MENU_ID.ACCOUNT },
            redirect: (to) => getRedirectRouteByPagePermission(to, store.getters['user/pageAccessPermissionMap']),
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'profile',
                    name: MY_PAGE_ROUTE.MY_ACCOUNT.ACCOUNT_PROFILE._NAME,
                    meta: { lnbVisible: true, menuId: MENU_ID.ACCOUNT_PROFILE },
                    component: UserAccountPage as any,
                },
                {
                    path: 'notification',
                    meta: { lnbVisible: true, menuId: MENU_ID.NOTIFICATIONS },
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '/',
                            name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION._NAME,
                            meta: { lnbVisible: true },
                            component: UserNotificationPage as any,
                        },
                        {
                            path: ':protocol/:protocolId/:userId',
                            name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION.ADD._NAME,
                            meta: { translationId: 'MY_PAGE.NOTIFICATION.ADD_CHANNEL' },
                            props: true,
                            component: UserNotificationAddPage as any,
                        },
                    ],
                },
            ],
        },
    ],
};

export default myPageRoutes;
