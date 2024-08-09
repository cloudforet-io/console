import type { RouteConfig } from 'vue-router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';

import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

const WorkspaceHome = () => import('@/services/workspace-home/pages/WorkspaceHomePage.vue');

const adminWorkspaceHomeRoutes: RouteConfig = {
    path: 'home',
    name: makeAdminRouteName(WORKSPACE_HOME_ROUTE._NAME),
    meta: { menuId: MENU_ID.WORKSPACE_HOME },
    // HACK: redirect to user list page for now
    redirect: () => ({
        name: makeAdminRouteName(IAM_ROUTE.USER._NAME),
    }),
    component: WorkspaceHome,
};
export default adminWorkspaceHomeRoutes;
