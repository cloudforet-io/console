import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ITSM_ROUTE } from '@/services/itsm/routes/route-constant';

const ITSMContainer = () => import('@/services/itsm/ITSMContainer.vue');

const ITSMLandingPage = () => import('@/services/itsm/pages/ITSMLandingPage.vue');
const BoardPage = () => import('@/services/itsm/pages/BoardPage.vue');
const TaskDetailPage = () => import('@/services/itsm/pages/TaskDetailPage.vue');
const TaskCreatePage = () => import('@/services/itsm/pages/TaskCreatePage.vue');

const itsmRoutes: RouteConfig = {
    path: 'itsm',
    name: ITSM_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.ITSM,
        translationId: MENU_INFO_MAP[MENU_ID.ITSM].translationId,
    },
    redirect: (to) => getRedirectRouteByPagePermission(to, store.getters['user/pageAccessPermissionMap']),
    component: ITSMContainer,
    children: [
        {
            path: 'landing',
            name: ITSM_ROUTE.ITSM_LANDING._NAME,
            meta: {
                menuId: MENU_ID.ITSM_LANDING,
                translationId: MENU_INFO_MAP[MENU_ID.ITSM_LANDING].translationId,
            },
            component: ITSMLandingPage as any,
        },
        {
            path: 'board',
            name: ITSM_ROUTE.BOARD._NAME,
            meta: {
                menuId: MENU_ID.BOARD,
                translationId: MENU_INFO_MAP[MENU_ID.BOARD].translationId,
            },
            component: BoardPage as any,
            children: [
                {
                    path: ':taskId',
                    name: ITSM_ROUTE.BOARD.TASK_DETAIL._NAME,
                    props: true,
                    component: TaskDetailPage as any,
                },
                {
                    path: 'task-create',
                    name: ITSM_ROUTE.BOARD.TASK_CREATE._NAME,
                    component: TaskCreatePage as any,
                },
            ],
        },
    ],
};

export default itsmRoutes;
