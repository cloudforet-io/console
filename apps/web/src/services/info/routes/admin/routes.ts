import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { MENU_ID } from '@/lib/menu/config';

import { INFO_ROUTE } from '@/services/info/routes/route-constant';

const InfoContainer = () => import('@/services/info/InfoContainer.vue');

const AdminNoticeMainPage = () => import('@/services/info/pages/admin/AdminNoticeMainPage.vue');
const AdminNoticeDetailPage = () => import('@/services/info/pages/admin/AdminNoticeDetailPage.vue');
const AdminNoticeCreatePage = () => import('@/services/info/pages/admin/AdminNoticeCreatePage.vue');
const AdminNoticeUpdatePage = () => import('@/services/info/pages/admin/AdminNoticeUpdatePage.vue');

const infoRoute: RouteConfig = {
    path: 'info',
    name: makeAdminRouteName(INFO_ROUTE._NAME),
    meta: { menuId: MENU_ID.INFO, accessLevel: ACCESS_LEVEL.ADMIN_PERMISSION },
    redirect: makeAdminRouteName(INFO_ROUTE.NOTICE._NAME),
    component: InfoContainer,
    children: [
        {
            path: 'notice',
            meta: { lnbVisible: true, menuId: MENU_ID.NOTICE },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: makeAdminRouteName(INFO_ROUTE.NOTICE._NAME),
                    meta: { lnbVisible: true, menuId: MENU_ID.NOTICE },
                    component: AdminNoticeMainPage as any,
                },
                {
                    path: 'create',
                    name: makeAdminRouteName(INFO_ROUTE.NOTICE.CREATE._NAME),
                    meta: { translationId: 'INFO.NOTICE.FORM.CREATE_NOTICE', lnbVisible: true },
                    component: AdminNoticeCreatePage as any,
                },
                {
                    path: 'update/:boardId/:postId',
                    name: makeAdminRouteName(INFO_ROUTE.NOTICE.UPDATE._NAME),
                    meta: { translationId: 'INFO.NOTICE.FORM.EDIT_TITLE', lnbVisible: true },
                    component: AdminNoticeUpdatePage as any,
                    props: true,
                },
                {
                    path: ':postId',
                    name: makeAdminRouteName(INFO_ROUTE.NOTICE.DETAIL._NAME),
                    meta: {
                        translationId: 'INFO.NOTICE.DETAIL.DETAIL_TITLE', lnbVisible: true, label: ({ params }) => params.id, copiable: true,
                    },
                    component: AdminNoticeDetailPage as any,
                    props: true,
                },
            ],
        },
    ],
};

export default infoRoute;
