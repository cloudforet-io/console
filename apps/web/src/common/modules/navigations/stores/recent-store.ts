import { computed, reactive, watch } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';


type RecentType = 'service' | 'identity.ServiceAccount' | 'identity.Provider';

const recentListApiQuery = new ApiQueryHelper().setSort('updated_at', true);

export interface RecentMenu {
    name: string;
    user_id: string;
    data: {
        id: string;
        label: string;
        type: RecentType;
        workspace_id: string;
    };
    created_at: string;
    updated_at: string;
    tags: {[key:string]: any};
    domain_id: string;
}

interface RecentState {
    recentMenuList: RecentMenu[];
    totalCount: number;
}

export const useRecentStore = defineStore('recent', () => {
    const userWorkspaceStore = useUserWorkspaceStore();

    const _getters = reactive({
        userId: computed(() => store.state.user.userId),
        currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    });

    const state = reactive<RecentState>({
        recentMenuList: [],
        totalCount: 0,
    });

    const actions = {
        fetchRecent: async ({
            type, workspaceIds = [], limit = 5, searchText,
        }:{type: RecentType, workspaceIds:string[], limit?:number, searchText?:string}) => {
            recentListApiQuery.setFilters([
                { k: 'name', v: `console:recent:${type}:`, o: '' },
                { k: 'data.workspace_id', v: workspaceIds, o: '=' },
                { k: 'user_id', v: _getters.userId, o: '=' },
            ]).setPageLimit(limit);
            if (searchText?.length) recentListApiQuery.addFilter({ k: 'data.label', v: searchText, o: '' });
            try {
                const { results, total_count } = await SpaceConnector.clientV2.config.userConfig.list({
                    query: recentListApiQuery.data,
                });
                state.recentMenuList = results ?? [];
                state.totalCount = total_count ?? 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.recentMenuList = [];
            }
        },
        createRecent: async ({
            type, workspaceId, id, label,
        }:{type: RecentType, workspaceId:string, id:string, label:string}) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.set({
                    name: `console:recent:${type}:${workspaceId}:${id}`,
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
            actions.fetchRecent({ type: 'service', workspaceIds: [workspaceId] });
        }
    });

    return {
        state,
        ...actions,
    };
});
