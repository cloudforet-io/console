import { ResourceState, ResourceMap } from '@/store/modules/reference/type';

export const setProjectGroups = (state: ResourceState, projectGroups: ResourceMap): void => {
    state.items = projectGroups;
};
