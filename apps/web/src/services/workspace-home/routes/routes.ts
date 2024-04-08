import type { RouteConfig } from 'vue-router';

import { MENU_ID } from '@/lib/menu/config';

import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

const WorkspaceHome = () => import('@/services/workspace-home/pages/WorkspaceHomePage.vue');

export default {
    path: 'home',
    name: WORKSPACE_HOME_ROUTE._NAME,
    meta: { menuId: MENU_ID.WORKSPACE_HOME },
    component: WorkspaceHome,
} as RouteConfig;
