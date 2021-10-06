import { RouteConfig } from 'vue-router';
import BudgetDetailPage from '@/services/billing/cost-management/budget/budget-detail/BudgetDetailPage.vue';

const CostManagementPage = () => import(/* webpackChunkName: "CostManagementPage" */ '@/services/billing/cost-management/CostManagementPage.vue');

const CostAnalysisPage = () => import(/* webpackChunkName: "CostAnalysisPage" */ '@/services/billing/cost-management/cost-analysis/CostAnalysisPage.vue');
const BudgetPage = () => import(/* webpackChunkName: "BudgetPage" */ '@/services/billing/cost-management/budget/BudgetPage.vue');


export const BILLING_ROUTE = Object.freeze({
    _NAME: 'billing',
    COST_MANAGEMENT: {
        _NAME: 'costManagement',
        COST_ANALYSIS: { _NAME: 'costAnalysis' },
        BUDGET: {
            _NAME: 'budget',
            DETAIL: { _NAME: 'budgetDetail' },
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
                            path: 'cost-analysis',
                            name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
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
                    path: 'budget/:id',
                    name: BILLING_ROUTE.COST_MANAGEMENT.BUDGET.DETAIL._NAME,
                    props: true,
                    component: BudgetDetailPage,
                },
            ],
        },
    ],
} as RouteConfig;
