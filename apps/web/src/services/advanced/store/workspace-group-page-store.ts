import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';

export const useWorkspaceGroupPageStore = defineStore('page-workspace-group', () => {
    const state = reactive({
        loading: false,
        groups: [] as WorkspaceGroupModel[],
        selectedIndices: [] as number[],
        pageStart: 1,
        pageLimit: 15,
        totalCount: 0,
        searchFilters: [] as ConsoleFilter[],

        groupUserPage: 1,
        groupUserSearchText: '',
        groupUserSortBy: 'user_id',
        isUserSortDesc: false,
        selectedUserIndices: [] as number[],
        selectedGroupUser: {},
        groupUserPageStart: 1,
        groupUserPageLimit: 15,

        workspacePage: 1,
        workspaceSearchText: '',
        workspaceSortBy: 'name',
        isWorkspaceSortDesc: false,
        selectedWorkspaceIndices: [] as number[],
        selectedWorkspace: {},
        workspacePageStart: 1,
        workspacePageLimit: 15,

        modal: {
            type: '',
            title: '',
            themeColor: 'primary',
            visible: '',
        },
    });

    // The getters method using reactive will not work when using the store.$dispose method with the error
    //  "Write operation failed: computed value is readonly" error message when using the store.$dispose method,
    // so we change to a method that doesn't use the reactive API.
    const getters = {
        selectedGroup: computed(() => {
            const [index] = state.selectedIndices;

            return state.groups[index];
        }),
        selectedGroupUsers: computed(() => {
            const filteredUsers = getters.selectedGroup.users.filter(actions.filterUser);

            const sortedSelectedGroupUsers = filteredUsers.sort((a, b) => {
                const aValue = a[state.groupUserSortBy];
                const bValue = b[state.groupUserSortBy];

                if (aValue === undefined) return 1;
                if (bValue === undefined) return -1;

                if (state.isUserSortDesc) {
                    return bValue.localeCompare(aValue);
                }

                return aValue.localeCompare(bValue);
            });

            if (getters.groupUserTotalCount < state.groupUserPageStart - 1 + state.groupUserPageLimit) {
                return sortedSelectedGroupUsers.slice(state.groupUserPageStart - 1);
            }

            return sortedSelectedGroupUsers.slice(state.groupUserPageStart - 1, state.groupUserPageStart - 1 + state.groupUserPageLimit);
        }),
        selectedGroupUsersByIndices: computed(() => {
            const groupUsers: any[] = [];

            state.selectedUserIndices.forEach((d:number) => {
                groupUsers.push(getters.selectedGroupUsers[d]);
            });

            return groupUsers ?? [];
        }),
        selectedWorkspaces: computed(() => {
            const filteredWokrspaces = getters.selectedGroup.workspaces.filter(actions.filterWorkspace);

            const sortedSelectedWokrspaces = filteredWokrspaces.sort((a, b) => {
                const aValue = a[state.workspaceSortBy];
                const bValue = b[state.workspaceSortBy];

                if (aValue === undefined) return 1;
                if (bValue === undefined) return -1;

                if (typeof aValue === 'number' && state.isWorkspaceSortDesc) {
                    return bValue - aValue;
                }
                if (typeof aValue === 'number' && !state.isWorkspaceSortDesc) {
                    return aValue - bValue;
                }

                if (state.isWorkspaceSortDesc) {
                    return bValue.localeCompare(aValue);
                }

                return aValue.localeCompare(bValue);
            });

            if (getters.workspaceTotalCount < state.workspacePageStart - 1 + state.workspacePageLimit) {
                return sortedSelectedWokrspaces.slice(state.workspacePageStart - 1);
            }

            return sortedSelectedWokrspaces.slice(state.workspacePageStart - 1, state.workspacePageStart - 1 + state.workspacePageLimit);
        }),
        selectedWorkspacesByIndices: computed(() => {
            const workspaces: any[] = [];

            state.selectedWorkspaceIndices.forEach((d:number) => {
                workspaces.push(getters.selectedWorkspaces[d]);
            });

            return workspaces ?? [];
        }),
        groupUserTotalCount: computed(() => {
            const [index] = state.selectedIndices;

            if (state.groupUserSearchText) {
                const filteredUsers = state.groups[index].users.filter(actions.filterUser);

                return filteredUsers.length;
            }

            return state.groups[index].users.length;
        }),
        workspaceTotalCount: computed(() => {
            const [index] = state.selectedIndices;

            if (state.workspaceSearchText) {
                const filteredWorkspaces = state.groups[index].workspaces.filter(actions.filterWorkspace);

                return filteredWorkspaces.length;
            }

            return state.groups[index].workspaces.length;
        }),
        groupUserPage: computed(() => {
            console.log(state.groupUserPageStart / state.groupUserPageLimit);
            return state.groupUserPageStart / state.groupUserPageLimit;
        }),
    };

    const actions = {
        updateModalSettings: ({
            type, title, themeColor = 'primary', visible,
        }) => {
            state.modal = {
                type,
                title,
                themeColor,
                visible,
            };
        },
        closeModal: () => {
            state.modal = {
                type: '',
                title: '',
                themeColor: 'primary',
                visible: '',
            };
        },
        resetSelectedGroupUser: () => {
            state.selectedGroupUser = {};
        },
        resetSelectedWorkspace: () => {
            state.selectedWorkspace = {};
        },
        reset: () => {
            state.loading = false;
            state.groups = [] as WorkspaceGroupModel[];
            state.selectedIndices = [] as number[];
            state.pageStart = 1;
            state.pageLimit = 15;
            state.totalCount = 0;

            state.groupUserPage = 1;
            state.groupUserSearchText = '';
            state.groupUserSortBy = 'user_id';
            state.isUserSortDesc = false;
            state.selectedUserIndices = [] as number[];
            state.selectedGroupUser = {};
            state.groupUserPageStart = 1;
            state.groupUserPageLimit = 15;

            state.workspacePage = 1;
            state.workspaceSearchText = '';
            state.workspaceSortBy = 'name';
            state.isWorkspaceSortDesc = false;
            state.selectedWorkspaceIndices = [] as number[];
            state.selectedWorkspace = {};
            state.workspacePageStart = 1;
            state.workspacePageLimit = 15;

            state.modal = {
                type: '',
                title: '',
                themeColor: 'primary',
                visible: '',
            };
        },
        resetGroupUser: () => {
            state.groupUserPage = 1;
            state.groupUserSearchText = '';
            state.groupUserSortBy = 'user_id';
            state.isUserSortDesc = false;
            state.selectedUserIndices = [] as number[];
            state.selectedGroupUser = {};
            state.groupUserPageStart = 1;
            state.groupUserPageLimit = 15;
        },
        resetWorkspace: () => {
            state.workspacePage = 1;
            state.workspaceSearchText = '';
            state.workspaceSortBy = 'name';
            state.isWorkspaceSortDesc = false;
            state.selectedWorkspaceIndices = [] as number[];
            state.selectedWorkspace = {};
            state.workspacePageStart = 1;
            state.workspacePageLimit = 15;
        },
        filterUser: (user) => {
            const searchText = state.groupUserSearchText.trim();

            if (searchText === '') {
                return true;
            }

            const userIdMatches = user.user_id && user.user_id.includes(searchText);
            const userNameMatches = user.name && user.name.includes(searchText);

            return userIdMatches || userNameMatches;
        },
        filterWorkspace: (workspace) => {
            const searchText = state.workspaceSearchText.trim();

            if (searchText === '') {
                return true;
            }

            const workspaceNameMatches = workspace.name && workspace.name.includes(searchText);

            return workspaceNameMatches;
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
