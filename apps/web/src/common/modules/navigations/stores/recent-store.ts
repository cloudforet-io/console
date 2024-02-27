import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';


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
}

export const useRecentStore = defineStore('recent', () => {
    const _getters = reactive({
        userId: computed(() => store.state.user.userId),
    });

    const state = reactive<RecentState>({
        recentMenuList: [],
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
            const { results } = await SpaceConnector.clientV2.config.userConfig.list({
                query: recentListApiQuery.data,
            });
            state.recentMenuList = results;
        },
        createRecent: async ({
            type, workspaceId, id, label,
        }:{type: RecentType, workspaceId:string, id:string, label:string}) => {
            await SpaceConnector.clientV2.config.userConfig.set({
                name: `console:recent:${type}:${workspaceId}:${id}`,
                data: {
                    id,
                    workspace_id: workspaceId,
                    type,
                    label,
                },
            });
        },
    };

    return {
        state,
        ...actions,
    };
});
