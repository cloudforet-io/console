import { ResourceState, ResourceMap } from '@/store/modules/resource/type';

export const setProtocols = (state: ResourceState, protocols: ResourceMap): void => {
    state.items = protocols;
};
