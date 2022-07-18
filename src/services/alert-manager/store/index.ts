import type { Module } from 'vuex';

import type { AlertManagerState, AlertManagerStore } from '@/services/alert-manager/store/type';

import * as actions from './actions';
import alert from './alert';
import * as getters from './getters';
import * as mutations from './mutations';

export const alertManagerStoreModule: Module<AlertManagerState, any> = {
    namespaced: true,
    modules: {
        alert,
    },
    getters,
    actions,
    mutations,
};

export const alertManagerStore = {} as AlertManagerStore;
