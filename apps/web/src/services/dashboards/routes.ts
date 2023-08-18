import type { RouteRecordRaw } from 'vue-router';

import { store } from '@/store';
import { i18n } from '@/translations';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';

import type { Breadcrumb } from '@/common/modules/page-layouts/type';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

const DashboardsContainer = () => import('@/services/dashboards/DashboardsContainer.vue');
const DashboardsMainPage = () => import('@/services/dashboards/dashboard-main/DashboardsMainPage.vue');
const DashboardCreatePage = () => import('@/services/dashboards/dashboard-create/DashboardCreatePage.vue');
const DashboardCustomizePage = () => import('@/services/dashboards/dashboard-customize/DashboardCustomizePage.vue');
const DashboardDetailPage = () => import('@/services/dashboards/dashboard-detail/DashboardDetailPage.vue');

const dashboardsRoute: RouteRecordRaw = {
    path: 'dashboards',
    name: DASHBOARDS_ROUTE._NAME,
    meta: { menuId: MENU_ID.DASHBOARDS, accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
    redirect: () => getRedirectRouteByPagePermission(MENU_ID.DASHBOARDS, store.getters['user/pagePermissionMap']),
    component: DashboardsContainer,
    children: [
        {
            path: '/',
            component: { template: '<router-view/>' },
            redirect: () => ({ name: DASHBOARDS_ROUTE.ALL._NAME }),
            children: [
                {
                    path: 'all',
                    name: DASHBOARDS_ROUTE.ALL._NAME,
                    meta: { lnbVisible: true, translationId: 'DASHBOARDS.ALL_DASHBOARDS.VIEW_ALL' },
                    component: DashboardsMainPage,
                },
                {
                    path: 'create',
                    name: DASHBOARDS_ROUTE.CREATE._NAME,
                    meta: {
                        centeredLayout: true,
                        translationId: 'DASHBOARDS.CREATE.TITLE',
                        accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION,
                        accessInfo: {
                            referenceMenuIds: [MENU_ID.DASHBOARDS_PROJECT, MENU_ID.DASHBOARDS_WORKSPACE],
                        },
                    },
                    component: DashboardCreatePage,
                },
                {
                    path: 'project',
                    name: DASHBOARDS_ROUTE.PROJECT._NAME,
                    meta: { translationId: 'DASHBOARDS.ALL_DASHBOARDS.PROJECT' },
                    redirect: () => ({ name: DASHBOARDS_ROUTE.ALL._NAME }),
                    props: true,
                    component: { template: '<router-view/>' },
                    children: [
                        {
                            path: 'detail/:dashboardId',
                            name: DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME,
                            meta: { lnbVisible: true, label: ({ params }) => params.dashboardId, copiable: true },
                            props: true,
                            component: DashboardDetailPage,
                        },
                        {
                            path: 'customize/:dashboardId?',
                            name: DASHBOARDS_ROUTE.PROJECT.CUSTOMIZE._NAME,
                            meta: {
                                accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION,
                                breadcrumbs: ({ params }) => {
                                    const breadcrumbs: Breadcrumb[] = [
                                        {
                                            name: i18n.global.t('DASHBOARDS.DETAIL.CUSTOMIZE'),
                                            to: {
                                                name: DASHBOARDS_ROUTE.PROJECT.CUSTOMIZE._NAME,
                                            },
                                        },
                                    ];
                                    if (params.dashboardId) {
                                        breadcrumbs.push({
                                            name: params.dashboardId,
                                            to: {
                                                name: DASHBOARDS_ROUTE.PROJECT.CUSTOMIZE._NAME,
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
                    name: DASHBOARDS_ROUTE.WORKSPACE._NAME,
                    meta: { translationId: 'DASHBOARDS.ALL_DASHBOARDS.ENTIRE_WORKSPACE' },
                    redirect: () => ({ name: DASHBOARDS_ROUTE.ALL._NAME }),
                    props: true,
                    component: { template: '<router-view/>' },
                    children: [
                        {
                            path: 'detail/:dashboardId',
                            name: DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME,
                            meta: { lnbVisible: true, label: ({ params }) => params.dashboardId, copiable: true },
                            props: true,
                            component: DashboardDetailPage,
                        },
                        {
                            path: 'customize/:dashboardId?',
                            name: DASHBOARDS_ROUTE.WORKSPACE.CUSTOMIZE._NAME,
                            meta: {
                                accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION,
                                breadcrumbs: ({ params }) => {
                                    const breadcrumbs: Breadcrumb[] = [
                                        {
                                            name: i18n.global.t('DASHBOARDS.DETAIL.CUSTOMIZE'),
                                            to: {
                                                name: DASHBOARDS_ROUTE.WORKSPACE.CUSTOMIZE._NAME,
                                            },
                                        },
                                    ];
                                    if (params.dashboardId) {
                                        breadcrumbs.push({
                                            name: params.dashboardId,
                                            to: {
                                                name: DASHBOARDS_ROUTE.WORKSPACE.CUSTOMIZE._NAME,
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

export default dashboardsRoute;
