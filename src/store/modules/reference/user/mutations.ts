import type { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setUsers = (state: ReferenceState, users: ReferenceMap): void => {
    state.items = users;
};
