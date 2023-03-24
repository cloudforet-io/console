import type { WebhookReferenceState } from '@/store/modules/reference/webhook/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: WebhookReferenceState = {
    items: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
