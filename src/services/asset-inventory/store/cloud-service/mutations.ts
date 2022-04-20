import { Mutation } from 'vuex';
import { CloudServiceStoreState } from '@/services/asset-inventory/store/cloud-service/type';
import { CloudServiceCategory } from '@/services/asset-inventory/cloud-service/type';


export const setSelectedProvider: Mutation<CloudServiceStoreState> = (state, provider: string) => {
    state.selectedProvider = provider;
};

export const setSelectedCategories: Mutation<CloudServiceStoreState> = (state, categories: CloudServiceCategory[]) => {
    state.selectedCategories = categories;
};

export const setSelectedRegions: Mutation<CloudServiceStoreState> = (state, regions: string[]) => {
    state.selectedRegions = regions;
};
