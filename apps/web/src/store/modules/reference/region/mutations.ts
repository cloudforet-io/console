import type { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setRegions = (state: ReferenceState, regions: ReferenceMap): void => {
    state.items = regions;
};
