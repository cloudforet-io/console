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

import type { ReferenceData } from '@/lib/helper/config-data-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

const favoriteListApiQuery = new ApiQueryHelper().setSort('updated_at', true);

interface FavoriteState {
    favoriteMenuList: UserConfigModel[];
    favoriteWorkspaceMenuList: UserConfigModel[];
    total_count: number;
}

export const useFavoriteStore = defineStore('favorite', () => {
    const userWorkspaceStore = useUserWorkspaceStore();

    const _getters = reactive({
        userId: computed(() => store.state.user.userId),
        currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    });

    const state = reactive<FavoriteState>({
        favoriteMenuList: [] as UserConfigModel<ReferenceData>[],
        favoriteWorkspaceMenuList: [] as UserConfigModel<ReferenceData>[],
        total_count: 0,
    });

    const getters = reactive({
        favoriteMenuList: computed(() => state.favoriteMenuList.map((item) => item.data)),
        menuItems: computed(() => getters.favoriteMenuList.filter((item) => item.itemType === FAVORITE_TYPE.MENU)),
        projectItems: computed(() => getters.favoriteMenuList.filter((item) => item.itemType === FAVORITE_TYPE.PROJECT)),
        projectGroupItems: computed(() => getters.favoriteMenuList.filter((item) => item.itemType === FAVORITE_TYPE.PROJECT_GROUP)),
        cloudServiceItems: computed(() => getters.favoriteMenuList.filter((item) => item.itemType === FAVORITE_TYPE.CLOUD_SERVICE)),
        dashboardItems: computed(() => getters.favoriteMenuList.filter((item) => item.itemType === FAVORITE_TYPE.DASHBOARD)),
        costAnalysisItems: computed(() => getters.favoriteMenuList.filter((item) => item.itemType === FAVORITE_TYPE.COST_ANALYSIS)),
        securityItems: computed(() => getters.favoriteMenuList.filter((item) => item.itemType === FAVORITE_TYPE.SECURITY)),
        workspaceItems: computed(() => state.favoriteWorkspaceMenuList.map((item) => item.data)),
    });

    const actions = {
        fetchFavorite: async () => {
            favoriteListApiQuery.setFilters([
                { k: 'user_id', v: _getters.userId, o: '=' },
                { k: 'name', v: 'console:favorite:', o: '' },
                { k: 'data.workspaceId', v: _getters.currentWorkspaceId || '', o: '=' },
            ]);
            try {
                const { results, total_count } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel<ReferenceData>>>({
                    query: favoriteListApiQuery.data,
                });
                state.favoriteMenuList = results ?? [];
                state.total_count = total_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.favoriteMenuList = [];
            }
        },
        fetchWorkspaceFavorite: async () => {
            favoriteListApiQuery.setFilters([
                { k: 'user_id', v: _getters.userId, o: '=' },
                { k: 'name', v: `console:favorite:${FAVORITE_TYPE.WORKSPACE}`, o: '' },
            ]);
            try {
                const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel<ReferenceData>>>({
                    query: favoriteListApiQuery.data,
                });
                state.favoriteWorkspaceMenuList = results ?? [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.favoriteWorkspaceMenuList = [];
            }
        },
        createFavorite: async (param: ReferenceData) => {
            const { itemType, workspaceId, itemId } = param;
            try {
                await SpaceConnector.clientV2.config.userConfig.set<UserConfigSetParameters, UserConfigModel>({
                    name: itemType === FAVORITE_TYPE.WORKSPACE
                        ? `console:favorite:${itemType}:${itemId}`
                        : `console:favorite:${itemType}:${workspaceId}:${itemId}`,
                    data: {
                        ...param,
                        type: 'item',
                    },
                });
                await actions.fetchFavorite();
                if (itemType === FAVORITE_TYPE.WORKSPACE) await actions.fetchWorkspaceFavorite();
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        deleteFavorite: async (param: ReferenceData) => {
            const { itemType, workspaceId, itemId } = param;
            try {
                await SpaceConnector.clientV2.config.userConfig.delete<UserConfigDeleteParameters>({
                    name: itemType === FAVORITE_TYPE.WORKSPACE
                        ? `console:favorite:${itemType}:${itemId}`
                        : `console:favorite:${itemType}:${workspaceId}:${itemId}`,
                });
                await actions.fetchFavorite();
                if (itemType === FAVORITE_TYPE.WORKSPACE) await actions.fetchWorkspaceFavorite();
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
