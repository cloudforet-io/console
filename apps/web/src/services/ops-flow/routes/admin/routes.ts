import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';

const OpsFlowContainer = () => import('@/services/ops-flow/OpsFlowContainer.vue');

const AdminTaskManagementPage = () => import('@/services/ops-flow/pages/admin/AdminTaskManagementPage.vue');
const AdminTaskCategoryDetailPage = () => import('@/services/ops-flow/pages/admin/AdminTaskCategoryDetailPage.vue');
const AdminWorkflowPage = () => import('@/services/ops-flow/pages/admin/AdminWorkflowPage.vue');

const adminOpsFlowRoutes: RouteConfig = {
    path: 'ops-flow',
    name: makeAdminRouteName(OPS_FLOW_ROUTE._NAME),
    meta: {
        menuId: MENU_ID.OPS_FLOW,
        translationId: MENU_INFO_MAP[MENU_ID.OPS_FLOW].translationId,
    },
    redirect: () => ({ name: makeAdminRouteName(OPS_FLOW_ROUTE.TASK_MANAGEMENT._NAME) }),
    component: OpsFlowContainer,
    children: [
        {
            path: 'task-management',
            meta: {
                menuId: MENU_ID.TASK_MANAGEMENT,
                translationId: MENU_INFO_MAP[MENU_ID.TASK_MANAGEMENT].translationId,
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: makeAdminRouteName(OPS_FLOW_ROUTE.TASK_MANAGEMENT._NAME),
                    component: AdminTaskManagementPage as any,
                },
                {
                    path: 'task-category/:taskCategoryId',
                    name: makeAdminRouteName(OPS_FLOW_ROUTE.TASK_MANAGEMENT.TASK_CATEGORY.DETAIL._NAME),
                    component: AdminTaskCategoryDetailPage as any,
                },
            ],
        },
        {
            path: 'workflow/:workflowId?',
            name: makeAdminRouteName(OPS_FLOW_ROUTE.WORKFLOW._NAME),
            meta: {
                menuId: MENU_ID.WORKFLOW,
                translationId: MENU_INFO_MAP[MENU_ID.WORKFLOW].translationId,
            },
            component: AdminWorkflowPage as any,
        },
    ],
};

export default adminOpsFlowRoutes;
