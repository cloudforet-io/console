import { AssetInventoryState } from './type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';
import cloudService from './cloud-service';

const state: AssetInventoryState = {
};

export default {
    namespaced: true,
    state: () => ({ ...state }),
    modules: {
        cloudService,
    },
    getters,
    actions,
    mutations,
};
