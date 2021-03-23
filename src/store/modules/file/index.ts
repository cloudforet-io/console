import { FileState } from './type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: FileState = {
    downloadSource: undefined,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
