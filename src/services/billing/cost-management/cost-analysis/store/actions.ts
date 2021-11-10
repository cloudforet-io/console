import { Action } from 'vuex';

import { CostAnalysisStoreState } from '@/services/billing/cost-management/cost-analysis/store/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';


export const getSelectedQueryItem: Action<CostAnalysisStoreState, any> = async ({ commit }, queryItemId): Promise<void|Error> => {
    try {
        const { options } = await SpaceConnector.client.costAnalysis.costQuerySet.get({ cost_query_set_id: queryItemId });
        commit('setChartType', options.chart_type);
        commit('setGranularity', options.granularity);
        commit('setGroupByItems', options.group_by);
        commit('setSelectedDates', [options.start, options.end]);
        commit('setCurrency', options.currency);
        commit('setFilters', options.filter);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
