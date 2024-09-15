import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { WorkspaceUser } from '@/schema/identity/workspace-group/model';

import { useUserWorkspaceGroupStore } from '@/store/app-context/workspace/user-workspace-group-store';

interface LandingPageStoreState {
    loading: boolean;
    selectedWorkspaceGroup: string;
}

export const useLandingPageStore = defineStore('landing-page-store', () => {
    const userWorkspaceGroupStore = useUserWorkspaceGroupStore();
    const userWorkspaceGroupStoreGetters = userWorkspaceGroupStore.getters;

    const state = reactive<LandingPageStoreState>({
        loading: false,
        selectedWorkspaceGroup: 'all',
    });

    const groupUserTableState = reactive({
        selectedIndices: [] as number[],
        thisPage: 1,
        searchText: '',
        sortBy: 'user_id',
        isDesc: false,
        pageStart: 1,
        pageLimit: 15,
    });

    const getters = reactive({
        loading: computed<boolean>(() => state.loading),
        // workspaceGroupUser
        workspaceGroupUsers: computed<WorkspaceUser[]>(() => userWorkspaceGroupStoreGetters.workspaceGroupMap[state.selectedWorkspaceGroup]?.users || []),
        workspaceGroupUserTotalCount: computed<number>(() => getters.workspaceGroupUsers.length || 0),
        workspaceGroupUserTableItem: computed<WorkspaceUser[]>(() => {
            const filteredUsers = getters.workspaceGroupUsers?.filter(actions.filterUser);

            const sortedSelectedGroupUsers = filteredUsers?.sort((a, b) => {
                const aValue = a[groupUserTableState.sortBy];
                const bValue = b[groupUserTableState.sortBy];

                if (aValue === undefined) return 1;
                if (bValue === undefined) return -1;

                if (groupUserTableState.isDesc) {
                    return bValue.localeCompare(aValue);
                }

                return aValue.localeCompare(bValue);
            });

            if (getters.groupUserTotalCount < groupUserTableState.pageStart - 1 + groupUserTableState.pageLimit) {
                return sortedSelectedGroupUsers.slice(groupUserTableState.pageStart - 1);
            }

            return sortedSelectedGroupUsers?.slice(groupUserTableState.pageStart - 1, groupUserTableState.pageStart - 1 + groupUserTableState.pageLimit);
        }),
    });

    const actions = {
        setLoading: (loading: boolean) => {
            state.loading = loading;
        },
        initState: () => {
            state.loading = false;
        },
        filterUser: (user:WorkspaceUser) => {
            const searchText = groupUserTableState.searchText.trim();

            if (searchText === '') {
                return true;
            }

            const userIdMatches = user.user_id && user.user_id.includes(searchText);
            const userNameMatches = user.user_name && user.user_name.includes(searchText);

            return userIdMatches || userNameMatches;
        },
    };


    return {
        state,
        groupUserTableState,
        getters,
        ...actions,
    };
});
