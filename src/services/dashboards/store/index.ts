import type { Module } from 'vuex';

import type { DashboardsState } from '@/services/dashboards/store/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: DashboardsState = {
    workSpaceList: [],
    projectDashboardList: [],
};

export const dashboardsModule: Module<DashboardsState, any> = {
    namespaced: true,
    state: () => ({ ...state }),
    modules: {},
    getters,
    actions,
    mutations,
};
