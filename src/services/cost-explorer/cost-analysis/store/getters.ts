import { Getter } from 'vuex';
import {
    CostAnalysisStoreState, GroupByItem,
} from '@/services/cost-explorer/cost-analysis/store/type';
import { ReferenceItem } from '@/store/modules/reference/type';
import { GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { CostQueryFilterItemsMap, CostQuerySetModel } from '@/services/cost-explorer/type';
import { store } from '@/store';


export const filterItemsMap: Getter<CostAnalysisStoreState, any> = ({ filters }, getters, rootState): CostQueryFilterItemsMap => {
    const itemsMap: CostQueryFilterItemsMap = {};
    const resourceItemsMap = {
        project_id: rootState.reference.project.items,
        project_group_id: store.state.reference.projectGroup.items,
        service_account_id: rootState.reference.serviceAccount.items,
        provider: rootState.reference.provider.items,
        region_code: rootState.reference.region.items,
    };

    Object.entries(filters).forEach(([key, data]) => {
        const resourceItems = resourceItemsMap[key];
        if (resourceItems) {
            itemsMap[key] = data?.map((d) => {
                const resourceItem: ReferenceItem = resourceItems[d];
                const label = key === 'region_code' ? resourceItem?.name : resourceItem?.label;
                return { name: d, label: label ?? d };
            });
        } else itemsMap[key] = data?.map(d => ({ name: d, label: d }));
    });
    return itemsMap;
};

export const groupByItems: Getter<CostAnalysisStoreState, any> = ({ groupBy }): GroupByItem[] => groupBy.map(d => GROUP_BY_ITEM_MAP[d]);

export const selectedQuerySet: Getter<CostAnalysisStoreState, any> = ({ selectedQueryId, costQueryList }): CostQuerySetModel|undefined => {
    if (!selectedQueryId) return undefined;

    return costQueryList.find(item => item.cost_query_set_id === selectedQueryId);
};

type QuerySetOptions = Pick<CostAnalysisStoreState, 'stack'|'granularity'|'groupBy'|'primaryGroupBy'|'period'|'filters'>
export const currentQuerySetOptions: Getter<CostAnalysisStoreState, any> = ({
    stack, granularity, groupBy, primaryGroupBy, period, filters,
}): QuerySetOptions => ({
    stack,
    granularity,
    groupBy,
    primaryGroupBy,
    period,
    filters,
});
