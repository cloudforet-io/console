import { AdministrationState, AdministrationStore } from '@/services/administration/store/type';
import { Module } from 'vuex';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';
import user from './user';

const state: AdministrationState = {};

export const administrationStoreModule: Module<AdministrationState, any> = {
    namespaced: true,
    state: () => ({ ...state }),
    modules: {
        user,
    },
    getters,
    actions,
    mutations,
};

export const administrationStore = {} as AdministrationStore;
