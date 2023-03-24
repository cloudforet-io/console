import type { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setCollectors = (state: ReferenceState, collectors: ReferenceMap): void => {
    state.items = collectors;
};
