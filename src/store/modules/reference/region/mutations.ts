import { ResourceState, ResourceMap } from '@/store/modules/reference/type';

export const setRegions = (state: ResourceState, regions: ResourceMap): void => {
    state.items = regions;
};
