import { CATEGORY } from '@/services/asset-management/cloud-service/lib/config';

export interface CloudServiceStoreState {
    selectedProvider: string;
    selectedCategories: CATEGORY[];
    selectedRegions: string[];
}
