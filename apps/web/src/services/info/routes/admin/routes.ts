import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { INFO_ROUTE } from '@/services/info/routes/route-constant';

const InfoContainer = () => import('@/services/info/InfoContainer.vue');

const AdminNoticeMainPage = () => import('@/services/info/pages/admin/AdminNoticeMainPage.vue');
const AdminNoticeDetailPage = () => import('@/services/info/pages/admin/AdminNoticeDetailPage.vue');
const AdminNoticeCreatePage = () => import('@/services/info/pages/admin/AdminNoticeCreatePage.vue');
const AdminNoticeUpdatePage = () => import('@/services/info/pages/admin/AdminNoticeUpdatePage.vue');

const infoRoute: RouteConfig = {
    path: 'info',
    name: makeAdminRouteName(INFO_ROUTE._NAME),
    meta: {
        menuId: MENU_ID.INFO,
        translationId: MENU_INFO_MAP[MENU_ID.INFO].translationId,
    },
    redirect: () => ({ name: makeAdminRouteName(INFO_ROUTE.NOTICE._NAME) }),
    component: InfoContainer,
    children: [
        {
            path: 'notice',
            meta: {
                menuId: MENU_ID.NOTICE,
                translationId: MENU_INFO_MAP[MENU_ID.NOTICE].translationId,
            },
            redirect: () => ({ name: makeAdminRouteName(INFO_ROUTE.NOTICE._NAME) }),
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: makeAdminRouteName(INFO_ROUTE.NOTICE._NAME),
                    component: AdminNoticeMainPage as any,
                },
                {
                    path: 'create',
                    name: makeAdminRouteName(INFO_ROUTE.NOTICE.CREATE._NAME),
                    meta: { translationId: 'INFO.NOTICE.FORM.CREATE_NOTICE' },
                    component: AdminNoticeCreatePage as any,
                },
                {
                    path: ':postId',
                    name: makeAdminRouteName(INFO_ROUTE.NOTICE.DETAIL._NAME),
                    meta: {
                        translationId: 'INFO.NOTICE.DETAIL.DETAIL_TITLE', label: ({ params }) => params.postId, copiable: true,
                    },
                    component: AdminNoticeDetailPage as any,
                    props: true,
                },
                {
                    path: 'update/:postId',
                    name: makeAdminRouteName(INFO_ROUTE.NOTICE.UPDATE._NAME),
                    meta: { translationId: 'INFO.NOTICE.FORM.EDIT_TITLE' },
                    component: AdminNoticeUpdatePage as any,
                    props: true,
                },
            ],
        },
    ],
};

export default infoRoute;
