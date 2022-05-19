import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import { FileState } from './type';

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
