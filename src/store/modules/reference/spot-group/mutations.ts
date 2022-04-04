import { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setSpotGroups = (state: ReferenceState, spotGroups: ReferenceMap): void => {
    state.items = spotGroups;
};
