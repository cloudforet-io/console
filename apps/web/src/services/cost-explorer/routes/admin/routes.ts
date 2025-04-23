import type { RouteConfig } from 'vue-router';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostDataSourceListParameters } from '@/api-clients/cost-analysis/data-source/schema/api-verbs/list';
import type { DataSourceModel } from '@/schema/monitoring/data-source/model';

import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { UNIFIED_COST_KEY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import { DYNAMIC_COST_QUERY_SET_PARAMS, MANAGED_COST_QUERY_SET_IDS } from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import CostExplorerHome from '@/services/cost-explorer/pages/CostExplorerHome.vue';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';

const CostAdvancedSettingsContainer = () => import('@/services/cost-explorer/components/CostAdvancedSettingsContainer.vue');

const CostExplorerContainer = () => import('@/services/cost-explorer/CostExplorerContainer.vue');

const AdminBudgetMainPage = () => import('@/services/cost-explorer/pages/admin/AdminBudgetMainPage.vue');
// const AdminBudgetCreatePage = () => import('@/services/cost-explorer/pages/admin/AdminBudgetCreatePage.vue');
const AdminBudgetDetailPage = () => import('@/services/cost-explorer/pages/admin/AdminBudgetDetailPage.vue');
const AdminDomainSettingsAnomalyDetectionConfigurationPage = () => import('@/services/cost-explorer/pages/admin/AdminAdvancedSettingsAnomalyDetectionConfigurationPage.vue');
const AdminDomainSettingsCurrencyConverterPage = () => import('@/services/cost-explorer/pages/admin/AdminAdvancedSettingsCurrencyConverterPage.vue');

const AdminCostAnalysisPage = () => import('@/services/cost-explorer/pages/admin/AdminCostAnalysisPage.vue');
const CostReportPage = () => import('@/services/cost-explorer/pages/CostReportPage.vue');
const DataSourcesPage = () => import('@/services/cost-explorer/pages/admin/AdminDataSourcePage.vue');

const adminCostExplorerRoutes: RouteConfig = {
    path: 'cost-explorer',
    name: ADMIN_COST_EXPLORER_ROUTE._NAME,
    meta: {
        menuId: MENU_ID.COST_EXPLORER,
        translationId: MENU_INFO_MAP[MENU_ID.COST_EXPLORER].translationId,
    },
    redirect: () => ({ name: ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME }),
    component: CostExplorerContainer,
    children: [
        {
            path: 'landing',
            meta: { centeredLayout: true },
            name: ADMIN_COST_EXPLORER_ROUTE.LANDING._NAME,
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
                    name: ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    meta: { lsbVisible: true },
                    beforeEnter: async (to, from, next) => {
                        try {
                            const response = await SpaceConnector.clientV2.costAnalysis.dataSource.list<CostDataSourceListParameters, ListResponse<DataSourceModel>>();
                            const results = response?.results || [];
                            if (results.length === 0) { // none-data-source case
                                next({ name: ADMIN_COST_EXPLORER_ROUTE.LANDING._NAME });
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
                                    name: ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                                    params: {
                                        dataSourceId: UNIFIED_COST_KEY,
                                        costQuerySetId: MANAGED_COST_QUERY_SET_IDS.MONTHLY_PRODUCT,
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
                    name: ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                    meta: {
                        lsbVisible: true,
                        label: ({ params }) => (params.costQuerySetId === DYNAMIC_COST_QUERY_SET_PARAMS ? undefined : params.costQuerySetId),
                        copiable: ({ params }) => ![DYNAMIC_COST_QUERY_SET_PARAMS].includes(params.costQuerySetId),
                    },
                    props: true,
                    component: AdminCostAnalysisPage as any,
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
                    const response = await SpaceConnector.clientV2.costAnalysis.dataSource.list<CostDataSourceListParameters, ListResponse<DataSourceModel>>({
                        query: {
                            sort: [{ key: 'workspace_id', desc: true }],
                        },
                    });
                    const results = response?.results || [];
                    if (results.length === 0) { // none-data-source case
                        next({ name: ADMIN_COST_EXPLORER_ROUTE.LANDING._NAME });
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
                    name: ADMIN_COST_EXPLORER_ROUTE.BUDGET._NAME,
                    meta: { menuId: MENU_ID.BUDGET },
                    component: AdminBudgetMainPage as any,
                },
                // {
                //     path: 'create',
                //     name: ADMIN_COST_EXPLORER_ROUTE.BUDGET.CREATE._NAME,
                //     meta: { translationId: 'BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE_BUDGET' },
                //     component: AdminBudgetCreatePage as any,
                // },
                {
                    path: ':budgetId',
                    name: ADMIN_COST_EXPLORER_ROUTE.BUDGET.DETAIL._NAME,
                    props: true,
                    meta: { label: ({ params }) => params.budgetId, copiable: true },
                    component: AdminBudgetDetailPage as any,
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
                    const response = await SpaceConnector.clientV2.costAnalysis.dataSource.list<CostDataSourceListParameters, ListResponse<DataSourceModel>>();
                    const results = response?.results || [];
                    if (results.length === 0) { // none-data-source case
                        next({ name: ADMIN_COST_EXPLORER_ROUTE.LANDING._NAME });
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
                    name: ADMIN_COST_EXPLORER_ROUTE.COST_REPORT._NAME,
                    meta: { menuId: MENU_ID.COST_REPORT },
                    component: CostReportPage as any,
                },
            ],
        },
        {
            path: 'data-sources',
            meta: {
                menuId: MENU_ID.DATA_SOURCES,
                translationId: MENU_INFO_MAP[MENU_ID.DATA_SOURCES].translationId,
            },
            component: { template: '<router-view />' },
            beforeEnter: async (to, from, next) => {
                try {
                    const response = await SpaceConnector.clientV2.costAnalysis.dataSource.list<CostDataSourceListParameters, ListResponse<DataSourceModel>>();
                    const results = response?.results || [];
                    if (results.length === 0) { // none-data-source case
                        next({ name: ADMIN_COST_EXPLORER_ROUTE.LANDING._NAME });
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
                    name: ADMIN_COST_EXPLORER_ROUTE.DATA_SOURCES._NAME,
                    component: DataSourcesPage as any,
                },
            ],
        },
        {
            path: 'cost-advanced-settings',
            name: ADMIN_COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS._NAME,
            meta: {
                menuId: MENU_ID.COST_ADVANCED_SETTINGS,
                translationId: MENU_INFO_MAP[MENU_ID.COST_ADVANCED_SETTINGS].translationId,
            },
            redirect: () => ({
                name: ADMIN_COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS.ANOMALY_DETECTION_DOMAIN_CONFIGURATION._NAME,
            }),
            component: CostAdvancedSettingsContainer,
            children: [
                {
                    path: 'anomaly-detection-configuration',
                    name: ADMIN_COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS.ANOMALY_DETECTION_DOMAIN_CONFIGURATION._NAME,
                    meta: { lsbVisible: true, translationId: MENU_INFO_MAP[MENU_ID.ANOMALY_DETECTION_DOMAIN_CONFIGURATION].translationId, menuId: MENU_ID.ANOMALY_DETECTION_DOMAIN_CONFIGURATION },
                    component: AdminDomainSettingsAnomalyDetectionConfigurationPage,
                },
                {
                    path: 'currency-converter',
                    name: ADMIN_COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS.CURRENCY_CONVERTER._NAME,
                    meta: { lsbVisible: true, translationId: MENU_INFO_MAP[MENU_ID.CURRENCY_CONVERTER].translationId, menuId: MENU_ID.CURRENCY_CONVERTER },
                    component: AdminDomainSettingsCurrencyConverterPage,
                },
            ],
        },
    ],
};

export default adminCostExplorerRoutes;
