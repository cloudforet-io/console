import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { ROLE_STATE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import type { WorkspaceGroupUserListParameters } from '@/schema/identity/workspace-group-user/api-verbs/list';
import type { WorkspaceGroupUserModel } from '@/schema/identity/workspace-group-user/model';
import type { WorkspaceGroupModel, WorkspaceUser } from '@/schema/identity/workspace-group/model';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

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

        // Group User Tab,
        roles: [] as RoleModel[],

        modal: {
            type: '',
            title: '',
            themeColor: 'primary',
            visible: '',
        },
        // Additional data added for data transfer between modals
        modalAdditionalData: {} as { workspaceGroupId?: string, selectedWorkspace?: TableDataItem, selectedGroupUser?: WorkspaceUser },
    });

    const userTabState = reactive({
        selectedUserIndices: [] as number[],
        userInSelectedGroup: [] as WorkspaceGroupUserModel['users'],
        userInSelectedGroupTotalCount: 0,
        searchText: '',
        thisPage: 1,
        sortBy: 'name',
        sortDesc: true,
        pageStart: 1,
        pageLimit: 15,
        loading: false,
    });

    const workspaceTabState = reactive({
        selectedWorkspaceIndices: [] as number[],
        workspacesInSelectedGroup: [] as WorkspaceModel[],
        workspacesInSelectedGroupTotalCount: 0,
        searchText: '',
        thisPage: 1,
        sortBy: 'name',
        sortDesc: true,
        pageStart: 1,
        pageLimit: 15,
        loading: false,
    });

    // The getters method using reactive will not work when using the store.$dispose method with the error
    //  "Write operation failed: computed value is readonly" error message when using the store.$dispose method,
    // so we change to a method that doesn't use the reactive API.
    const getters = reactive({
        selectedWorkspaceGroupId: computed(() => state.workspaceGroups[state.selectedIndices[0]]?.workspace_group_id),
        groupUserPage: computed(() => userTabState.pageStart / userTabState.pageLimit),
        selectedWorkspaceIds: computed<string[]>(() => workspaceTabState.selectedWorkspaceIndices.map((index: number) => workspaceTabState.workspacesInSelectedGroup[index].workspace_id)),
        selectedGroupUsersByIndices: computed(() => userTabState.selectedUserIndices.map((index: number) => userTabState.userInSelectedGroup[index])),
    });


    const workspacesInSelectedGroupApiQuery = new ApiQueryHelper();
    const getWorkspacesInSelectedGroupApiQuery = ():Query => {
        workspacesInSelectedGroupApiQuery.setSort(workspaceTabState.sortBy, workspaceTabState.sortDesc)
            .setPage(workspaceTabState.pageStart, workspaceTabState.pageLimit)
            .setFilters([
                { k: 'workspace_group_id', v: getters.selectedWorkspaceGroupId, o: '=' },
                { k: 'name', v: workspaceTabState.searchText, o: '' },
            ]);
        return workspacesInSelectedGroupApiQuery.data;
    };

    const workspacesGroupUserApiQuery = new ApiQueryHelper();
    const getWorkspacesGroupUserApiQuery = ():Query => {
        workspacesGroupUserApiQuery.setSort(workspaceTabState.sortBy, workspaceTabState.sortDesc)
            .setPage(workspaceTabState.pageStart, workspaceTabState.pageLimit)
            .setFilters([
                { k: 'name', v: workspaceTabState.searchText, o: '' },
            ]);
        return workspacesGroupUserApiQuery.data;
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
            userTabState.thisPage = 1;
            userTabState.searchText = '';
            userTabState.sortBy = 'user_id';
            userTabState.sortDesc = false;
            userTabState.selectedUserIndices = [] as number[];
            userTabState.pageStart = 1;
            userTabState.pageLimit = 15;
        },
        resetWorkspaceTab: () => {
            workspaceTabState.searchText = '';
            workspaceTabState.thisPage = 1;
            workspaceTabState.sortBy = 'name';
            workspaceTabState.sortDesc = true;
            workspaceTabState.pageStart = 1;
            workspaceTabState.pageLimit = 15;
            workspaceTabState.selectedWorkspaceIndices = [] as number[];
        },
        reset: () => {
            state.loading = false;
            state.workspaceGroups = [] as WorkspaceGroupModel[];
            state.selectedIndices = [] as number[];
            state.pageStart = 1;
            state.pageLimit = 15;
            state.totalCount = 0;

            actions.resetGroupUser();
            actions.resetWorkspaceTab();
            actions.closeModal();
        },
        resetSelectedWorkspace: () => {
            workspaceTabState.selectedWorkspaceIndices = [] as number[];
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
        listWorkspacesInSelectedGroup: async () => {
            workspaceTabState.loading = true;
            try {
                const { results, total_count } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
                    query: getWorkspacesInSelectedGroupApiQuery(),
                });
                workspaceTabState.workspacesInSelectedGroup = results || [];
                workspaceTabState.workspacesInSelectedGroupTotalCount = total_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                workspaceTabState.workspacesInSelectedGroup = [];
                workspaceTabState.workspacesInSelectedGroupTotalCount = 0;
            } finally {
                workspaceTabState.loading = false;
            }
        },
        listWorkspaceGroupUsers: async () => {
            userTabState.loading = true;
            try {
                const { results } = await SpaceConnector.clientV2.identity.workspaceGroupUser.list<WorkspaceGroupUserListParameters, ListResponse<WorkspaceGroupUserModel>>({
                    query: getWorkspacesGroupUserApiQuery(),
                    workspace_group_id: getters.selectedWorkspaceGroupId,
                });
                userTabState.userInSelectedGroup = results?.[0].users || [];
                userTabState.userInSelectedGroupTotalCount = results?.[0].users.length || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                userTabState.userInSelectedGroup = [];
                userTabState.userInSelectedGroupTotalCount = 0;
            } finally {
                userTabState.loading = false;
            }
        },
    };
    return {
        state,
        userTabState,
        workspaceTabState,
        getters,
        ...actions,
    };
});
