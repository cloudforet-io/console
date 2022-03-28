import { CATEGORY } from '@/services/asset-inventory/cloud-service/lib/config';

export interface CloudServiceStoreState {
    selectedProvider: string;
    selectedCategories: CATEGORY[];
    selectedRegions: string[];
}
