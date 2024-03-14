import type { ReferenceRootState } from '@/store/modules/reference/type';

// eslint-disable-next-line import/no-cycle
import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import protocol from './protocol';
import provider from './provider';

// TODO: This is a temporary state. It must be changed to check each modules' items state is null.
const state: ReferenceRootState = {
    isAllLoaded: false,
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
    modules: {
        provider,
        protocol,
    },
};
