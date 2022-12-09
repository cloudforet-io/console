import type { Getter } from 'vuex';

import { orderBy } from 'lodash';

import { GROUP_BY_ITEM_MAP, MORE_GROUP_BY } from '@/services/cost-explorer/lib/config';
import { getRefinedCostQueryOptions } from '@/services/cost-explorer/lib/helper';
import type {
    CostAnalysisStoreState, GroupByItem,
} from '@/services/cost-explorer/store/cost-analysis/type';
import type { CostQuerySetModel, MoreGroupByItem, CostQuerySetOption } from '@/services/cost-explorer/type';

export const groupByItems: Getter<CostAnalysisStoreState, any> = ({ groupBy }): GroupByItem[] => groupBy.map((d) => GROUP_BY_ITEM_MAP[d]);

export const selectedQuerySet: Getter<CostAnalysisStoreState, any> = ({ selectedQueryId, costQueryList }): CostQuerySetModel|undefined => {
    if (!selectedQueryId) return undefined;

    return costQueryList.find((item) => item.cost_query_set_id === selectedQueryId);
};

export const currentQuerySetOptions: Getter<CostAnalysisStoreState, any> = ({
    stack, granularity, groupBy, primaryGroupBy, moreGroupBy, period, filters,
}): CostQuerySetOption => getRefinedCostQueryOptions({
    stack,
    granularity,
    group_by: groupBy,
    primary_group_by: primaryGroupBy,
    more_group_by: moreGroupBy,
    period,
    filters,
}) as CostQuerySetOption;

export const orderedMoreGroupByItems: Getter<CostAnalysisStoreState, any> = ({ moreGroupBy }): MoreGroupByItem[] => {
    if (!moreGroupBy?.length) return [];
    const tags = moreGroupBy.filter((d) => d.category === MORE_GROUP_BY.TAGS);
    const additionalInfo = moreGroupBy.filter((d) => d.category === MORE_GROUP_BY.ADDITIONAL_INFO);
    const orderedTags = orderBy(tags, [(d) => d.key]);
    const orderedAdditionalInfo = orderBy(additionalInfo, [(d) => d.key]);
    return [...orderedTags, ...orderedAdditionalInfo];
};
