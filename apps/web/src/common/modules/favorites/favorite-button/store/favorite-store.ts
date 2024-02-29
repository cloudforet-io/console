import { computed, reactive, watch } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserConfigDeleteParameters } from '@/schema/config/user-config/api-verbs/delete';
import type { UserConfigListParameters } from '@/schema/config/user-config/api-verbs/list';
import type { UserConfigSetParameters } from '@/schema/config/user-config/api-verbs/set';
import type { UserConfigModel } from '@/schema/config/user-config/model';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { FavoriteType } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

const favoriteListApiQuery = new ApiQueryHelper().setSort('updated_at', true);

interface FavoriteState {
    favoriteMenuList: UserConfigModel[];
    total_count: number;
}

export const useFavoriteStore = defineStore('favorite', () => {
    const userWorkspaceStore = useUserWorkspaceStore();

    const _getters = reactive({
        userId: computed(() => store.state.user.userId),
        currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    });

    const state = reactive<FavoriteState>({
        favoriteMenuList: [] as UserConfigModel[],
        total_count: 0,
    });

    const getters = reactive({
        favoriteMenuList: computed(() => state.favoriteMenuList.map((item) => item.data)),
        menuItems: computed(() => getters.favoriteMenuList.filter((item) => item.type === FAVORITE_TYPE.MENU)),
        projectItems: computed(() => getters.favoriteMenuList.filter((item) => item.type === FAVORITE_TYPE.PROJECT)),
        projectGroupItems: computed(() => getters.favoriteMenuList.filter((item) => item.type === FAVORITE_TYPE.PROJECT_GROUP)),
        cloudServiceItems: computed(() => getters.favoriteMenuList.filter((item) => item.type === FAVORITE_TYPE.CLOUD_SERVICE)),
        dashboardItems: computed(() => getters.favoriteMenuList.filter((item) => item.type === FAVORITE_TYPE.DASHBOARD)),
        costAnalysisItems: computed(() => getters.favoriteMenuList.filter((item) => item.type === FAVORITE_TYPE.COST_ANALYSIS)),
    });

    const actions = {
        fetchFavorite: async () => {
            favoriteListApiQuery.setFilters([
                { k: 'name', v: 'console:favorite:', o: '' },
                { k: 'data.workspace_id', v: _getters.currentWorkspaceId, o: '=' },
                { k: 'user_id', v: _getters.userId, o: '=' },
            ]);
            try {
                const { results, total_count } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
                    query: favoriteListApiQuery.data,
                });
                state.favoriteMenuList = results ?? [];
                state.total_count = total_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.favoriteMenuList = [];
                return [];
            }
            return state.favoriteMenuList;
        },
        createFavorite: async ({
            type, workspaceId, id,
        }:{type: FavoriteType, workspaceId:string, id:string}) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.set<UserConfigSetParameters, UserConfigModel>({
                    name: `console:favorite:${type}:${workspaceId}:${id}`,
                    data: {
                        id,
                        workspace_id: workspaceId,
                        type,
                    },
                });
                await actions.fetchFavorite();
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        deleteFavorite: async ({
            type, workspaceId, id,
        }:{type: FavoriteType, workspaceId:string, id:string}) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.delete<UserConfigDeleteParameters>({
                    name: `console:favorite:${type}:${workspaceId}:${id}`,
                });
                await actions.fetchFavorite();
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
    };

    watch(() => _getters.currentWorkspaceId, async (workspaceId) => {
        if (workspaceId) {
            await actions.fetchFavorite();
        }
    }, { immediate: true });

    return {
        state,
        getters,
        ...actions,
    };
});
