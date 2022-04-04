import { ResourceState, ResourceMap } from '@/store/modules/reference/type';

export const setServiceAccounts = (state: ResourceState, serviceAccounts: ResourceMap): void => {
    state.items = serviceAccounts;
};
