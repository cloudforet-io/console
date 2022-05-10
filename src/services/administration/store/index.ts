import { AdministrationState, AdministrationStore } from '@/services/administration/store/type';
import { Module } from 'vuex';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';
import user from './user';
import role from './role';
import policy from './policy';

const state: AdministrationState = {};

export const administrationStoreModule: Module<AdministrationState, any> = {
    namespaced: true,
    state: () => ({ ...state }),
    modules: {
        user,
        role,
        policy,
    },
    getters,
    actions,
    mutations,
};

export const administrationStore = {} as AdministrationStore;
