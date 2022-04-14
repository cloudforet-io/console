// import * as getters from './getters';
// import * as actions from './actions';
// import * as mutations from './mutations';
import { Module } from 'vuex';
import alert from './alert';

export default {
    namespaced: true,
    modules: {
        alert,
    },
    // getters,
    // actions,
    // mutations,
} as Module<any, any>;
