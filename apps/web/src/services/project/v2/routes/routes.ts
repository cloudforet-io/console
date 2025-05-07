import type { RouteConfig } from 'vue-router';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

const ProjectContainer = () => import('@/services/project/v2/ProjectContainer.vue');

const ProjectMainPage = () => import('@/services/project/v2/pages/ProjectMainPage.vue');
const ProjectDashboardCreatePage = () => import('@/services/project/v2/pages/ProjectDashboardCreatePage.vue');

const projectRoutes: RouteConfig = {
    path: 'project',
    meta: {
        menuId: MENU_ID.PROJECT,
        translationId: MENU_INFO_MAP[MENU_ID.PROJECT].translationId,
    },
    component: ProjectContainer,
    children: [
        {
            path: ':projectGroupOrProjectId/dashboard-create',
            name: PROJECT_ROUTE_V2.DASHBOARD_CREATE._NAME,
            meta: {
                menuId: MENU_ID.PROJECT,
            },
            props: true,
            component: ProjectDashboardCreatePage,
        },
        {
            path: ':projectGroupOrProjectId?/:dashboardId?',
            name: PROJECT_ROUTE_V2._NAME,
            meta: {
                menuId: MENU_ID.PROJECT,
                lsbVisible: true,
            },
            props: true,
            component: ProjectMainPage,
        },
    ],
};

export default projectRoutes;
