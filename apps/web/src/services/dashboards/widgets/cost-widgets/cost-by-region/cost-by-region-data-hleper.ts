import { groupBy, sum } from 'lodash';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';

import { CONTINENT_INFO } from '@/services/dashboards/widgets/_configs/continent-config';


export interface Data {
    cost_sum: { date: string; value: number }[];
    _total_cost_sum: number;
    provider: string;
    [groupBy: string]: any;
}

export const getRefinedMapChartData = (results: Data[]|null, regions: RegionReferenceMap, providers: ProviderReferenceMap): MapChartData[] => {
    if (!results) return [];
    const costDataByProvider = getCostDataByProvider(results, regions);
    return Object.keys(costDataByProvider).map((continent) => ({
        title: CONTINENT_INFO[continent]?.continent_label,
        continent_code: CONTINENT_INFO[continent]?.continent_code,
        latitude: CONTINENT_INFO[continent]?.latitude,
        longitude: CONTINENT_INFO[continent]?.longitude,
        width: 48,
        height: 48,
        pieChartData: Object.entries(costDataByProvider[continent]).map(([provider, cost]) => ({
            category: providers[provider]?.label || provider,
            color: providers[provider]?.color || '',
            provider,
            value: cost as number,
            pieSettings: {
                fill: providers[provider]?.color || '',
                stroke: providers[provider]?.color || '',
            },
        })),
    }));
};

const getCostDataByProvider = (results: Data[], regions: RegionReferenceMap): CostDataByProvider => {
    const data = results.map((d) => ({
        ...d,
        continent_code: regions[d.region_code]?.continent?.continent_code,
    }));
    const continentGroupBy = groupBy(data, 'continent_code');
    const result = {};
    Object.entries(continentGroupBy).forEach(([continent, cItem]) => {
        const providerGroupBy = groupBy(cItem, 'provider');
        Object.entries(providerGroupBy).forEach(([provider, pItem]) => {
            if (continent && continent !== 'undefined' && provider && provider !== 'undefined') {
                const providerCost = sum(pItem.map((d) => (d as any).cost_sum));
                if (result[continent]) result[continent][provider] = providerCost;
                else result[continent] = { [provider]: providerCost };
            }
        });
    });
    return result;
};

interface CostDataByProvider {
    [continent: string]: {
        [provider: string]: number;
    }
}
interface PieChartData {
    category: string;
    color: string;
    provider: string;
    value: number;
    pieSettings: {
        fill: string;
        stroke: string;
    }
}
export interface MapChartData {
    title: string;
    continent_code?: string;
    latitude: number;
    longitude: number;
    height: number;
    width: number;
    pieChartData: PieChartData[];
}
