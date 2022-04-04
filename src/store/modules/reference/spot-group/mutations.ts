import { ResourceState, ResourceMap } from '@/store/modules/reference/type';

export const setSpotGroups = (state: ResourceState, spotGroups: ResourceMap): void => {
    state.items = spotGroups;
};
