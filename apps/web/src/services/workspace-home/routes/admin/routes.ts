import type { RouteConfig } from 'vue-router';


import { MENU_ID } from '@/lib/menu/config';

import { ADMIN_IAM_ROUTE } from '@/services/iam/routes/admin/route-constant';
import { ADMIN_WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/admin/route-constant';

const WorkspaceHome = () => import('@/services/workspace-home/pages/WorkspaceHomePage.vue');

const adminWorkspaceHomeRoutes: RouteConfig = {
    path: 'home',
    name: ADMIN_WORKSPACE_HOME_ROUTE._NAME,
    meta: { menuId: MENU_ID.WORKSPACE_HOME },
    // HACK: redirect to user list page for now
    redirect: () => ({
        name: ADMIN_IAM_ROUTE.USER._NAME,
    }),
    component: WorkspaceHome,
};
export default adminWorkspaceHomeRoutes;
