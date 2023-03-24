import type { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setPlugins = (state: ReferenceState, plugins: ReferenceMap): void => {
    state.items = plugins;
};
