import { RouteConfig } from 'vue-router';
import BudgetDetailPage from '@/services/billing/cost-management/budget/budget-detail/BudgetDetailPage.vue';

const CostManagementPage = () => import(/* webpackChunkName: "CostManagementPage" */ '@/services/billing/cost-management/CostManagementPage.vue');

const CostDashboardPage = () => import(/* webpackChunkName: "CostDashboardPage" */ '@/services/billing/cost-management/cost-dashboard/CostDashboardPage.vue');
const CostAnalysisPage = () => import(/* webpackChunkName: "CostAnalysisPage" */ '@/services/billing/cost-management/cost-analysis/CostAnalysisPage.vue');
const BudgetPage = () => import(/* webpackChunkName: "BudgetPage" */ '@/services/billing/cost-management/budget/BudgetPage.vue');
const BudgetCreatePage = () => import(/* webpackChunkName: "BudgetCreatePage" */ '@/services/billing/cost-management/budget/budget-create/BudgetCreatePage.vue');
const BudgetUpdatePage = () => import(/* webpackChunkName: "BudgetUpdatePage" */ '@/services/billing/cost-management/budget/budget-update/BudgetUpdatePage.vue');


export const BILLING_ROUTE = Object.freeze({
    _NAME: 'billing',
    COST_MANAGEMENT: {
        _NAME: 'costManagement',
        DASHBOARD: { _NAME: 'costDashboard' },
        COST_ANALYSIS: { _NAME: 'costAnalysis' },
        BUDGET: {
            _NAME: 'budget',
            DETAIL: { _NAME: 'budgetDetail' },
            CREATE: { _NAME: 'budgetCreate' },
            UPDATE: { _NAME: 'budgetUpdate' },
        },
    },
});

export default {
    path: 'billing',
    name: BILLING_ROUTE._NAME,
    redirect: '/billing/cost-management/cost-analysis',
    meta: { label: 'Billing' },
    component: { template: '<router-view />' },
    children: [
        {
            path: 'cost-management',
            meta: { label: 'Alert Manager' },
            redirect: 'cost-analysis',
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: BILLING_ROUTE.COST_MANAGEMENT._NAME,
                    redirect: 'cost-analysis',
                    component: CostManagementPage,
                    children: [
                        {
                            path: 'dashboard/:dashboardId',
                            name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME,
                            props: true,
                            component: CostDashboardPage,
                        },
                        {
                            path: 'cost-analysis/:querySetId?',
                            name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                            props: true,
                            component: CostAnalysisPage,
                        },
                        {
                            path: 'budget',
                            name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET._NAME,
                            component: BudgetPage,
                        },
                    ],
                },
                {
                    path: 'budget/create',
                    name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET.CREATE._NAME,
                    props: true,
                    component: BudgetCreatePage,
                },
                {
                    path: 'budget/update/:budgetId',
                    name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET.UPDATE._NAME,
                    props: true,
                    component: BudgetUpdatePage,
                },
                {
                    path: 'budget/:budgetId',
                    name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET.DETAIL._NAME,
                    props: true,
                    component: BudgetDetailPage,
                },
            ],
        },
    ],
} as RouteConfig;
