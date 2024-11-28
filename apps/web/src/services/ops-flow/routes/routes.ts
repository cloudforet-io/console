import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';

const OpsFlowContainer = () => import('@/services/ops-flow/OpsFlowContainer.vue');

const OpsFlowLandingPage = () => import('@/services/ops-flow/pages/OpsFlowLandingPage.vue');
const BoardPage = () => import('@/services/ops-flow/pages/BoardPage.vue');
const TaskDetailPage = () => import('@/services/ops-flow/pages/TaskDetailPage.vue');
const TaskCreatePage = () => import('@/services/ops-flow/pages/TaskCreatePage.vue');

const opsFlowRoutes: RouteConfig = {
    path: 'ops-flow',
    name: OPS_FLOW_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.OPS_FLOW,
        translationId: MENU_INFO_MAP[MENU_ID.OPS_FLOW].translationId,
    },
    redirect: (to) => getRedirectRouteByPagePermission(to, store.getters['user/pageAccessPermissionMap']),
    component: OpsFlowContainer,
    children: [
        {
            path: 'landing',
            name: OPS_FLOW_ROUTE.LANDING._NAME,
            meta: {
                menuId: MENU_ID.OPS_FLOW_LANDING,
                translationId: MENU_INFO_MAP[MENU_ID.OPS_FLOW_LANDING].translationId,
            },
            component: OpsFlowLandingPage as any,
        },
        {
            path: 'board:categoryId?',
            name: OPS_FLOW_ROUTE.BOARD._NAME,
            props: true,
            meta: {
                menuId: MENU_ID.BOARD,
                translationId: MENU_INFO_MAP[MENU_ID.BOARD].translationId,
                lsbVisible: true,
            },
            component: BoardPage as any,
            children: [
                {
                    path: ':taskId',
                    name: OPS_FLOW_ROUTE.BOARD.TASK_DETAIL._NAME,
                    props: true,
                    component: TaskDetailPage as any,
                },
                {
                    path: 'task-create',
                    name: OPS_FLOW_ROUTE.BOARD.TASK_CREATE._NAME,
                    component: TaskCreatePage as any,
                },
            ],
        },
    ],
};

export default opsFlowRoutes;
