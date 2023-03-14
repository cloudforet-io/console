import type { Module } from 'vuex';

import * as actions from './actions';
import cloudServiceDetail from './cloud-service-detail';
import * as getters from './getters';
import * as mutations from './mutations';
import type { AssetInventoryState, AssetInventoryStore } from './type';

const state: AssetInventoryState = {
};

export const assetInventoryStoreModule: Module<AssetInventoryState, any> = {
    namespaced: true,
    state: () => ({ ...state }),
    modules: {
        cloudServiceDetail,
    },
    getters,
    actions,
    mutations,
};

export const assetInventoryStore = {} as AssetInventoryStore;
