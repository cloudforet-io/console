import { ResourceState, ResourceMap } from '@/store/modules/reference/type';

export const setUsers = (state: ResourceState, users: ResourceMap): void => {
    state.items = users;
};
