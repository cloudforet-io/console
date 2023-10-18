import type { RouteConfig } from 'vue-router';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { DYNAMIC_COST_QUERY_SET_PARAMS, MANAGED_COST_QUERY_SET_IDS } from '@/services/cost-explorer/cost-analysis/config';
import CostExplorerHome from '@/services/cost-explorer/CostExplorerHome.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';

const CostExplorerContainer = () => import('@/services/cost-explorer/CostExplorerContainer.vue');

const CostAnalysisPage = () => import('@/services/cost-explorer/cost-analysis/CostAnalysisPage.vue');
const BudgetMainPage = () => import('@/services/cost-explorer/budget/budget-main/BudgetMainPage.vue');
const BudgetCreatePage = () => import('@/services/cost-explorer/budget/budget-create/BudgetCreatePage.vue');
const BudgetDetailPage = () => import('@/services/cost-explorer/budget/budget-detail/BudgetDetailPage.vue');

const costExplorerRoutes: RouteConfig = {
    path: 'cost-explorer',
    name: COST_EXPLORER_ROUTE._NAME,
    meta: { menuId: MENU_ID.COST_EXPLORER, accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
    redirect: () => getRedirectRouteByPagePermission(MENU_ID.COST_EXPLORER, store.getters['user/pagePermissionMap']),
    component: CostExplorerContainer,
    children: [
        {
            path: 'landing',
            meta: { menuId: MENU_ID.COST_EXPLORER_LANDING, centeredLayout: true },
            name: COST_EXPLORER_ROUTE.LANDING._NAME,
            component: CostExplorerHome as any,
        },
        {
            path: 'cost-analysis',
            meta: { menuId: MENU_ID.COST_EXPLORER_COST_ANALYSIS },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    meta: { lnbVisible: true },
                    beforeEnter: async (to, from, next) => {
                        try {
                            const response = await SpaceConnector.clientV2.costAnalysis.dataSource.list();
                            const results = response?.results || [];
                            if (results.length === 0) { // none-data-source case
                                next({ name: COST_EXPLORER_ROUTE.LANDING._NAME });
                            } else if (to.params.dataSourceId && to.params.costQuerySetId) {
                                next();
                            } else {
                                next({
                                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                                    params: {
                                        dataSourceId: results[0].data_source_id,
                                        costQuerySetId: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
                                    },
                                });
                            }
                        } catch (e) {
                            ErrorHandler.handleError(e);
                        }
                    },
                },
                {
                    path: ':dataSourceId/:costQuerySetId',
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                    meta: {
                        lnbVisible: true,
                        label: ({ params }) => (params.costQuerySetId === DYNAMIC_COST_QUERY_SET_PARAMS ? undefined : params.costQuerySetId),
                        copiable: ({ params }) => ![DYNAMIC_COST_QUERY_SET_PARAMS].includes(params.costQuerySetId),
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
            beforeEnter: async (to, from, next) => {
                try {
                    const response = await SpaceConnector.clientV2.costAnalysis.dataSource.list();
                    const results = response?.results || [];
                    if (results.length === 0) { // none-data-source case
                        next({ name: COST_EXPLORER_ROUTE.LANDING._NAME });
                    } else {
                        next();
                    }
                } catch (e) {
                    ErrorHandler.handleError(e);
                }
            },
            children: [
                {
                    path: '/',
                    name: COST_EXPLORER_ROUTE.BUDGET._NAME,
                    meta: { lnbVisible: true },
                    component: BudgetMainPage as any,
                },
                {
                    path: 'create',
                    name: COST_EXPLORER_ROUTE.BUDGET.CREATE._NAME,
                    meta: { translationId: 'BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE_BUDGET', accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION },
                    component: BudgetCreatePage as any,
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
