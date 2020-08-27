import { ResourceState, ResourceMap } from '@/store/modules/resource/type';

export const setServiceAccounts = (state: ResourceState, serviceAccounts: ResourceMap): void => {
    state.items = serviceAccounts;
};
