import type { Mutation } from 'vuex';

import type { ReferenceRootState } from '@/store/modules/reference/type';

export const setIsAllLoaded: Mutation<ReferenceRootState> = (state, isLoaded: boolean) => {
    state.isAllLoaded = isLoaded;
};
