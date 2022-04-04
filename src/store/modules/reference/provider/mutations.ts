import { ResourceState, ResourceMap } from '@/store/modules/reference/type';

export const setProviders = (state: ResourceState, providers: ResourceMap): void => {
    state.items = providers;
};
