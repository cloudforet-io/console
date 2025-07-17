import { useRegionApi } from '@/api-clients/inventory/region/composables/use-region-api';
import type { RegionModel } from '@/api-clients/inventory/region/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';

const CONTINENT_LABEL_MAP = {
    africa: 'Africa',
    europe: 'Europe',
    north_america: 'North America',
    south_america: 'South America',
    asia_pacific: 'Asia Pacific',
    middle_east: 'Middle East',
};
export type RegionReferenceItem = ReferenceItem<RegionModel>;
export type RegionReferenceMap = ReferenceMap<RegionReferenceItem>;

export const useRegionReferenceDataModel = () => {
    const { regionAPI } = useRegionApi();
    const fetchConfig: ReferenceDataModelFetchConfig<RegionModel> = {
        listFetcher: regionAPI.list,
        query: {
            only: ['name', 'region_code', 'tags', 'provider'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<RegionModel, RegionReferenceItem>(
        RESOURCE_CONFIG_MAP.region.resourceKey,
        (regionInfo: RegionModel) => {
            const regionKey = regionInfo.region_code === 'global' ? `${regionInfo.region_code}-${regionInfo.provider}` : regionInfo.region_code;
            return {
                key: regionKey,
                label: `${regionInfo.name} | ${regionInfo.region_code}`,
                name: regionInfo.name,
                continent: {
                    continent_code: regionInfo.tags?.continent,
                    continent_label: regionInfo.tags?.continent ? CONTINENT_LABEL_MAP[regionInfo.tags.continent] : '',
                    latitude: regionInfo.tags?.latitude ?? 0,
                    longitude: regionInfo.tags?.longitude ?? 0,
                },
                data: {
                    provider: regionInfo.provider,
                },
            };
        },
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
