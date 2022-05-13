import { RouteConfig } from 'vue-router';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { getMenuLabel } from '@/lib/menu/menu-info';
import { MENU_ID } from '@/lib/menu/config';

const CostExplorerContainer = () => import(/* webpackChunkName: "CostExplorerContainer" */ '@/services/cost-explorer/CostExplorerContainer.vue');

const CostDashboardCreatePage = () => import(/* webpackChunkName: "CostDashboardCreatePage" */ '@/services/cost-explorer/cost-dashboard/cost-dashboard-create/CostDashboardCreatePage.vue');
// eslint-disable-next-line max-len
const CostDashboardCustomizePage = () => import(/* webpackChunkName: "CostDashboardCustomizePage" */'@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/CostDashboardCustomizePage.vue');
const CostDashboardPage = () => import(/* webpackChunkName: "CostDashboardPage" */ '@/services/cost-explorer/cost-dashboard/CostDashboardPage.vue');
const CostAnalysisPage = () => import(/* webpackChunkName: "CostAnalysisPage" */ '@/services/cost-explorer/cost-analysis/CostAnalysisPage.vue');
const BudgetPage = () => import(/* webpackChunkName: "BudgetPage" */ '@/services/cost-explorer/budget/BudgetPage.vue');
const BudgetCreatePage = () => import(/* webpackChunkName: "BudgetCreatePage" */ '@/services/cost-explorer/budget/budget-create/BudgetCreatePage.vue');
const BudgetBulkCreatePage = () => import(/* webpackChunkName: "BudgetBulkCreatePage" */ '@/services/cost-explorer/budget/budget-bulk-create/BudgetBulkCreatePage.vue');
const BudgetUpdatePage = () => import(/* webpackChunkName: "BudgetUpdatePage" */ '@/services/cost-explorer/budget/budget-update/BudgetUpdatePage.vue');
const BudgetDetailPage = () => import(/* webpackChunkName: "BudgetDetailPage" */ '@/services/cost-explorer/budget/budget-detail/BudgetDetailPage.vue');

const costExplorerRoutes: RouteConfig = {
    path: 'cost-explorer',
    name: COST_EXPLORER_ROUTE._NAME,
    meta: { label: getMenuLabel(MENU_ID.COST_EXPLORER), accessLevel: 'VIEW_PERMISSION' },
    redirect: '/cost-explorer/dashboard',
    component: CostExplorerContainer,
    children: [
        {
            path: 'dashboard',
            meta: { label: getMenuLabel(MENU_ID.COST_EXPLORER_DASHBOARD) },
            component: { template: '<router-view />' },
            children: [
                {
                    path: 'create',
                    name: COST_EXPLORER_ROUTE.DASHBOARD.CREATE._NAME,
                    meta: { label: 'Create Dashboard', accessLevel: 'MANAGE_PERMISSION' },
                    props: true,
                    component: CostDashboardCreatePage as any,
                },
                {
                    path: 'customize',
                    meta: { label: 'Customize' },
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
            meta: { label: getMenuLabel(MENU_ID.COST_EXPLORER_COST_ANALYSIS) },
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
            meta: { label: getMenuLabel(MENU_ID.COST_EXPLORER_BUDGET) },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: COST_EXPLORER_ROUTE.BUDGET._NAME,
                    meta: { lnbVisible: true },
                    component: BudgetPage as any,
                },
                {
                    path: 'create',
                    name: COST_EXPLORER_ROUTE.BUDGET.CREATE._NAME,
                    meta: { label: 'Create Budget', accessLevel: 'MANAGE_PERMISSION' },
                    component: BudgetCreatePage as any,
                },
                {
                    path: 'bulk-create',
                    name: COST_EXPLORER_ROUTE.BUDGET.BULK_CREATE._NAME,
                    meta: { label: 'Create Bulk Budget', accessLevel: 'MANAGE_PERMISSION' },
                    component: BudgetBulkCreatePage as any,
                },
                {
                    path: 'update/:budgetId',
                    name: COST_EXPLORER_ROUTE.BUDGET.UPDATE._NAME,
                    meta: { label: 'Update Budget', accessLevel: 'MANAGE_PERMISSION' },
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
