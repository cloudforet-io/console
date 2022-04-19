import { AlertManagerState, AlertManagerStore } from '@/services/alert-manager/store/type';
import { Module } from 'vuex';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';
import alert from './alert';

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
