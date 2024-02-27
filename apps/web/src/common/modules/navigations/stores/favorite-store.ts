import { computed, reactive, watch } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';


type FavoriteType = 'MENU' | 'PROJECT' | 'DASHBOARD' | 'CLOUD_SERVICE' | 'COST_ANALYSIS' | 'PROJECT_GROUP';

const favoriteListApiQuery = new ApiQueryHelper().setSort('updated_at', true);

export interface FavoriteMenu {
    name: string;
    user_id: string;
    data: {
        id: string;
        label: string;
        type: FavoriteType;
        workspace_id: string;
    };
    created_at: string;
    updated_at: string;
    tags: {[key:string]: any};
    domain_id: string;
}

interface FavoriteState {
    favoriteMenuList: FavoriteMenu[];
    total_count: number;
}

export const useFavoriteStore = defineStore('favorite', () => {
    const userWorkspaceStore = useUserWorkspaceStore();

    const _getters = reactive({
        userId: computed(() => store.state.user.userId),
        currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    });

    const state = reactive<FavoriteState>({
        favoriteMenuList: [],
        total_count: 0,
    });

    const actions = {
        fetchFavorite: async ({
            type, workspaceIds = [], limit = 5, searchText,
        }:{type: FavoriteType, workspaceIds:string[], limit?:number, searchText?:string}) => {
            favoriteListApiQuery.setFilters([
                { k: 'name', v: `console:favorite:${type}:`, o: '' },
                { k: 'data.workspace_id', v: workspaceIds, o: '=' },
                { k: 'user_id', v: _getters.userId, o: '=' },
            ]).setPageLimit(limit);
            if (searchText?.length) favoriteListApiQuery.addFilter({ k: 'data.label', v: searchText, o: '' });
            try {
                const { results, total_count } = await SpaceConnector.clientV2.config.userConfig.list({
                    query: favoriteListApiQuery.data,
                });
                state.favoriteMenuList = results ?? [];
                state.total_count = total_count;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.favoriteMenuList = [];
                return [];
            }
            return state.favoriteMenuList;
        },
        createFavorite: async ({
            type, workspaceId, id, label,
        }:{type: FavoriteType, workspaceId:string, id:string, label:string}) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.set({
                    name: `console:favorite:${type}:${workspaceId}:${id}`,
                    data: {
                        id,
                        workspace_id: workspaceId,
                        type,
                        label,
                    },
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
    };

    watch(() => _getters.currentWorkspaceId, (workspaceId) => {
        if (workspaceId) {
            actions.fetchFavorite({ type: 'service', workspaceIds: [workspaceId] });
        }
    });

    return {
        state,
        ...actions,
    };
});
