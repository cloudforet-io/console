import type { RouteConfig } from 'vue-router';

import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { MENU_ID } from '@/lib/menu/config';

import type { Breadcrumb } from '@/common/modules/page-layouts/type';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';

const DashboardsContainer = () => import('@/services/dashboards/DashboardsContainer.vue');
const DashboardsMainPage = () => import('@/services/dashboards/pages/DashboardsMainPage.vue');
const DashboardCreatePage = () => import('@/services/dashboards/pages/DashboardCreatePage.vue');
const DashboardCustomizePage = () => import('@/services/dashboards/pages/DashboardCustomizePage.vue');
const DashboardDetailPage = () => import('@/services/dashboards/pages/DashboardDetailPage.vue');

const adminDashboardsRoute: RouteConfig = {
    path: 'dashboards',
    name: makeAdminRouteName(DASHBOARDS_ROUTE._NAME),
    meta: { menuId: MENU_ID.DASHBOARDS },
    component: DashboardsContainer,
    children: [
        {
            path: '/',
            component: { template: '<router-view/>' },
            redirect: () => ({ name: makeAdminRouteName(DASHBOARDS_ROUTE.ALL._NAME) }),
            children: [
                {
                    path: 'all',
                    name: makeAdminRouteName(DASHBOARDS_ROUTE.ALL._NAME),
                    meta: { lnbVisible: true, translationId: 'DASHBOARDS.ALL_DASHBOARDS.VIEW_ALL' },
                    component: DashboardsMainPage,
                },
                {
                    path: 'create',
                    name: makeAdminRouteName(DASHBOARDS_ROUTE.CREATE._NAME),
                    meta: {
                        centeredLayout: true,
                        translationId: 'DASHBOARDS.CREATE.TITLE',
                        accessInfo: {
                            /*
                            * The 'referenceMenuIds' array is used to specify multiple menu IDs for access level checks.
                            * Unlike typical routes which are associated with a single menu ID, this route requires
                            * validation against multiple IDs, ensuring all necessary access levels are met.
                            *
                            * Future development note: If child routes are added under this unique route configuration,
                            * it's important to consider inheritance of these access checks. Additional development may
                            * be required to handle the complexities of multi-ID access verification in child routes.
                            */
                            referenceMenuIds: [MENU_ID.PROJECT_DASHBOARDS, MENU_ID.WORKSPACE_DASHBOARDS],
                        },
                    },
                    component: DashboardCreatePage,
                },
                {
                    path: 'project',
                    name: makeAdminRouteName(DASHBOARDS_ROUTE.PROJECT._NAME),
                    meta: { translationId: 'DASHBOARDS.ALL_DASHBOARDS.PROJECT' },
                    redirect: () => ({ name: makeAdminRouteName(DASHBOARDS_ROUTE.ALL._NAME) }),
                    props: true,
                    component: { template: '<router-view/>' },
                    children: [
                        {
                            path: 'detail/:dashboardId',
                            name: makeAdminRouteName(DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME),
                            meta: { lnbVisible: true, label: ({ params }) => params.dashboardId, copiable: true },
                            props: true,
                            component: DashboardDetailPage,
                        },
                        {
                            path: 'customize/:dashboardId?',
                            name: makeAdminRouteName(DASHBOARDS_ROUTE.PROJECT.CUSTOMIZE._NAME),
                            meta: {
                                breadcrumbs: ({ params }) => {
                                    const breadcrumbs: Breadcrumb[] = [
                                        {
                                            name: i18n.t('DASHBOARDS.DETAIL.CUSTOMIZE'),
                                            to: {
                                                name: makeAdminRouteName(DASHBOARDS_ROUTE.PROJECT.CUSTOMIZE._NAME),
                                            },
                                        },
                                    ];
                                    if (params.dashboardId) {
                                        breadcrumbs.push({
                                            name: params.dashboardId,
                                            to: {
                                                name: makeAdminRouteName(DASHBOARDS_ROUTE.PROJECT.CUSTOMIZE._NAME),
                                                params: {
                                                    dashboardId: params.dashboardId,
                                                },
                                            },
                                            copiable: true,
                                        });
                                    }
                                    return breadcrumbs;
                                },
                            },
                            props: true,
                            component: DashboardCustomizePage,
                        },
                    ],
                },
                {
                    path: 'workspace',
                    name: makeAdminRouteName(DASHBOARDS_ROUTE.WORKSPACE._NAME),
                    meta: { translationId: 'DASHBOARDS.ALL_DASHBOARDS.WORKSPACE' },
                    redirect: () => ({ name: makeAdminRouteName(DASHBOARDS_ROUTE.ALL._NAME) }),
                    props: true,
                    component: { template: '<router-view/>' },
                    children: [
                        {
                            path: 'detail/:dashboardId',
                            name: makeAdminRouteName(DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME),
                            meta: { lnbVisible: true, label: ({ params }) => params.dashboardId, copiable: true },
                            props: true,
                            component: DashboardDetailPage,
                        },
                        {
                            path: 'customize/:dashboardId?',
                            name: makeAdminRouteName(DASHBOARDS_ROUTE.WORKSPACE.CUSTOMIZE._NAME),
                            meta: {
                                breadcrumbs: ({ params }) => {
                                    const breadcrumbs: Breadcrumb[] = [
                                        {
                                            name: i18n.t('DASHBOARDS.DETAIL.CUSTOMIZE'),
                                            to: {
                                                name: makeAdminRouteName(DASHBOARDS_ROUTE.WORKSPACE.CUSTOMIZE._NAME),
                                            },
                                        },
                                    ];
                                    if (params.dashboardId) {
                                        breadcrumbs.push({
                                            name: params.dashboardId,
                                            to: {
                                                name: makeAdminRouteName(DASHBOARDS_ROUTE.WORKSPACE.CUSTOMIZE._NAME),
                                                params: {
                                                    dashboardId: params.dashboardId,
                                                },
                                            },
                                            copiable: true,
                                        });
                                    }
                                    return breadcrumbs;
                                },
                            },
                            props: true,
                            component: DashboardCustomizePage,
                        },
                    ],
                },
            ],
        },

    ],
};

export default adminDashboardsRoute;
