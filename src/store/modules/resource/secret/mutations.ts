import { ResourceState, ResourceMap } from '@/store/modules/resource/type';

export const setSecrets = (state: ResourceState, secrets: ResourceMap): void => {
    state.items = secrets;
};
