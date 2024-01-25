import { computed, reactive } from 'vue';

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostReportConfigListParameters } from '@/schema/cost-analysis/cost-report-config/api-verbs/list';
import type { CostReportConfigModel } from '@/schema/cost-analysis/cost-report-config/model';
import type { CostReportGetParameters } from '@/schema/cost-analysis/cost-report/api-verbs/get';
import type { CostReportListParameters } from '@/schema/cost-analysis/cost-report/api-verbs/list';
import type { CostReportModel } from '@/schema/cost-analysis/cost-report/model';

import ErrorHandler from '@/common/composables/error/errorHandler';


export const useCostReportPageStore = defineStore('cost-report-page', () => {
    const state = reactive({
        costReportConfig: null as CostReportConfigModel|null|undefined,
        //
        reportListLoading: false,
        reportListTotalCount: 0,
        reportListItems: [] as CostReportModel[],
        //
        reportItem: {} as CostReportModel,
    });
    const getters = reactive({
        currency: computed<string>(() => state.costReportConfig?.currency ?? 'KRW'),
        issueDay: computed<number>(() => state.costReportConfig?.issue_day ?? 10),
        recentIssueDate: computed<Dayjs>(() => {
            const today = dayjs.utc();
            if (Number(today.format('D')) < getters.issueDay) {
                return today.subtract(1, 'month').date(getters.issueDay);
            }
            return today.date(getters.issueDay);
        }),
        recentReportDate: computed<Dayjs>(() => {
            const today = dayjs.utc();
            if (Number(today.format('D')) < getters.issueDay) {
                return today.subtract(2, 'month');
            }
            return today.subtract(1, 'month');
        }),
    });

    /* Mutations */
    const setCostReportConfig = (costReportConfig: CostReportConfigModel|null|undefined) => {
        state.costReportConfig = costReportConfig;
    };

    const fetchCostReportConfig = async () => {
        if (state.costReportConfig !== null) return;
        try {
            const { results } = await SpaceConnector.clientV2.costAnalysis.costReportConfig.list<CostReportConfigListParameters, ListResponse<CostReportConfigModel>>();
            state.costReportConfig = results?.[0];
        } catch (e) {
            ErrorHandler.handleError(e);
            state.costReportConfig = undefined;
        }
    };

    const fetchCostReportsList = async (): Promise<void> => {
        state.reportListLoading = true;
        try {
            const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.costReport.list<CostReportListParameters, ListResponse<CostReportModel>>();
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

    const mutations = {
        setCostReportConfig,
    };

    (async () => {
        await fetchCostReportConfig();
    })();

    return {
        state,
        getters,
        ...mutations,
        fetchCostReportConfig,
        fetchCostReportsList,
        fetchCostReport,
    };
});
