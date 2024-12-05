import type { RouteConfig } from 'vue-router';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { PROJECT_ROUTE_V2 } from '@/services/project-v2/routes/route-constant';

const ProjectContainer = () => import('@/services/project-v2/ProjectContainer.vue');

const ProjectMainPage = () => import('@/services/project-v2/pages/ProjectMainPage.vue');
const ProjectDetailPage = () => import('@/services/project-v2/pages/ProjectDetailPage.vue');
const ProjectDetailTabPage = () => import('@/services/project-v2/pages/ProjectDetailTabPage.vue');
const ProjectDashboardPage = () => import('@/services/project-v2/pages/ProjectDashboardPage.vue');
const ProjectSummaryPage = () => import('@/services/project-v2/pages/ProjectSummaryPage.vue');

const projectRoutesV2: RouteConfig = {
    path: 'project',
    meta: {
        menuId: MENU_ID.PROJECT,
        translationId: MENU_INFO_MAP[MENU_ID.PROJECT].translationId,
    },
    component: ProjectContainer,
    children: [
        {
            path: ':projectGroupId?',
            name: PROJECT_ROUTE_V2._NAME,
            meta: {
                menuId: MENU_ID.PROJECT,
                lsbVisible: true,
            },
            props: true,
            component: ProjectMainPage,
        },
        {
            path: 'detail/:id',
            name: PROJECT_ROUTE_V2.DETAIL._NAME,
            redirect: PROJECT_ROUTE_V2.DETAIL.TAB.SUMMARY._NAME,
            props: true,
            component: ProjectDetailPage,
            children: [
                {
                    path: '/',
                    name: PROJECT_ROUTE_V2.DETAIL.TAB._NAME,
                    redirect: PROJECT_ROUTE_V2.DETAIL.TAB.SUMMARY._NAME,
                    props: true,
                    component: ProjectDetailTabPage,
                    children: [
                        {
                            path: 'summary',
                            name: PROJECT_ROUTE_V2.DETAIL.TAB.SUMMARY._NAME,
                            meta: { lsbVisible: true },
                            props: true,
                            component: ProjectSummaryPage,
                        },
                        {
                            path: '*',
                            redirect: 'summary',
                        },
                        {
                            path: 'dashboard/:dashboardId',
                            name: PROJECT_ROUTE_V2.DETAIL.TAB.DASHBOARD._NAME,
                            meta: { lsbVisible: true },
                            props: true,
                            component: ProjectDashboardPage,
                        },
                    ],
                },
            ],
        },
    ],
};

export default projectRoutesV2;
