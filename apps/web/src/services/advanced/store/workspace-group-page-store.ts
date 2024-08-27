import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { ROLE_STATE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import type { WorkspaceGroupModel, WorkspaceUser } from '@/schema/identity/workspace-group/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { TableDataItem } from '@/common/modules/widgets/types/widget-data-type';

export const useWorkspaceGroupPageStore = defineStore('page-workspace-group', () => {
    const state = reactive({
        loading: false,
        workspaceGroups: [] as WorkspaceGroupModel[],
        selectedIndices: [] as number[],
        pageStart: 1,
        pageLimit: 15,
        totalCount: 0,
        searchFilters: [] as ConsoleFilter[],

        // Group User Tab
        groupUserPage: 1,
        groupUserSearchText: '',
        groupUserSortBy: 'user_id',
        isUserSortDesc: false,
        selectedUserIndices: [] as number[],
        groupUserPageStart: 1,
        groupUserPageLimit: 15,
        roles: [] as RoleModel[],

        // Workspace Tab
        workspacePage: 1,
        workspaceSearchText: '',
        workspaceSortBy: 'name',
        isWorkspaceSortDesc: false,
        selectedWorkspaceIndices: [] as number[],
        workspacePageStart: 1,
        workspacePageLimit: 15,

        modal: {
            type: '',
            title: '',
            themeColor: 'primary',
            visible: '',
        },
        // Additional data added for data transfer between modals
        modalAdditionalData: {} as { workspaceGroupId?: string, selectedWorkspace?: TableDataItem, selectedGroupUser?: WorkspaceUser },
    });

    // The getters method using reactive will not work when using the store.$dispose method with the error
    //  "Write operation failed: computed value is readonly" error message when using the store.$dispose method,
    // so we change to a method that doesn't use the reactive API.
    const getters = {
        selectedWorkspaceGroup: computed(() => {
            const [index] = state.selectedIndices;

            return state.workspaceGroups[index];
        }),
        workspaceGroupUsers: computed(() => {
            const filteredUsers = getters.selectedWorkspaceGroup?.users?.filter(actions.filterUser);

            const sortedSelectedGroupUsers = filteredUsers?.sort((a, b) => {
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

            return sortedSelectedGroupUsers?.slice(state.groupUserPageStart - 1, state.groupUserPageStart - 1 + state.groupUserPageLimit);
        }),
        selectedGroupUsersByIndices: computed<WorkspaceUser[]>(() => {
            const groupUsers: any[] = [];

            state.selectedUserIndices.forEach((d:number) => {
                groupUsers.push(getters.workspaceGroupUsers[d]);
            });

            return groupUsers ?? [];
        }),
        selectedWorkspaces: computed(() => {
            const filteredWorkspaces = getters.selectedWorkspaceGroup?.workspaces?.filter(actions.filterWorkspace);

            const sortedSelectedWorkspaces = filteredWorkspaces?.sort((a, b) => {
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
                return sortedSelectedWorkspaces.slice(state.workspacePageStart - 1);
            }

            return sortedSelectedWorkspaces?.slice(state.workspacePageStart - 1, state.workspacePageStart - 1 + state.workspacePageLimit);
        }),
        selectedWorkspacesByIndices: computed<string[]>(() => {
            const workspaces: any[] = [];

            state.selectedWorkspaceIndices.forEach((d:number) => {
                workspaces.push(getters.selectedWorkspaces[d]);
            });

            return workspaces ?? [];
        }),
        groupUserTotalCount: computed(() => {
            const [index] = state.selectedIndices;

            if (state.groupUserSearchText) {
                const filteredUsers = state.workspaceGroups[index].users.filter(actions.filterUser);

                return filteredUsers.length;
            }

            return state.workspaceGroups[index]?.users?.length;
        }),
        workspaceTotalCount: computed(() => {
            const [index] = state.selectedIndices;

            if (state.workspaceSearchText) {
                const filteredWorkspaces = state.workspaceGroups[index].workspaces.filter(actions.filterWorkspace);

                return filteredWorkspaces.length;
            }

            return state.workspaceGroups[index]?.workspaces?.length;
        }),
        groupUserPage: computed(() => state.groupUserPageStart / state.groupUserPageLimit),
    };

    const actions = {
        updateModalSettings: ({
            type, title, themeColor = 'primary', visible, additionalData = {},
        }) => {
            state.modal = {
                type,
                title,
                themeColor,
                visible,
            };
            state.modalAdditionalData = additionalData;
        },
        closeModal: () => {
            state.modal = {
                type: '',
                title: '',
                themeColor: 'primary',
                visible: '',
            };
            state.modalAdditionalData = {};
        },
        resetGroupUser: () => {
            state.groupUserPage = 1;
            state.groupUserSearchText = '';
            state.groupUserSortBy = 'user_id';
            state.isUserSortDesc = false;
            state.selectedUserIndices = [] as number[];
            state.groupUserPageStart = 1;
            state.groupUserPageLimit = 15;
        },
        resetWorkspace: () => {
            state.workspacePage = 1;
            state.workspaceSearchText = '';
            state.workspaceSortBy = 'name';
            state.isWorkspaceSortDesc = false;
            state.selectedWorkspaceIndices = [] as number[];
            state.workspacePageStart = 1;
            state.workspacePageLimit = 15;
        },
        resetSelectedWorkspace: () => {
            state.selectedWorkspaceIndices = [];
        },
        reset: () => {
            state.loading = false;
            state.workspaceGroups = [] as WorkspaceGroupModel[];
            state.selectedIndices = [] as number[];
            state.pageStart = 1;
            state.pageLimit = 15;
            state.totalCount = 0;

            actions.resetGroupUser();
            actions.resetWorkspace();
            actions.closeModal();
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
        listRoles: async () => {
            try {
                const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
                    query: {
                        filter: [
                            { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
                        ],
                    },
                });
                state.roles = results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.roles = [];
            }
        },
    };
    const state2 = reactive({
        selectedWorkspaceGroup: computed(() => {
            const [index] = state.selectedIndices;

            return state.workspaceGroups[index];
        }),
        workspaceGroupUsers: computed(() => {
            const filteredUsers = getters.selectedWorkspaceGroup?.users?.filter(actions.filterUser);

            const sortedSelectedGroupUsers = filteredUsers?.sort((a, b) => {
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

            return sortedSelectedGroupUsers?.slice(state.groupUserPageStart - 1, state.groupUserPageStart - 1 + state.groupUserPageLimit);
        }),
        selectedGroupUsersByIndices: computed(() => {
            const groupUsers: any[] = [];

            state.selectedUserIndices.forEach((d:number) => {
                groupUsers.push(getters.workspaceGroupUsers[d]);
            });

            return groupUsers ?? [];
        }),
        selectedWorkspaces: computed(() => {
            const filteredWorkspaces = getters.selectedWorkspaceGroup?.workspaces?.filter(actions.filterWorkspace);

            const sortedSelectedWorkspaces = filteredWorkspaces?.sort((a, b) => {
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
                return sortedSelectedWorkspaces.slice(state.workspacePageStart - 1);
            }

            return sortedSelectedWorkspaces?.slice(state.workspacePageStart - 1, state.workspacePageStart - 1 + state.workspacePageLimit);
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
                const filteredUsers = state.workspaceGroups[index].users.filter(actions.filterUser);

                return filteredUsers.length;
            }

            return state.workspaceGroups[index]?.users?.length;
        }),
        workspaceTotalCount: computed(() => {
            const [index] = state.selectedIndices;

            if (state.workspaceSearchText) {
                const filteredWorkspaces = state.workspaceGroups[index].workspaces.filter(actions.filterWorkspace);

                return filteredWorkspaces.length;
            }

            return state.workspaceGroups[index]?.workspaces?.length;
        }),
        groupUserPage: computed(() => state.groupUserPageStart / state.groupUserPageLimit),
    });
    return {
        state,
        state2,
        getters,
        ...actions,
    };
});
