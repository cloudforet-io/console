import { ResourceState, ResourceMap } from '@/store/modules/reference/type';

export const setProtocols = (state: ResourceState, protocols: ResourceMap): void => {
    state.items = protocols;
};
