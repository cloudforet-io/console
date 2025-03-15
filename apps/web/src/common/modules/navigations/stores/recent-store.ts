// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { computed, reactive, watch } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { UserConfigDeleteParameters } from '@/api-clients/config/user-config/schema/api-verbs/delete';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { RecentItem, RecentType } from '@/common/modules/navigations/type';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

const recentListApiQuery = new ApiQueryHelper().setSort('updated_at', true);

interface RecentState {
    recentMenuList: RecentItem[];
    totalCount: number;
    type?: RecentType;
}

export const useRecentStore = defineStore('recent', () => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const userStore = useUserStore();

    const _getters = reactive({
        userId: computed(() => userStore.state.userId),
        currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    });

    const state = reactive<RecentState>({
        recentMenuList: [],
        totalCount: 0,
        type: undefined,
    });

    const actions = {
        fetchRecent: async ({
            type, workspaceIds, limit = 15, searchText,
        }:{type: RecentType, workspaceIds?:string[], limit?:number, searchText?:string}) => {
            recentListApiQuery.setFilters([
                { k: 'name', v: `console:recent:${type}:`, o: '' },
                { k: 'user_id', v: _getters.userId, o: '=' },
            ]).setPageLimit(limit);
            if (workspaceIds) {
                recentListApiQuery.addFilter({ k: 'data.workspace_id', v: workspaceIds, o: '=' });
            }
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
                return [];
            }
            state.type = type;
            return state.recentMenuList;
        },
        createRecent: async ({
            type, workspaceId, id, options,
        }:{type: RecentType, workspaceId:string, id:string, options?: {[key:string]: any}}) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.set({
                    name: `console:recent:${type}:${workspaceId}:${id}`,
                    data: {
                        id,
                        workspace_id: workspaceId,
                        type,
                        ...options,
                    },
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        deleteRecent: async ({ name, type, itemId }: {name?: string, type?: RecentType, itemId?: string}) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.delete<UserConfigDeleteParameters>({
                    name: name ?? `console:recent:${type}:${_getters.currentWorkspaceId}:${itemId}`,
                });
                let recentType = type;
                if (name) {
                    recentType = name.split(':')[2] as RecentType;
                    if (!Object.values(RECENT_TYPE).includes(recentType)) {
                        throw new Error('Invalid recent type');
                    }
                }
                if (_getters.currentWorkspaceId && recentType) await actions.fetchRecent({ type: recentType, workspaceIds: [_getters.currentWorkspaceId] });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
    };

    watch(() => _getters.currentWorkspaceId, (workspaceId) => {
        if (state.type === RECENT_TYPE.WORKSPACE) return;
        state.recentMenuList = [];
        if (workspaceId) {
            actions.fetchRecent({ type: RECENT_TYPE.SERVICE, workspaceIds: [workspaceId] });
        }
    });

    return {
        state,
        ...actions,
    };
});
