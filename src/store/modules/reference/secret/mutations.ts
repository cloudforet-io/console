import { ResourceState, ResourceMap } from '@/store/modules/reference/type';

export const setSecrets = (state: ResourceState, secrets: ResourceMap): void => {
    state.items = secrets;
};
