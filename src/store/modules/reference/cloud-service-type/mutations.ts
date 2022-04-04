import { ResourceState, ResourceMap } from '@/store/modules/reference/type';

export const setCloudServiceTypes = (state: ResourceState, cloudServiceTypes: ResourceMap): void => {
    state.items = cloudServiceTypes;
};
