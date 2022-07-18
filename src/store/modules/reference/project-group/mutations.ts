import type { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setProjectGroups = (state: ReferenceState, projectGroups: ReferenceMap): void => {
    state.items = projectGroups;
};
