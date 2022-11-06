import type { Getter } from 'vuex';

import type { QueryStoreFilter } from '@cloudforet/core-lib/query/type';

import { CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/cloud-service/lib/config';
import type { CloudServiceCategory } from '@/services/asset-inventory/cloud-service/type';
import type { CloudServiceStoreState } from '@/services/asset-inventory/store/cloud-service/type';

export const selectedCategories: Getter<CloudServiceStoreState, any> = (state): CloudServiceCategory[] => state.additionalFilters[CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY] ?? [];
export const selectedRegions: Getter<CloudServiceStoreState, any> = (state): string[] => state.additionalFilters[CLOUD_SERVICE_FILTER_KEY.REGION] ?? [];
export const allFilters: Getter<CloudServiceStoreState, any> = (state, getters): QueryStoreFilter[] => {
    const filters: QueryStoreFilter[] = [];
    if (state.selectedProvider !== 'all') {
        filters.push({ k: 'provider', v: state.selectedProvider, o: '=' });
    }
    if (getters.selectedRegions.length) {
        filters.push({ k: CLOUD_SERVICE_FILTER_KEY.REGION, v: getters.selectedRegions, o: '=' });
    }
    if (getters.selectedCategories.length) {
        filters.push({ k: CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY, v: getters.selectedCategories, o: '=' });
    }
    return filters.concat(state.searchFilters);
};
