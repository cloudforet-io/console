import { computed, reactive } from 'vue';

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostReportConfigListParameters } from '@/schema/cost-analysis/cost-report-config/api-verbs/list';
import type { CostReportConfigModel } from '@/schema/cost-analysis/cost-report-config/model';

import ErrorHandler from '@/common/composables/error/errorHandler';


export const useCostReportPageStore = defineStore('cost-report-page', () => {
    const state = reactive({
        costReportConfig: null as CostReportConfigModel|null|undefined,
    });
    const getters = reactive({
        issueDay: computed<number>(() => state.costReportConfig?.issue_day ?? 10),
        recentReportDate: computed<Dayjs>(() => {
            const today = dayjs.utc();
            if (Number(today.format('D')) < getters.issueDay) {
                return today.subtract(2, 'month');
            }
            return today.subtract(1, 'month');
        }),
    });

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

    (async () => {
        await fetchCostReportConfig();
    })();

    return {
        state,
        getters,
        fetchCostReportConfig,
    };
});
