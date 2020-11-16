import { ResourceState, ResourceMap } from '@/store/modules/resource/type';

export const setProjectGroups = (state: ResourceState, projectGroups: ResourceMap): void => {
    state.items = projectGroups;
};
