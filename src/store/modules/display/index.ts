import { DisplayState } from './type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: DisplayState = {
    visibleInfo: false,
    isInitialized: false,
    isDownloaded: false,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
