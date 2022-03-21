import { RouteConfig } from 'vue-router';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';

const MyAccountPage = () => import(/* webpackChunkName: "MyAccountPage" */'@/services/my-page/my-account/MyAccountPage.vue');
const UserAccountPage = () => import(/* webpackChunkName: "UserAccountPage" */ '@/services/my-page/my-account/user-account/UserAccountPage.vue');
const UserAPIKeyPage = () => import(/* webpackChunkName: "UserAPIKeyPage" */ '@/services/my-page/my-account/user-api-key/UserAPIKeyPage.vue');
const UserNotificationPage = () => import(/* webpackChunkName: "UserNotificationPage" */ '@/services/my-page/my-account/user-notification/UserNotificationPage.vue');
const NotificationAddPage = () => import(/* webpackChunkName: "NotificationAddPage" */ '@/services/notification/notification-add/NotificationAddPage.vue');
// eslint-disable-next-line max-len
const ManageUserNotificationPage = () => import(/* webpackChunkName: "ManageUserNotificationPage" */ '@/services/administration/iam/user/user-management/manage-user-notification/ManageUserNotificationPage.vue');

export default {
    path: 'my-page',
    name: MY_PAGE_ROUTE._NAME,
    redirect: '/my-page/account',
    meta: { label: 'My Page' },
    component: { template: '<router-view />' },
    children: [
        {
            path: '/',
            name: MY_PAGE_ROUTE.MY_ACCOUNT._NAME,
            component: MyAccountPage,
            children: [
                {
                    path: 'account',
                    name: MY_PAGE_ROUTE.MY_ACCOUNT.ACCOUNT._NAME,
                    meta: { isVerticalLayout: true },
                    component: UserAccountPage,
                },
                {
                    path: 'api-key',
                    name: MY_PAGE_ROUTE.MY_ACCOUNT.API_KEY._NAME,
                    meta: { isVerticalLayout: true },
                    component: UserAPIKeyPage,
                },
                {
                    path: 'notification',
                    name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION._NAME,
                    meta: { isVerticalLayout: true },
                    component: UserNotificationPage,
                },
                {
                    path: 'notification/:userId',
                    name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION.MANAGE._NAME,
                    component: ManageUserNotificationPage,
                    props: true,
                },
                {
                    path: 'notification/:protocol/:protocolId/:userId',
                    name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION.ADD._NAME,
                    component: NotificationAddPage,
                    props: true,
                },
            ],
        },
    ],
} as RouteConfig;
