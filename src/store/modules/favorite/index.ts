import { FavoriteState } from '@/store/modules/favorite/type';
import * as getters from './getters';
import * as mutations from './mutations';
import * as actions from './actions';


const state: Required<FavoriteState> = {
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
