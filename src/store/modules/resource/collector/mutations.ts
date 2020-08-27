import { ResourceState, ResourceMap } from '@/store/modules/resource/type';

export const setCollectors = (state: ResourceState, collectors: ResourceMap): void => {
    state.items = collectors;
};
