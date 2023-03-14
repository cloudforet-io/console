import type { Module } from 'vuex';

import type { AdministrationState, AdministrationStore } from '@/services/administration/store/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import role from './role';

const state: AdministrationState = {};

export const administrationStoreModule: Module<AdministrationState, any> = {
    namespaced: true,
    state: () => ({ ...state }),
    modules: {
        role,
    },
    getters,
    actions,
    mutations,
};

export const administrationStore = {} as AdministrationStore;
