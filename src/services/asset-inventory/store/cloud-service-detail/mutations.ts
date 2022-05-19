import { Mutation } from 'vuex';

import { CloudServiceTypeInfo } from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';
import { CloudServiceDetailStoreState } from '@/services/asset-inventory/store/cloud-service-detail/type';


export const setProvider: Mutation<CloudServiceDetailStoreState> = (state, provider: string) => {
    state.provider = provider;
};

export const setGroup: Mutation<CloudServiceDetailStoreState> = (state, group: string) => {
    state.group = group;
};

export const setName: Mutation<CloudServiceDetailStoreState> = (state, name?: string) => {
    state.name = name;
};

export const setCloudServiceTypeList: Mutation<CloudServiceDetailStoreState> = (state, typeList: CloudServiceTypeInfo[]) => {
    state.cloudServiceTypeList = typeList;
};

export const setSelectedItem: Mutation<CloudServiceDetailStoreState> = (state, selectedItem?: CloudServiceTypeInfo) => {
    state.selectedItem = selectedItem;
};
