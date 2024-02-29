import type { FavoriteState } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

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
};
