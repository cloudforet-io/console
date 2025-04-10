import { groupBy, sum } from 'lodash';


import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import type { RegionReferenceMap } from '@/store/reference/region-reference-store';


interface ContinentInfo {
    continent_code: string;
    continent_label: string;
    latitude: number;
    longitude: number;
}

const CONTINENT_INFO: Record<string, ContinentInfo> = {
    africa: {
        continent_code: 'africa',
        continent_label: 'Africa',
        latitude: 11.081385,
        longitude: 21.621094,
    },
    europe: {
        continent_code: 'europe',
        continent_label: 'Europe',
        latitude: 50.896104,
        longitude: 19.160156,
    },
    north_america: {
        continent_code: 'north_america',
        continent_label: 'North America',
        latitude: 39.563353,
        longitude: -99.316406,
    },
    south_america: {
        continent_code: 'south_america',
        continent_label: 'South America',
        latitude: -13.6631791,
        longitude: -69.6417454,
    },
    asia_pacific: {
        continent_code: 'asia_pacific',
        continent_label: 'Asia Pacific',
        longitude: 103.183594,
        latitude: 47.212106,
    },
    middle_east: {
        continent_code: 'middle_east',
        continent_label: 'Middle East',
        longitude: 26.3842897,
        latitude: 26.8448363,
    },
};

export interface Data {
    value_sum: { date: string; value: number }[];
    _total_value_sum: number;
    provider: string;
    [dataField: string]: any;
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
                const providerCost = sum(pItem.map((d) => (d as any).value_sum));
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
