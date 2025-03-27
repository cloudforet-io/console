// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { computed, reactive } from 'vue';

import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostReportConfigListParameters } from '@/api-clients/cost-analysis/cost-report-config/schema/api-verbs/list';
import type { CostReportConfigModel } from '@/api-clients/cost-analysis/cost-report-config/schema/model';
import type { CostReportGetParameters } from '@/api-clients/cost-analysis/cost-report/schema/api-verbs/get';
import type { CostReportGetUrlParameters } from '@/api-clients/cost-analysis/cost-report/schema/api-verbs/get-url';
import type { CostReportListParameters } from '@/api-clients/cost-analysis/cost-report/schema/api-verbs/list';
import type { CostReportModel, CostReportDataLinkInfoModel } from '@/api-clients/cost-analysis/cost-report/schema/model';

import type { Currency } from '@/store/display/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CostReportItem } from '@/services/cost-explorer/types/cost-report-data-type';

export const useCostReportPageStore = defineStore('page-cost-report', () => {
    const state = reactive({
        activeTab: 'overview',
        //
        reportConfigLoading: false,
        costReportConfig: null as CostReportConfigModel|null|undefined,
        //
        recentReportDataLoading: false,
        hasReport: false,
        recentReportMonth: undefined as string|undefined,
        recentIssueDate: undefined as string|undefined,
        //
        reportListLoading: false,
        reportListTotalCount: 0,
        reportListItems: [] as CostReportModel[],
        //
        workspaceUserLoading: false,
        reportItem: {} as CostReportItem,
    });
    const getters = reactive({
        currency: computed<Currency|undefined>(() => state.costReportConfig?.currency),
        language: computed<string|undefined>(() => state.costReportConfig?.language),
        issueDay: computed<number>(() => state.costReportConfig?.issue_day ?? 10),
        reportItemData: computed<CostReportItem>(() => ({
            ...state.reportItem,
            recipients: state.costReportConfig?.recipients,
        })),
    });

    /* Mutations */
    const setCostReportConfig = (costReportConfig: CostReportConfigModel|null|undefined) => {
        state.costReportConfig = costReportConfig;
    };

    /* Actions */
    const fetchApiHelper = new ApiQueryHelper().setSort('created_at', true);
    const fetchCostReportConfig = async () => {
        if (state.costReportConfig !== null) return;
        try {
            state.reportConfigLoading = true;
            const { results } = await SpaceConnector.clientV2.costAnalysis.costReportConfig.list<CostReportConfigListParameters, ListResponse<CostReportConfigModel>>({
                query: fetchApiHelper.data,
            });
            state.costReportConfig = results?.[0];
        } catch (e) {
            ErrorHandler.handleError(e);
            state.costReportConfig = undefined;
        } finally {
            state.reportConfigLoading = false;
        }
    };

    const fetchCostReportsList = async (params?: CostReportListParameters): Promise<void> => {
        state.reportListLoading = true;
        try {
            const _params: CostReportListParameters = {
                ...params,
                query: {
                    ...params?.query,
                    filter: [
                        ...(params?.query?.filter || []),
                        { k: 'cost_report_config_id', v: state.costReportConfig?.cost_report_config_id, o: 'eq' },
                    ],
                },
            };
            const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.costReport.list<CostReportListParameters, ListResponse<CostReportModel>>(_params);
            state.reportListItems = results || [];
            state.reportListTotalCount = total_count || 0;
        } catch (e) {
            ErrorHandler.handleError(e);
        } finally {
            state.reportListLoading = false;
        }
    };

    const fetchCostReport = async (params: CostReportGetParameters): Promise<void> => {
        try {
            state.reportItem = await SpaceConnector.clientV2.costAnalysis.costReport.get<CostReportGetParameters, CostReportModel>(params);
        } catch (e) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };

    const getCostReportUrl = async (params: CostReportGetUrlParameters): Promise<string> => {
        try {
            const res = await SpaceConnector.clientV2.costAnalysis.costReport.getUrl<CostReportGetUrlParameters, CostReportDataLinkInfoModel>(params);
            return res.cost_report_link;
        } catch (e) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };

    const fetchRecentReportData = async (costReportConfigId?: string) => {
        if (!costReportConfigId) return;
        try {
            state.recentReportDataLoading = true;
            const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.costReport.list<CostReportListParameters, ListResponse<CostReportModel>>({
                status: 'SUCCESS',
                query: {
                    only: ['report_month', 'issue_date'],
                    filter: [
                        { k: 'cost_report_config_id', v: costReportConfigId, o: 'eq' },
                    ],
                },
            });
            const reportMonthList: string[] = results?.map((report) => report.report_month) ?? [];
            const issueDateList: string[] = results?.map((report) => report.issue_date) ?? [];
            state.recentReportMonth = reportMonthList.sort((a, b) => (dayjs.utc(b).isSameOrAfter(dayjs.utc(a)) ? 1 : -1))[0];
            state.recentIssueDate = issueDateList.sort((a, b) => (dayjs.utc(b).isSameOrAfter(dayjs.utc(a)) ? 1 : -1))[0];
            state.hasReport = (total_count ?? 0) > 0;
        } catch (e) {
            ErrorHandler.handleError(e);
        } finally {
            state.recentReportDataLoading = false;
        }
    };

    const mutations = {
        setCostReportConfig,
    };

    return {
        state,
        getters,
        ...mutations,
        fetchCostReportsList,
        fetchCostReport,
        getCostReportUrl,
        fetchCostReportConfig,
        fetchRecentReportData,
    };
});
