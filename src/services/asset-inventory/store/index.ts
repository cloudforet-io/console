import { AssetInventoryState } from './type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: AssetInventoryState = {
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};
