import type { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setTrustedAccounts = (state: ReferenceState, serviceAccounts: ReferenceMap): void => {
    state.items = serviceAccounts;
};
