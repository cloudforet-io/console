import { ResourceState, ResourceMap } from '@/store/modules/resource/type';

export const setCloudServiceTypes = (state: ResourceState, cloudServiceTypes: ResourceMap): void => {
    state.items = cloudServiceTypes;
};
