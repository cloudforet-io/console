import type { RouteRecordRaw } from 'vue-router';

import { store } from '@/store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';

import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';

const MyPageContainer = () => import('@/services/my-page/MyPageContainer.vue');

const UserAccountPage = () => import('@/services/my-page/my-account/user-account/UserAccountPage.vue');
const UserAPIKeyPage = () => import('@/services/my-page/my-account/user-api-key/UserAPIKeyPage.vue');
const UserNotificationPage = () => import('@/services/my-page/my-account/user-notification/UserNotificationPage.vue');
const NotificationAddPage = () => import('@/services/notification/notification-add/NotificationAddPage.vue');

// eslint-disable-next-line max-len
// const UserManageNotificationPage = () => import('@/services/administration/iam/user/user-manage-notification/UserManageNotificationPage.vue');

const myPageRoutes: RouteRecordRaw = {
    path: 'my-page',
    name: MY_PAGE_ROUTE._NAME,
    meta: { menuId: MENU_ID.MY_PAGE, accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
    redirect: () => getRedirectRouteByPagePermission(MENU_ID.MY_PAGE, store.getters['user/pagePermissionMap']),
    component: MyPageContainer,
    children: [
        {
            path: 'account',
            name: MY_PAGE_ROUTE.MY_ACCOUNT._NAME,
            meta: { menuId: MENU_ID.MY_PAGE_ACCOUNT },
            redirect: () => getRedirectRouteByPagePermission(MENU_ID.MY_PAGE_ACCOUNT, store.getters['user/pagePermissionMap']),
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'profile',
                    name: MY_PAGE_ROUTE.MY_ACCOUNT.ACCOUNT._NAME,
                    meta: { lnbVisible: true, menuId: MENU_ID.MY_PAGE_ACCOUNT_PROFILE },
                    component: UserAccountPage as any,
                },
                {
                    path: 'api-key',
                    name: MY_PAGE_ROUTE.MY_ACCOUNT.API_KEY._NAME,
                    meta: { lnbVisible: true, menuId: MENU_ID.MY_PAGE_API_KEY },
                    component: UserAPIKeyPage as any,
                },
                {
                    path: 'notification',
                    meta: { lnbVisible: true, menuId: MENU_ID.MY_PAGE_NOTIFICATIONS },
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '',
                            name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION._NAME,
                            meta: { lnbVisible: true },
                            component: UserNotificationPage as any,
                        },
                        // {
                        //     path: ':userId',
                        //     name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION.MANAGE._NAME,
                        //     meta: { label: ({ params }) => params.userId },
                        //     component: ManageUserNotificationPage as any,
                        //     props: true,
                        // },
                        {
                            path: '/:protocol/:protocolId/:userId',
                            name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION.ADD._NAME,
                            meta: { translationId: 'MY_PAGE.NOTIFICATION.ADD_CHANNEL' },
                            props: true,
                            component: NotificationAddPage as any,
                        },
                    ],
                },
            ],
        },
    ],
};

export default myPageRoutes;
