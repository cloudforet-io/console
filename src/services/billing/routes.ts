import { RouteConfig } from 'vue-router';

const CostManagementPage = () => import(/* webpackChunkName: "CostManagementPage" */ '@/services/billing/cost-management/CostManagementPage.vue');
const CostDashboardCreatePage = () => import(/* webpackChunkName: "CostDashboardCreatePage" */ '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/CostDashboardCreatePage.vue');
// eslint-disable-next-line max-len
const CostDashboardCustomizePage = () => import(/* webpackChunkName: "CostDashboardCustomizePage" */'@/services/billing/cost-management/cost-dashboard/cost-dashboard-customize/CostDashboardCustomizePage.vue');
const CostDashboardPage = () => import(/* webpackChunkName: "CostDashboardPage" */ '@/services/billing/cost-management/cost-dashboard/CostDashboardPage.vue');
const CostAnalysisPage = () => import(/* webpackChunkName: "CostAnalysisPage" */ '@/services/billing/cost-management/cost-analysis/CostAnalysisPage.vue');
const BudgetPage = () => import(/* webpackChunkName: "BudgetPage" */ '@/services/billing/cost-management/budget/BudgetPage.vue');
const BudgetCreatePage = () => import(/* webpackChunkName: "BudgetCreatePage" */ '@/services/billing/cost-management/budget/budget-create/BudgetCreatePage.vue');
const BudgetBulkCreatePage = () => import(/* webpackChunkName: "BudgetBulkCreatePage" */ '@/services/billing/cost-management/budget/budget-bulk-create/BudgetBulkCreatePage.vue');
const BudgetUpdatePage = () => import(/* webpackChunkName: "BudgetUpdatePage" */ '@/services/billing/cost-management/budget/budget-update/BudgetUpdatePage.vue');
const BudgetDetailPage = () => import(/* webpackChunkName: "BudgetDetailPage" */ '@/services/billing/cost-management/budget/budget-detail/BudgetDetailPage.vue');


export const BILLING_ROUTE = Object.freeze({
    _NAME: 'billing',
    COST_MANAGEMENT: {
        _NAME: 'costManagement',
        DASHBOARD: {
            _NAME: 'costDashboard',
            CREATE: { _NAME: 'create' },
            CUSTOMIZE: { _NAME: 'customize' },
        },
        COST_ANALYSIS: { _NAME: 'costAnalysis' },
        BUDGET: {
            _NAME: 'budget',
            DETAIL: { _NAME: 'budgetDetail' },
            CREATE: { _NAME: 'budgetCreate' },
            BULK_CREATE: { _NAME: 'budgetBulkCreate' },
            UPDATE: { _NAME: 'budgetUpdate' },
        },
    },
});

export default {
    path: 'billing',
    name: BILLING_ROUTE._NAME,
    redirect: '/billing/cost-management/dashboard',
    meta: { label: 'Billing' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'cost-management',
            meta: { label: 'Cost Management' },
            redirect: '/billing/cost-management/dashboard',
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: BILLING_ROUTE.COST_MANAGEMENT._NAME,
                    redirect: 'dashboard',
                    component: CostManagementPage,
                    children: [
                        {
                            path: 'dashboard/create',
                            name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD.CREATE._NAME,
                            props: true,
                            component: CostDashboardCreatePage,
                        },
                        {
                            path: 'dashboard/customize/:dashboardId',
                            name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE._NAME,
                            props: true,
                            component: CostDashboardCustomizePage,
                        },
                        {
                            path: 'dashboard/:dashboardId?',
                            name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME,
                            meta: { isVerticalLayout: true },
                            props: true,
                            component: CostDashboardPage,
                        },
                        {
                            path: 'cost-analysis/:querySetId?',
                            name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
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
                                    name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET._NAME,
                                    meta: { isVerticalLayout: true },
                                    component: BudgetPage,
                                },
                                {
                                    path: 'create',
                                    name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET.CREATE._NAME,
                                    props: true,
                                    component: BudgetCreatePage,
                                },
                                {
                                    path: 'bulk-create',
                                    name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET.BULK_CREATE._NAME,
                                    props: true,
                                    component: BudgetBulkCreatePage,
                                },
                                {
                                    path: 'update/:budgetId',
                                    name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET.UPDATE._NAME,
                                    props: true,
                                    component: BudgetUpdatePage,
                                },
                                {
                                    path: ':budgetId',
                                    name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET.DETAIL._NAME,
                                    props: true,
                                    component: BudgetDetailPage,
                                },
                            ],
                        },
                    ],
                },

            ],
        },
    ],
} as RouteConfig;
