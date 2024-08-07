import type { RouteConfig } from 'vue-router';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

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
// const AnomalyDetectionConfigurationPage = () => import('@/services/cost-explorer/pages/AnomalyDetectionConfigurationPage.vue');
// const AnomalyDetectionConfigurationCreatePage = () => import('@/services/cost-explorer/pages/AnomalyDetectionConfigurationCreatePage.vue');
// const AnomalyDetectionConfigurationDetailPage = () => import('@/services/cost-explorer/pages/AnomalyDetectionConfigurationDetailPage.vue');
// const AnomalyDetectionPolicyPage = () => import('@/services/cost-explorer/pages/AnomalyDetectionPolicyPage.vue');
// const AnomalyDetectionHistoryPage = () => import('@/services/cost-explorer/pages/AnomalyDetectionHistoryPage.vue');
// const AnomalyDetectionHistoryDetailPage = () => import('@/services/cost-explorer/pages/AnomalyDetectionHistoryDetailPage.vue');

const costExplorerRoutes: RouteConfig = {
    path: 'cost-explorer',
    name: COST_EXPLORER_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.COST_EXPLORER,
        translationId: MENU_INFO_MAP[MENU_ID.COST_EXPLORER].translationId,
    },
    redirect: (to) => getRedirectRouteByPagePermission(to, store.getters['user/pageAccessPermissionMap']),
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
                                next({
                                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                                    params: {
                                        dataSourceId: results[0].data_source_id,
                                        costQuerySetId: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PROJECT,
                                        workspaceId,
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
                        lsbVisible: true,
                        label: ({ params }) => (params.costQuerySetId === DYNAMIC_COST_QUERY_SET_PARAMS ? undefined : params.costQuerySetId),
                        copiable: ({ params }) => ![DYNAMIC_COST_QUERY_SET_PARAMS].includes(params.costQuerySetId),
                    },
                    props: true,
                    component: CostAnalysisPage as any,
                },
            ],
        },
        // {
        //     path: 'anomaly-detection',
        //     name: COST_EXPLORER_ROUTE.ANOMALY_DETECTION._NAME,
        //     meta: {
        //         menuId: MENU_ID.ANOMALY_DETECTION,
        //         translationId: MENU_INFO_MAP[MENU_ID.ANOMALY_DETECTION].translationId,
        //     },
        //     redirect: () => ({
        //         name: COST_EXPLORER_ROUTE.ANOMALY_DETECTION.CONFIGURATION._NAME,
        //     }),
        //     component: { template: '<router-view />' },
        //     children: [
        //         {
        //             path: 'config',
        //             name: COST_EXPLORER_ROUTE.ANOMALY_DETECTION.CONFIGURATION._NAME,
        //             meta: {
        //                 menuId: MENU_ID.ANOMALY_DETECTION_CONFIGURATION,
        //                 translationId: 'BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.TITLE',
        //             },
        //             component: { template: '<router-view />' },
        //             children: [
        //                 {
        //                     path: '/',
        //                     name: COST_EXPLORER_ROUTE.ANOMALY_DETECTION.CONFIGURATION._NAME,
        //                     meta: {
        //                         lsbVisible: true,
        //                         menuId: MENU_ID.ANOMALY_DETECTION_CONFIGURATION,
        //                     },
        //                     component: AnomalyDetectionConfigurationPage as any,
        //                 },
        //                 {
        //                     path: 'create',
        //                     name: COST_EXPLORER_ROUTE.ANOMALY_DETECTION.CONFIGURATION.CREATE._NAME,
        //                     meta: { translationId: 'BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.CREATE_TITLE' },
        //                     component: AnomalyDetectionConfigurationCreatePage as any,
        //                 },
        //                 {
        //                     path: ':configId',
        //                     name: COST_EXPLORER_ROUTE.ANOMALY_DETECTION.CONFIGURATION.DETAIL._NAME,
        //                     props: true,
        //                     meta: { label: ({ params }) => params.budgetId },
        //                     component: AnomalyDetectionConfigurationDetailPage as any,
        //                 },
        //             ],
        //         },
        //         {
        //             path: 'policy',
        //             name: COST_EXPLORER_ROUTE.ANOMALY_DETECTION.POLICY._NAME,
        //             meta: {
        //                 lsbVisible: true,
        //                 menuId: MENU_ID.ANOMALY_DETECTION_POLICY,
        //                 translationId: 'BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.POLICY.TITLE',
        //             },
        //             component: AnomalyDetectionPolicyPage as any,
        //         },
        //         {
        //             path: 'history',
        //             name: COST_EXPLORER_ROUTE.ANOMALY_DETECTION.HISTORY._NAME,
        //             meta: {
        //                 menuId: MENU_ID.ANOMALY_DETECTION_HISTORY,
        //                 translationId: 'BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.HISTORY.TITLE',
        //             },
        //             component: { template: '<router-view />' },
        //             children: [
        //                 {
        //                     path: '/',
        //                     name: COST_EXPLORER_ROUTE.ANOMALY_DETECTION.HISTORY._NAME,
        //                     meta: {
        //                         lsbVisible: true,
        //                         menuId: MENU_ID.ANOMALY_DETECTION_HISTORY,
        //                     },
        //                     component: AnomalyDetectionHistoryPage as any,
        //                 },
        //                 {
        //                     path: ':historyId',
        //                     name: COST_EXPLORER_ROUTE.ANOMALY_DETECTION.HISTORY.DETAIL._NAME,
        //                     props: true,
        //                     meta: { label: ({ params }) => params.historyId },
        //                     component: AnomalyDetectionHistoryDetailPage as any,
        //                 },
        //             ],
        //         },
        //     ],
        // },
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
