import type { RouteConfig } from 'vue-router';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { DYNAMIC_COST_QUERY_SET_PARAMS, MANAGED_COST_QUERY_SET_IDS } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import CostExplorerHome from '@/services/cost-explorer/pages/CostExplorerHome.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

const CostExplorerContainer = () => import('@/services/cost-explorer/CostExplorerContainer.vue');

const CostAnalysisPage = () => import('@/services/cost-explorer/pages/CostAnalysisPage.vue');
const BudgetMainPage = () => import('@/services/cost-explorer/pages/BudgetMainPage.vue');
const BudgetCreatePage = () => import('@/services/cost-explorer/pages/BudgetCreatePage.vue');
const BudgetDetailPage = () => import('@/services/cost-explorer/pages/BudgetDetailPage.vue');
const CostReportPage = () => import('@/services/cost-explorer/pages/CostReportPage.vue');


const costExplorerRoutes: RouteConfig = {
    path: 'cost-explorer',
    name: COST_EXPLORER_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.COST_EXPLORER,
        translationId: MENU_INFO_MAP[MENU_ID.COST_EXPLORER].translationId,
    },
    redirect: (to) => getRedirectRouteByPagePermission(to),
    component: CostExplorerContainer,
    children: [
        {
            path: 'landing',
            meta: { centeredLayout: true },
            name: COST_EXPLORER_ROUTE.LANDING._NAME,
            component: CostExplorerHome as any,
        },
        {
            path: 'cost-analysis',
            meta: {
                menuId: MENU_ID.COST_ANALYSIS,
                translationId: MENU_INFO_MAP[MENU_ID.COST_ANALYSIS].translationId,
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    meta: { lsbVisible: true },
                    beforeEnter: async (to, from, next) => {
                        try {
                            const workspaceId = to.params.workspaceId;
                            const response = await SpaceConnector.clientV2.costAnalysis.dataSource.list({
                                query: {
                                    sort: [{ key: 'workspace_id', desc: false }],
                                },
                            });
                            const results = response?.results || [];
                            if (results.length === 0) { // none-data-source case
                                next({
                                    name: COST_EXPLORER_ROUTE.LANDING._NAME,
                                    params: { workspaceId },
                                });
                            } else if (to.params.dataSourceId && to.params.costQuerySetId) {
                                next();
                            } else {
                                const normalizedQuery = { ...to.query };
                                if (normalizedQuery.project) {
                                    normalizedQuery.project_id = normalizedQuery.project;
                                    delete normalizedQuery.project;
                                }
                                if (normalizedQuery.service_account) {
                                    normalizedQuery.service_account_id = normalizedQuery.service_account;
                                    delete normalizedQuery.service_account;
                                }
                                next({
                                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                                    params: {
                                        dataSourceId: results[0].data_source_id,
                                        costQuerySetId: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
                                        workspaceId,
                                    },
                                    query: normalizedQuery,
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
                        lsbVisible: true,
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
            meta: {
                menuId: MENU_ID.BUDGET,
                translationId: MENU_INFO_MAP[MENU_ID.BUDGET].translationId,
            },
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
                    meta: { menuId: MENU_ID.BUDGET },
                    component: BudgetMainPage as any,
                },
                {
                    path: 'create',
                    name: COST_EXPLORER_ROUTE.BUDGET.CREATE._NAME,
                    meta: { translationId: 'BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE_BUDGET' },
                    component: BudgetCreatePage as any,
                },
                {
                    path: ':budgetId',
                    name: COST_EXPLORER_ROUTE.BUDGET.DETAIL._NAME,
                    props: true,
                    meta: { label: ({ params }) => params.budgetId, copiable: true },
                    component: BudgetDetailPage as any,
                },
            ],
        },
        {
            path: 'cost-report',
            meta: {
                menuId: MENU_ID.COST_REPORT,
                translationId: MENU_INFO_MAP[MENU_ID.COST_REPORT].translationId,
            },
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
                    name: COST_EXPLORER_ROUTE.COST_REPORT._NAME,
                    meta: { menuId: MENU_ID.COST_REPORT },
                    component: CostReportPage as any,
                },
            ],
        },
    ],
};

export default costExplorerRoutes;
