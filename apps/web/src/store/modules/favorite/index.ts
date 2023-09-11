import type { FavoriteState } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';

const state: FavoriteState = {
    menuItems: null,
    projectItems: null,
    projectGroupItems: null,
    cloudServiceItems: null,
    dashboardItems: null,
    costAnalysisItems: null,
    isLoading: {
        [FAVORITE_TYPE.MENU]: false,
        [FAVORITE_TYPE.CLOUD_SERVICE]: false,
        [FAVORITE_TYPE.PROJECT]: false,
        [FAVORITE_TYPE.PROJECT_GROUP]: false,
        [FAVORITE_TYPE.DASHBOARD]: false,
        [FAVORITE_TYPE.COST_ANALYSIS]: false,
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
