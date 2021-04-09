import { ResourceState, ResourceMap } from '@/store/modules/resource/type';

export const setSpotGroups = (state: ResourceState, spotGroups: ResourceMap): void => {
    state.items = spotGroups;
};
