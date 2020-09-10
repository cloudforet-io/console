import { ResourceState, ResourceMap } from '@/store/modules/resource/type';

export const setRegions = (state: ResourceState, regions: ResourceMap): void => {
    state.items = regions;
};
