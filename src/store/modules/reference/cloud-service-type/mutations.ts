import type { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setCloudServiceTypes = (state: ReferenceState, cloudServiceTypes: ReferenceMap): void => {
    state.items = cloudServiceTypes;
};
