import { Module } from 'vuex';
import { AssetInventoryState, AssetInventoryStore } from './type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';
import cloudService from './cloud-service';

const state: AssetInventoryState = {
};

export const assetInventoryStoreModule: Module<AssetInventoryState, any> = {
    namespaced: true,
    state: () => ({ ...state }),
    modules: {
        cloudService,
    },
    getters,
    actions,
    mutations,
};

export const assetInventoryStore = {} as AssetInventoryStore;
