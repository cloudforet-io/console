import type { Module } from 'vuex';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import type { InfoState, InfoStore } from './type';

const state: InfoState = {
};

export const infoStoreModule: Module<InfoState, any> = {
    namespaced: true,
    state: () => ({ ...state }),
    getters,
    actions,
    mutations,
};

export const infoStore: InfoStore = {} as InfoStore;
