import type { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setSecrets = (state: ReferenceState, secrets: ReferenceMap): void => {
    state.items = secrets;
};
