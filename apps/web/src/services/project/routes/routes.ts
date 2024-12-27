import type { RouteConfig } from 'vue-router';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';

const ProjectContainer = () => import('@/services/project/ProjectContainer.vue');

const ProjectMainPage = () => import('@/services/project/pages/ProjectMainPage.vue');
const ProjectDetailPage = () => import('@/services/project/pages/ProjectDetailPage.vue');
const ProjectDetailTabPage = () => import('@/services/project/pages/ProjectDetailTabPage.vue');
const ProjectDashboardPage = () => import('@/services/project/pages/ProjectDashboardPage.vue');
const ProjectSummaryPage = () => import('@/services/project/pages/ProjectSummaryPage.vue');

const projectRoute: RouteConfig = {
    path: 'project',
    meta: {
        menuId: MENU_ID.PROJECT,
        translationId: MENU_INFO_MAP[MENU_ID.PROJECT].translationId,
    },
    component: ProjectContainer,
    children: [
        {
            path: ':projectGroupId?',
            name: PROJECT_ROUTE._NAME,
            meta: {
                menuId: MENU_ID.PROJECT,
                lsbVisible: true,
            },
            props: true,
            component: ProjectMainPage,
        },
        {
            path: 'detail/:id',
            name: PROJECT_ROUTE.DETAIL._NAME,
            redirect: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
            props: true,
            component: ProjectDetailPage,
            children: [
                {
                    path: '/',
                    name: PROJECT_ROUTE.DETAIL.TAB._NAME,
                    redirect: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
                    props: true,
                    component: ProjectDetailTabPage,
                    children: [
                        {
                            path: 'summary',
                            name: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
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
                            name: PROJECT_ROUTE.DETAIL.TAB.DASHBOARD._NAME,
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

export default projectRoute;
