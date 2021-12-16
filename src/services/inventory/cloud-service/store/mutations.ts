import { Mutation } from 'vuex';
import { CloudServiceStoreState } from '@/services/inventory/cloud-service/store/type';
import { CATEGORY } from '@/services/inventory/cloud-service/lib/config';


export const setSelectedProvider: Mutation<CloudServiceStoreState> = (state, provider: string) => {
    state.selectedProvider = provider;
};

export const setSelectedCategories: Mutation<CloudServiceStoreState> = (state, categories: CATEGORY[]) => {
    state.selectedCategories = categories;
};

export const setSelectedRegions: Mutation<CloudServiceStoreState> = (state, regions: string[]) => {
    state.selectedRegions = regions;
};
