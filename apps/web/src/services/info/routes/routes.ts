import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';

import { INFO_ROUTE } from '@/services/info/routes/route-constant';

const InfoContainer = () => import('@/services/info/InfoContainer.vue');

const NoticeMainPage = () => import('@/services/info/pages/NoticeMainPage.vue');
const NoticeDetailPage = () => import('@/services/info/pages/NoticeDetailPage.vue');

const infoRoute: RouteConfig = {
    path: 'info',
    name: INFO_ROUTE._NAME,
    meta: { menuId: MENU_ID.INFO, accessLevel: ACCESS_LEVEL.WORKSPACE_PERMISSION },
    redirect: (to) => getRedirectRouteByPagePermission(to, store.getters['user/pageAccessPermissionMap']),
    component: InfoContainer,
    children: [
        {
            path: 'notice',
            meta: { lnbVisible: true, menuId: MENU_ID.NOTICE },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: INFO_ROUTE.NOTICE._NAME,
                    meta: { lnbVisible: true },
                    component: NoticeMainPage as any,
                },
                {
                    path: ':postId',
                    name: INFO_ROUTE.NOTICE.DETAIL._NAME,
                    meta: {
                        translationId: 'INFO.NOTICE.DETAIL.DETAIL_TITLE', lnbVisible: true, accessLevel: ACCESS_LEVEL.WORKSPACE_PERMISSION, label: ({ params }) => params.postId, copiable: true,
                    },
                    component: NoticeDetailPage as any,
                    props: true,
                },
            ],
        },
    ],
};

export default infoRoute;
