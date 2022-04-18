import { FavoriteState } from '@/store/modules/favorite/type';
import * as getters from './getters';
import * as mutations from './mutations';
import * as actions from './actions';


const state: Required<FavoriteState> = {
    menuItems: [],
    projectItems: [],
    projectGroupItems: [],
    cloudServiceTypeItems: [],
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
