import type { RouteConfig } from 'vue-router';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';

const ProjectContainer = () => import('@/services/project/v2/ProjectContainer.vue');

const ProjectMainPage = () => import('@/services/project/v2/pages/ProjectMainPage.vue');

const projectRoutes: RouteConfig = {
    path: 'project',
    meta: {
        menuId: MENU_ID.PROJECT,
        translationId: MENU_INFO_MAP[MENU_ID.PROJECT].translationId,
    },
    component: ProjectContainer,
    children: [
        {
            path: ':projectGroupOrProjectId?',
            name: PROJECT_ROUTE_V1._NAME,
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
