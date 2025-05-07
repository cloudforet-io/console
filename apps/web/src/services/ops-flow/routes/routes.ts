import type { RouteConfig } from 'vue-router';

import { pinia } from '@/store/pinia';


import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskManagementTemplateStore } from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const OpsFlowContainer = () => import('@/services/ops-flow/OpsFlowContainer.vue');

const OpsFlowLandingPage = () => import('@/services/ops-flow/pages/OpsFlowLandingPage.vue');
const BoardPage = () => import('@/services/ops-flow/pages/BoardPage.vue');
const TaskDetailPage = () => import('@/services/ops-flow/pages/TaskDetailPage.vue');
const TaskCreatePage = () => import('@/services/ops-flow/pages/TaskCreatePage.vue');

const taskManagementTemplateStore = useTaskManagementTemplateStore(pinia);
const opsFlowRoutes: RouteConfig = {
    path: 'ops-flow',
    name: OPS_FLOW_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.OPS_FLOW,
        translationId: MENU_INFO_MAP[MENU_ID.OPS_FLOW].translationId,
    },
    redirect: (to) => getRedirectRouteByPagePermission(to),
    component: OpsFlowContainer,
    children: [
        {
            path: 'landing',
            name: OPS_FLOW_ROUTE.LANDING._NAME,
            meta: {
                menuId: MENU_ID.OPS_FLOW_LANDING,
                translationId: () => taskManagementTemplateStore.templates.TemplateName,
            },
            component: OpsFlowLandingPage as any,
        },
        {
            path: 'board',
            meta: {
                menuId: MENU_ID.TASK_BOARD,
                translationId: () => taskManagementTemplateStore.templates.TaskBoard,
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: OPS_FLOW_ROUTE.BOARD._NAME,
                    meta: {
                        menuId: MENU_ID.TASK_BOARD,
                        lsbVisible: true,
                    },
                    component: BoardPage as any,
                },
                {
                    path: 'task-create',
                    name: OPS_FLOW_ROUTE.BOARD.TASK_CREATE._NAME,
                    component: TaskCreatePage as any,
                },
                {
                    path: ':taskId',
                    name: OPS_FLOW_ROUTE.BOARD.TASK_DETAIL._NAME,
                    props: true,
                    component: TaskDetailPage as any,
                },
            ],
        },
    ],
};

export default opsFlowRoutes;
