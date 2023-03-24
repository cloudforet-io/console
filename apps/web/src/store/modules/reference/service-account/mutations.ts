import type { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setServiceAccounts = (state: ReferenceState, serviceAccounts: ReferenceMap): void => {
    state.items = serviceAccounts;
};
