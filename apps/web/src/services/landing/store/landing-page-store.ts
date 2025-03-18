import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { WorkspaceUser } from '@/api-clients/identity/workspace-group/schema/model';

import { useUserWorkspaceGroupStore } from '@/store/app-context/workspace/user-workspace-group-store';

import { sortTableItems } from '@/common/utils/table-sort';

interface LandingPageStoreState {
    loading: boolean;
    selectedWorkspaceGroup: string;
    redirectPath?: string;
}

export const useLandingPageStore = defineStore('landing-page-store', () => {
    const userWorkspaceGroupStore = useUserWorkspaceGroupStore();
    const userWorkspaceGroupStoreGetters = userWorkspaceGroupStore.getters;

    const state = reactive<LandingPageStoreState>({
        loading: false,
        selectedWorkspaceGroup: 'all',
        redirectPath: undefined,
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

    const getters = {
        loading: computed<boolean>(() => state.loading),
        // workspaceGroupUser
        workspaceGroupUsers: computed<WorkspaceUser[]>(() => userWorkspaceGroupStoreGetters.workspaceGroupMap[state.selectedWorkspaceGroup]?.users || []),
        workspaceGroupUserTotalCount: computed<number>(() => getters.workspaceGroupUsers.length || 0),
        workspaceGroupUserTableItem: computed<WorkspaceUser[]>(() => {
            const filteredUsers:WorkspaceUser[] = getters.workspaceGroupUsers.filter(actions.filterUser);

            const sortedSelectedGroupUsers = sortTableItems<WorkspaceUser>(filteredUsers, groupUserTableState.sortBy, groupUserTableState.isDesc);

            if (getters.groupUserTotalCount < groupUserTableState.pageStart - 1 + groupUserTableState.pageLimit) {
                return sortedSelectedGroupUsers.slice(groupUserTableState.pageStart - 1);
            }

            return sortedSelectedGroupUsers?.slice(groupUserTableState.pageStart - 1, groupUserTableState.pageStart - 1 + groupUserTableState.pageLimit);
        }),
    };

    const actions = {
        setRedirectPath(redirectPath?: string) {
            state.redirectPath = redirectPath;
        },
        setLoading: (loading: boolean) => {
            state.loading = loading;
        },
        initState: () => {
            state.loading = false;
        },
        filterUser: (user:WorkspaceUser):boolean => {
            const searchText = groupUserTableState.searchText.trim();

            if (searchText === '') {
                return true;
            }

            const userIdMatches = user.user_id && user.user_id.includes(searchText);
            const userNameMatches = user.user_name && user.user_name.includes(searchText);

            return !!(userIdMatches || userNameMatches);
        },
        resetGroupUserTableState: () => {
            groupUserTableState.selectedIndices = [];
            groupUserTableState.searchText = '';
            groupUserTableState.sortBy = 'user_id';
            groupUserTableState.isDesc = false;
            groupUserTableState.pageStart = 1;
            groupUserTableState.thisPage = 1;
        },
        reset: () => {
            state.selectedWorkspaceGroup = 'all';
            state.loading = false;
            actions.resetGroupUserTableState();
        },
    };


    return {
        state,
        groupUserTableState,
        getters,
        ...actions,
    };
});
