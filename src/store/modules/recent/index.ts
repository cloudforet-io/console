import { RecentState } from '@/store/modules/recent/type';
import * as getters from './getters';
import * as mutations from './mutations';
import * as actions from './actions';


const state: Required<RecentState> = {
    allItems: [],
    menuItems: [],
    projectItems: [],
    projectGroupItems: [],
    cloudServiceItems: [],
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
