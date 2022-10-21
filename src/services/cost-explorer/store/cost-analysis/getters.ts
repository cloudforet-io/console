import type { Getter } from 'vuex';

import { GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import type {
    CostAnalysisStoreState, GroupByItem,
} from '@/services/cost-explorer/store/cost-analysis/type';
import type { CostQuerySetModel } from '@/services/cost-explorer/type';


export const groupByItems: Getter<CostAnalysisStoreState, any> = ({ groupBy }): GroupByItem[] => groupBy.map(d => GROUP_BY_ITEM_MAP[d]);

export const selectedQuerySet: Getter<CostAnalysisStoreState, any> = ({ selectedQueryId, costQueryList }): CostQuerySetModel|undefined => {
    if (!selectedQueryId) return undefined;

    return costQueryList.find(item => item.cost_query_set_id === selectedQueryId);
};

type QuerySetOptions = Pick<CostAnalysisStoreState, 'stack'|'granularity'|'groupBy'|'primaryGroupBy'|'moreGroupBy'|'period'|'filters'>;
export const currentQuerySetOptions: Getter<CostAnalysisStoreState, any> = ({
    stack, granularity, groupBy, primaryGroupBy, moreGroupBy, period, filters,
}): QuerySetOptions => ({
    stack,
    granularity,
    groupBy,
    primaryGroupBy,
    moreGroupBy,
    period,
    filters,
});
