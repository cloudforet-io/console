import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { ITSM_ROUTE } from '@/services/itsm/routes/route-constant';

const ITSMContainer = () => import('@/services/itsm/ITSMContainer.vue');

const AdminTaskManagementSettingsPage = () => import('@/services/itsm/pages/admin/AdminTaskManagementSettingsPage.vue');
const AdminWorkflowPage = () => import('@/services/itsm/pages/admin/AdminWorkflowPage.vue');

const adminItsmRoutes: RouteConfig = {
    path: 'itsm',
    name: makeAdminRouteName(ITSM_ROUTE._NAME),
    meta: {
        menuId: MENU_ID.ITSM,
        translationId: MENU_INFO_MAP[MENU_ID.ITSM].translationId,
    },
    redirect: () => ({ name: makeAdminRouteName(ITSM_ROUTE.TASK_MANAGEMENT._NAME) }),
    component: ITSMContainer,
    children: [
        {
            path: 'task-management',
            name: makeAdminRouteName(ITSM_ROUTE.TASK_MANAGEMENT._NAME),
            redirect: () => ({ name: makeAdminRouteName(ITSM_ROUTE.TASK_MANAGEMENT.SETTINGS._NAME) }),
            meta: {
                menuId: MENU_ID.TASK_MANAGEMENT,
                translationId: MENU_INFO_MAP[MENU_ID.TASK_MANAGEMENT].translationId,
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'settings',
                    name: makeAdminRouteName(ITSM_ROUTE.TASK_MANAGEMENT.SETTINGS._NAME),
                    component: AdminTaskManagementSettingsPage as any,
                },
            ],
        },
        {
            path: 'workflow:workflowId?',
            name: makeAdminRouteName(ITSM_ROUTE.WORKFLOW._NAME),
            meta: {
                menuId: MENU_ID.WORKFLOW,
                translationId: MENU_INFO_MAP[MENU_ID.WORKFLOW].translationId,
            },
            component: AdminWorkflowPage as any,
        },
    ],
};

export default adminItsmRoutes;
