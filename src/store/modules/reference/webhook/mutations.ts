import type { ReferenceState, ReferenceMap } from '@/store/modules/reference/type';

export const setWebhooks = (state: ReferenceState, webhooks: ReferenceMap): void => {
    state.items = webhooks;
};
