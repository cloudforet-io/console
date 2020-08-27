import { ResourceState, ResourceMap } from '@/store/modules/resource/type';

export const setProviders = (state: ResourceState, providers: ResourceMap): void => {
    state.items = providers;
};
