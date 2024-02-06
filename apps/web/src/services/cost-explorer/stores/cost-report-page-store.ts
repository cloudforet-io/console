import { computed, reactive } from 'vue';

import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostReportConfigListParameters } from '@/schema/cost-analysis/cost-report-config/api-verbs/list';
import type { CostReportConfigModel } from '@/schema/cost-analysis/cost-report-config/model';
import type { CostReportGetParameters } from '@/schema/cost-analysis/cost-report/api-verbs/get';
import type { CostReportGetUrlParameters } from '@/schema/cost-analysis/cost-report/api-verbs/get-url';
import type { CostReportListParameters } from '@/schema/cost-analysis/cost-report/api-verbs/list';
import type { CostReportModel, CostReportDataLinkInfoModel } from '@/schema/cost-analysis/cost-report/model';
import type { RoleType } from '@/schema/identity/role/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface CostReportItem extends CostReportModel {
    recipients?: {
        role_types: RoleType[];
        emails: string[];
    };
    report_url?: string;
}

export const useCostReportPageStore = defineStore('cost-report-page', () => {
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
        currency: computed<string|undefined>(() => state.costReportConfig?.currency),
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
    const fetchCostReportConfig = async () => {
        if (state.costReportConfig !== null) return;
        try {
            state.reportConfigLoading = true;
            const { results } = await SpaceConnector.clientV2.costAnalysis.costReportConfig.list<CostReportConfigListParameters, ListResponse<CostReportConfigModel>>();
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
            const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.costReport.list<CostReportListParameters, ListResponse<CostReportModel>>({
                ...params,
                status: 'SUCCESS',
            });
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

    const fetchRecentReportData = async () => {
        try {
            state.recentReportDataLoading = true;
            const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.costReport.list<CostReportListParameters, ListResponse<CostReportModel>>({
                status: 'SUCCESS',
                query: {
                    only: ['report_month', 'issue_date'],
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
