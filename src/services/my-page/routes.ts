import { RouteConfig } from 'vue-router';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';
import { getMenuLabel } from '@/lib/menu/menu-info';
import { MENU_ID } from '@/lib/menu/config';

const MyPageContainer = () => import(/* webpackChunkName: "MyPageContainer" */'@/services/my-page/MyPageContainer.vue');

const UserAccountPage = () => import(/* webpackChunkName: "UserAccountPage" */ '@/services/my-page/my-account/user-account/UserAccountPage.vue');
const UserAPIKeyPage = () => import(/* webpackChunkName: "UserAPIKeyPage" */ '@/services/my-page/my-account/user-api-key/UserAPIKeyPage.vue');
const UserNotificationPage = () => import(/* webpackChunkName: "UserNotificationPage" */ '@/services/my-page/my-account/user-notification/UserNotificationPage.vue');
const NotificationAddPage = () => import(/* webpackChunkName: "NotificationAddPage" */ '@/services/notification/notification-add/NotificationAddPage.vue');
// eslint-disable-next-line max-len
const ManageUserNotificationPage = () => import(/* webpackChunkName: "ManageUserNotificationPage" */ '@/services/administration/iam/user/manage-user-notification/ManageUserNotificationPage.vue');

const myPageRoutes: RouteConfig = {
    path: 'my-page',
    name: MY_PAGE_ROUTE._NAME,
    meta: { label: getMenuLabel(MENU_ID.MY_PAGE) },
    redirect: '/my-page/account',
    component: MyPageContainer,
    children: [
        {
            path: 'account',
            name: MY_PAGE_ROUTE.MY_ACCOUNT._NAME,
            meta: { label: getMenuLabel(MENU_ID.MY_PAGE_ACCOUNT) },
            redirect: '/my-page/account/profile',
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'profile',
                    name: MY_PAGE_ROUTE.MY_ACCOUNT.ACCOUNT._NAME,
                    meta: { lnbVisible: true, label: getMenuLabel(MENU_ID.MY_PAGE_ACCOUNT_PROFILE) },
                    component: UserAccountPage,
                },
                {
                    path: 'api-key',
                    name: MY_PAGE_ROUTE.MY_ACCOUNT.API_KEY._NAME,
                    meta: { lnbVisible: true, label: getMenuLabel(MENU_ID.MY_PAGE_API_KEY) },
                    component: UserAPIKeyPage as any,
                },
                {
                    path: 'notification',
                    meta: { lnbVisible: true, label: getMenuLabel(MENU_ID.MY_PAGE_NOTIFICATIONS) },
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '/',
                            name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION._NAME,
                            meta: { lnbVisible: true },
                            component: UserNotificationPage as any,
                        },
                        {
                            path: ':userId',
                            name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION.MANAGE._NAME,
                            meta: { label: ({ params }) => params.userId },
                            component: ManageUserNotificationPage as any,
                            props: true,
                        },
                        {
                            path: ':protocol/:protocolId/:userId',
                            name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION.ADD._NAME,
                            meta: { label: 'Add Notifications Channel' },
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
