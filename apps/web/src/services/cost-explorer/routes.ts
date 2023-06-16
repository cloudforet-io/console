import type { RouteRecordRaw } from 'vue-router';

import { store } from '@/store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';

const CostExplorerContainer = () => import('@/services/cost-explorer/CostExplorerContainer.vue');

const CostDashboardCreatePage = () => import('@/services/cost-explorer/cost-dashboard/cost-dashboard-create/CostDashboardCreatePage.vue');
// eslint-disable-next-line max-len
const CostDashboardCustomizePage = () => import('@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/CostDashboardCustomizePage.vue');
const CostDashboardPage = () => import('@/services/cost-explorer/cost-dashboard/CostDashboardPage.vue');
const CostAnalysisPage = () => import('@/services/cost-explorer/cost-analysis/CostAnalysisPage.vue');
const BudgetPage = () => import('@/services/cost-explorer/budget/BudgetPage.vue');
const BudgetCreatePage = () => import('@/services/cost-explorer/budget/budget-create/BudgetCreatePage.vue');
const BudgetBulkCreatePage = () => import('@/services/cost-explorer/budget/budget-bulk-create/BudgetBulkCreatePage.vue');
const BudgetUpdatePage = () => import('@/services/cost-explorer/budget/budget-update/BudgetUpdatePage.vue');
const BudgetDetailPage = () => import('@/services/cost-explorer/budget/budget-detail/BudgetDetailPage.vue');

const costExplorerRoutes: RouteRecordRaw = {
    path: 'cost-explorer',
    name: COST_EXPLORER_ROUTE._NAME,
    meta: { menuId: MENU_ID.COST_EXPLORER, accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
    redirect: () => getRedirectRouteByPagePermission(MENU_ID.COST_EXPLORER, store.getters['user/pagePermissionMap']),
    component: CostExplorerContainer,
    children: [
        {
            path: 'dashboard',
            meta: { menuId: MENU_ID.COST_EXPLORER_DASHBOARD },
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'create',
                    name: COST_EXPLORER_ROUTE.DASHBOARD.CREATE._NAME,
                    meta: { translationId: 'BILLING.COST_MANAGEMENT.DASHBOARD.CREATE_DASHBOARD' },
                    props: true,
                    component: CostDashboardCreatePage as any,
                },
                {
                    path: 'customize',
                    meta: { translationId: 'BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.CUSTOMIZE' },
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: ':dashboardId',
                            name: COST_EXPLORER_ROUTE.DASHBOARD.CUSTOMIZE._NAME,
                            meta: { label: ({ params }) => params.dashboardId, copiable: true },
                            props: true,
                            component: CostDashboardCustomizePage as any,
                        },
                    ],
                },
                {
                    path: ':dashboardId?',
                    name: COST_EXPLORER_ROUTE.DASHBOARD._NAME,
                    meta: { lnbVisible: true, label: ({ params }) => params.dashboardId, copiable: true },
                    props: true,
                    component: CostDashboardPage as any,
                },
            ],
        },
        {
            path: 'cost-analysis',
            meta: { menuId: MENU_ID.COST_EXPLORER_COST_ANALYSIS },
            component: { template: '<router-view />' },
            children: [
                {
                    path: ':querySetId?',
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    meta: {
                        lnbVisible: true, label: ({ params }) => params.querySetId, copiable: true,
                    },
                    props: true,
                    component: CostAnalysisPage as any,
                },
            ],
        },
        {
            path: 'budget',
            meta: { menuId: MENU_ID.COST_EXPLORER_BUDGET },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '',
                    name: COST_EXPLORER_ROUTE.BUDGET._NAME,
                    meta: { lnbVisible: true },
                    component: BudgetPage as any,
                },
                {
                    path: 'create',
                    name: COST_EXPLORER_ROUTE.BUDGET.CREATE._NAME,
                    meta: { translationId: 'BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE_BUDGET', accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION },
                    component: BudgetCreatePage as any,
                },
                {
                    path: 'bulk-create',
                    name: COST_EXPLORER_ROUTE.BUDGET.BULK_CREATE._NAME,
                    meta: { translationId: 'BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE_BULK_BUDGET', accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION },
                    component: BudgetBulkCreatePage as any,
                },
                {
                    path: 'update/:budgetId',
                    name: COST_EXPLORER_ROUTE.BUDGET.UPDATE._NAME,
                    meta: { translationId: 'BILLING.COST_MANAGEMENT.BUDGET.MAIN.UPDATE_BUDGET', accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION },
                    props: true,
                    component: BudgetUpdatePage as any,
                },
                {
                    path: ':budgetId',
                    name: COST_EXPLORER_ROUTE.BUDGET.DETAIL._NAME,
                    props: true,
                    meta: { lnbVisible: true, label: ({ params }) => params.budgetId, copiable: true },
                    component: BudgetDetailPage as any,
                },
            ],
        },
    ],
};

export default costExplorerRoutes;
