import { RouteConfig } from 'vue-router';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';

const CostManagementPage = () => import(/* webpackChunkName: "CostManagementPage" */ '@/services/cost-explorer/CostManagementPage.vue');
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

export default {
    path: 'billing',
    name: COST_EXPLORER_ROUTE._NAME,
    redirect: '/billing/dashboard',
    meta: { label: 'Billing' },
    component: { template: '<router-view />' },
    children: [
        // {
        //     path: 'cost-management',
        //     meta: { label: 'Cost Management' },
        //     redirect: '/billing/cost-management/dashboard',
        //     component: { template: '<router-view />' },
        //     children: [
        {
            path: '/',
            name: COST_EXPLORER_ROUTE.COST_MANAGEMENT._NAME,
            redirect: 'dashboard',
            component: CostManagementPage,
            children: [
                {
                    path: 'dashboard/create',
                    name: COST_EXPLORER_ROUTE.COST_MANAGEMENT.DASHBOARD.CREATE._NAME,
                    props: true,
                    component: CostDashboardCreatePage,
                },
                {
                    path: 'dashboard/customize/:dashboardId',
                    name: COST_EXPLORER_ROUTE.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE._NAME,
                    props: true,
                    component: CostDashboardCustomizePage,
                },
                {
                    path: 'dashboard/:dashboardId?',
                    name: COST_EXPLORER_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME,
                    meta: { isVerticalLayout: true },
                    props: true,
                    component: CostDashboardPage,
                },
                {
                    path: 'cost-analysis/:querySetId?',
                    name: COST_EXPLORER_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                    meta: { isVerticalLayout: true },
                    props: true,
                    component: CostAnalysisPage,
                },
                {
                    path: 'budget',
                    component: { template: '<router-view />' },
                    children: [
                        {
                            path: '/',
                            name: COST_EXPLORER_ROUTE.COST_MANAGEMENT.BUDGET._NAME,
                            meta: { isVerticalLayout: true },
                            component: BudgetPage,
                        },
                        {
                            path: 'create',
                            name: COST_EXPLORER_ROUTE.COST_MANAGEMENT.BUDGET.CREATE._NAME,
                            props: true,
                            component: BudgetCreatePage,
                        },
                        {
                            path: 'bulk-create',
                            name: COST_EXPLORER_ROUTE.COST_MANAGEMENT.BUDGET.BULK_CREATE._NAME,
                            props: true,
                            component: BudgetBulkCreatePage,
                        },
                        {
                            path: 'update/:budgetId',
                            name: COST_EXPLORER_ROUTE.COST_MANAGEMENT.BUDGET.UPDATE._NAME,
                            props: true,
                            component: BudgetUpdatePage,
                        },
                        {
                            path: ':budgetId',
                            name: COST_EXPLORER_ROUTE.COST_MANAGEMENT.BUDGET.DETAIL._NAME,
                            props: true,
                            component: BudgetDetailPage,
                        },
                    ],
                },
            ],
        },
    ],
} as RouteConfig;
