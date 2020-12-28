import { ResourceState, ResourceMap } from '@/store/modules/resource/type';

export const setUsers = (state: ResourceState, users: ResourceMap): void => {
    state.items = users;
};
