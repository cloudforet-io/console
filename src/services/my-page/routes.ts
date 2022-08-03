import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';

import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';

const MyPageContainer = () => import(/* webpackChunkName: "MyPageContainer" */'@/services/my-page/MyPageContainer.vue');

const UserAccountPage = () => import(/* webpackChunkName: "UserAccountPage" */ '@/services/my-page/my-account/user-account/UserAccountPage.vue');
const UserAPIKeyPage = () => import(/* webpackChunkName: "UserAPIKeyPage" */ '@/services/my-page/my-account/user-api-key/UserAPIKeyPage.vue');
const UserNotificationPage = () => import(/* webpackChunkName: "UserNotificationPage" */ '@/services/my-page/my-account/user-notification/UserNotificationPage.vue');
const NotificationAddPage = () => import(/* webpackChunkName: "NotificationAddPage" */ '@/services/notification/notification-add/NotificationAddPage.vue');
const NoticePage = () => import(/* webpackChunkName: "NoticePage" */ '@/services/my-page/notice/NoticePage.vue');
const NoticeDetailPage = () => import(/* webpackChunkName: "NoticeDetailPage" */ '@/services/my-page/notice/notice-detail/NoticeDetailPage.vue');
const NoticeCreatePage = () => import(/* webpackChunkName: "NoticeCreatePage" */ '@/services/my-page/notice/notice-create/NoticeCreatePage.vue');
const NoticeUpdatePage = () => import(/* webpackChunkName: "NoticeUpdatePage" */ '@/services/my-page/notice/notice-update/NoticeUpdatePage.vue');

// eslint-disable-next-line max-len
// const ManageUserNotificationPage = () => import(/* webpackChunkName: "ManageUserNotificationPage" */ '@/services/administration/iam/user/manage-user-notification/ManageUserNotificationPage.vue');

const myPageRoutes: RouteConfig = {
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
                    component: UserAccountPage,
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
                            path: '/',
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
                            path: ':protocol/:protocolId/:userId',
                            name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION.ADD._NAME,
                            meta: { translationId: 'MY_PAGE.NOTIFICATION.ADD_CHANNEL' },
                            props: true,
                            component: NotificationAddPage as any,
                        },
                    ],
                },
            ],
        },
        {
            path: 'info',
            name: MY_PAGE_ROUTE.INFO._NAME,
            meta: { menuId: MENU_ID.MY_PAGE_INFO },
            redirect: () => getRedirectRouteByPagePermission(MENU_ID.MY_PAGE_INFO, store.getters['user/pagePermissionMap']),
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'notice',
                    meta: {
                        lnbVisible: true,
                        menuId: MENU_ID.MY_PAGE_NOTICE,
                    },
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '/',
                            name: MY_PAGE_ROUTE.INFO.NOTICE._NAME,
                            meta: { lnbVisible: true, accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
                            component: NoticePage as any,
                        },
                        {
                            path: 'create',
                            name: MY_PAGE_ROUTE.INFO.NOTICE.CREATE._NAME,
                            // song-lang
                            meta: { lnbVisible: true, accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION },
                            component: NoticeCreatePage as any,
                        },
                        {
                            path: 'update',
                            name: MY_PAGE_ROUTE.INFO.NOTICE.UPDATE._NAME,
                            // song-lang
                            meta: { lnbVisible: true, accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION },
                            component: NoticeUpdatePage as any,
                        },
                        {
                            path: 'detail',
                            name: MY_PAGE_ROUTE.INFO.NOTICE.DETAIL._NAME,
                            // song-lang
                            meta: { lnbVisible: true, accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
                            component: NoticeDetailPage as any,
                        },
                    ],
                },
            ],
        },
    ],
};

export default myPageRoutes;
