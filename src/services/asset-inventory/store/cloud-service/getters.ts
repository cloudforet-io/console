import { CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/cloud-service/lib/config';
import { Getter } from 'vuex';
import { CloudServiceStoreState } from '@/services/asset-inventory/store/cloud-service/type';

export const selectedCategories: Getter<CloudServiceStoreState, any> = (state): string[] => state.additionalFilters[CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY] ?? [];
export const selectedRegions: Getter<CloudServiceStoreState, any> = (state): string[] => state.additionalFilters[CLOUD_SERVICE_FILTER_KEY.REGION] ?? [];
