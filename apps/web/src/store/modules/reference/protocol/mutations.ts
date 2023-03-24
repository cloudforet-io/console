import type { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setProtocols = (state: ReferenceState, protocols: ReferenceMap): void => {
    state.items = protocols;
};
