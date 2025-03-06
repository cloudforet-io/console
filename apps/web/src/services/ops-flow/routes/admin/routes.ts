import type { RouteConfig } from 'vue-router';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ADMIN_OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/admin/route-constant';

const OpsFlowContainer = () => import('@/services/ops-flow/OpsFlowContainer.vue');

const AdminTaskManagementPage = () => import('@/services/ops-flow/pages/admin/AdminTaskManagementPage.vue');
const AdminTaskCategoryDetailPage = () => import('@/services/ops-flow/pages/admin/AdminTaskCategoryDetailPage.vue');
const AdminTaskCategoryDetailPageStatusTab = () => import('@/services/ops-flow/pages/admin/AdminTaskCategoryDetailPageStatusTab.vue');
const AdminTaskCategoryDetailPageTaskTypeTab = () => import('@/services/ops-flow/pages/admin/AdminTaskCategoryDetailPageTaskTypeTab.vue');

const adminOpsFlowRoutes: RouteConfig = {
    path: 'ops-flow',
    name: ADMIN_OPS_FLOW_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.OPS_FLOW,
        translationId: MENU_INFO_MAP[MENU_ID.OPS_FLOW].translationId,
    },
    redirect: () => ({ name: ADMIN_OPS_FLOW_ROUTE.TASK_MANAGEMENT._NAME }),
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
                    name: ADMIN_OPS_FLOW_ROUTE.TASK_MANAGEMENT._NAME,
                    component: AdminTaskManagementPage as any,
                },
                {
                    path: 'task-category/:taskCategoryId',
                    name: ADMIN_OPS_FLOW_ROUTE.TASK_MANAGEMENT.TASK_CATEGORY.DETAIL._NAME,
                    props: true,
                    redirect: { name: ADMIN_OPS_FLOW_ROUTE.TASK_MANAGEMENT.TASK_CATEGORY.DETAIL.STATUS._NAME },
                    component: AdminTaskCategoryDetailPage as any,
                    children: [
                        {
                            path: 'status',
                            name: ADMIN_OPS_FLOW_ROUTE.TASK_MANAGEMENT.TASK_CATEGORY.DETAIL.STATUS._NAME,
                            props: true,
                            component: AdminTaskCategoryDetailPageStatusTab as any,
                        },
                        {
                            path: 'task-type',
                            name: ADMIN_OPS_FLOW_ROUTE.TASK_MANAGEMENT.TASK_CATEGORY.DETAIL.TASK_TYPE._NAME,
                            props: true,
                            component: AdminTaskCategoryDetailPageTaskTypeTab as any,
                        },
                    ],
                },
            ],
        },
    ],
};

export default adminOpsFlowRoutes;
