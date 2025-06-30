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
import { useCostReportApi } from '@/api-clients/cost-analysis/cost-report/composables/use-cost-report-api';

import type { Currency } from '@/store/display/type';

import ErrorHandler from '@/common/composables/error/errorHandler';


const { costReportAPI } = useCostReportApi();
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
        workspaceUserLoading: false,
        selectedCostReportId: undefined as string|undefined,
    });
    const getters = reactive({
        currency: computed<Currency|undefined>(() => state.costReportConfig?.currency),
        language: computed<string|undefined>(() => state.costReportConfig?.language),
        issueDay: computed<number>(() => state.costReportConfig?.issue_day ?? 10),
    });

    /* Mutations */
    const setCostReportConfig = (costReportConfig: CostReportConfigModel|null|undefined) => {
        state.costReportConfig = costReportConfig;
    };

    const setSelectedCostReportId = (costReportId: string|undefined) => {
        state.selectedCostReportId = costReportId;
    };

    /* Actions */
    const fetchApiHelper = new ApiQueryHelper().setSort('created_at', true);
    const fetchCostReportConfig = async () => {
        if (state.costReportConfig !== null) return;
        try {
            state.reportConfigLoading = true;
            const { results } = await SpaceConnector.clientV2.costAnalysis.costReportConfig.list<CostReportConfigListParameters, ListResponse<CostReportConfigModel>>({
                query: {
                    ...fetchApiHelper.data,
                    sort: [{ key: 'created_at', desc: false }],
                },
            });
            state.costReportConfig = results?.[0];
        } catch (e) {
            ErrorHandler.handleError(e);
            state.costReportConfig = undefined;
        } finally {
            state.reportConfigLoading = false;
        }
    };

    const fetchRecentReportData = async (costReportConfigId?: string) => {
        if (!costReportConfigId) return;
        try {
            state.recentReportDataLoading = true;
            const { results, total_count } = await costReportAPI.list({
                status: 'DONE',
                query: {
                    only: ['report_month', 'issue_date'],
                    filter: [
                        { k: 'cost_report_config_id', v: costReportConfigId, o: 'eq' },
                    ],
                },
            });
            const reportMonthList: string[] = results?.map((report) => report.report_month) ?? [];
            const issueDateList: string[] = results?.map((report) => report.issue_date) ?? [];
            state.recentReportMonth = reportMonthList.sort((a, b) => dayjs.utc(b).valueOf() - dayjs.utc(a).valueOf())[0];
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
        setSelectedCostReportId,
    };

    return {
        state,
        getters,
        ...mutations,
        fetchCostReportConfig,
        fetchRecentReportData,
    };
});
