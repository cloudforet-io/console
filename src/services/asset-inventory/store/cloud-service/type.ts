import { CloudServiceCategory } from '@/services/asset-inventory/cloud-service/type';

export interface CloudServiceStoreState {
    selectedProvider: string;
    selectedCategories: CloudServiceCategory[];
    selectedRegions: string[];
}
