import type { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setProviders = (state: ReferenceState, providers: ReferenceMap): void => {
    state.items = providers;
};
