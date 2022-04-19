import { WebhookReferenceState } from '@/store/modules/reference/webhook/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: WebhookReferenceState = {
    items: {},
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
