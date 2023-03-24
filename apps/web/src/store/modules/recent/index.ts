import type { RecentState } from '@/store/modules/recent/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: Required<RecentState> = {
    allItems: [],
    menuItems: [],
    projectItems: [],
    projectGroupItems: [],
    cloudServiceItems: [],
    dashboardItems: [],
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
