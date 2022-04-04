import { ResourceState, ResourceMap } from '@/store/modules/reference/type';

export const setCollectors = (state: ResourceState, collectors: ResourceMap): void => {
    state.items = collectors;
};
