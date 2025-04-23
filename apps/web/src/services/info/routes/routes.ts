import type { RouteConfig } from 'vue-router';

import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { INFO_ROUTE } from '@/services/info/routes/route-constant';

const InfoContainer = () => import('@/services/info/InfoContainer.vue');

const NoticeMainPage = () => import('@/services/info/pages/NoticeMainPage.vue');
const NoticeDetailPage = () => import('@/services/info/pages/NoticeDetailPage.vue');


const infoRoutes: RouteConfig = {
    path: 'info',
    name: INFO_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.INFO,
        translationId: MENU_INFO_MAP[MENU_ID.INFO].translationId,
    },
    redirect: (to) => getRedirectRouteByPagePermission(to),
    component: InfoContainer,
    children: [
        {
            path: 'notice',
            meta: {
                menuId: MENU_ID.NOTICE,
                translationId: MENU_INFO_MAP[MENU_ID.NOTICE].translationId,
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: INFO_ROUTE.NOTICE._NAME,
                    component: NoticeMainPage as any,
                },
                {
                    path: ':postId',
                    name: INFO_ROUTE.NOTICE.DETAIL._NAME,
                    meta: {
                        translationId: 'INFO.NOTICE.DETAIL.DETAIL_TITLE', label: ({ params }) => params.postId, copiable: true,
                    },
                    component: NoticeDetailPage as any,
                    props: true,
                },
            ],
        },
    ],
};

export default infoRoutes;
