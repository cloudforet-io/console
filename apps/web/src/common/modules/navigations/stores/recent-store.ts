import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { UserConfigDeleteParameters } from '@/schema/config/user-config/api-verbs/delete';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { RecentItem, RecentType } from '@/common/modules/navigations/type';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';

const recentListApiQuery = new ApiQueryHelper().setSort('updated_at', true);

interface RecentState {
    recentMenuList: RecentItem[];
    totalCount: number;
}

export const useRecentStore = defineStore('recent', () => {
    const userWorkspaceStore = useUserWorkspaceStore();

    const route = useRoute();

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
        if (route.name === LANDING_ROUTE._NAME) return;
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
