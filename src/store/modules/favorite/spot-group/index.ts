import { FavoriteState } from '@/store/modules/favorite/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: Required<FavoriteState> = {
    items: [],
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
