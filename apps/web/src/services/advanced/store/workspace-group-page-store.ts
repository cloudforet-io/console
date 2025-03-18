import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostReportConfigListParameters } from '@/api-clients/cost-analysis/cost-report-config/schema/api-verbs/list';
import type { CostReportConfigModel } from '@/api-clients/cost-analysis/cost-report-config/schema/model';
import { ROLE_STATE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import type { WorkspaceGroupUserListParameters } from '@/api-clients/identity/workspace-group-user/schema/api-verbs/list';
import type { WorkspaceGroupUserModel, WorkspaceGroupUser } from '@/api-clients/identity/workspace-group-user/schema/model';
import type { WorkspaceGroupListParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/list';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import type { Currency } from '@/store/display/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

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
        modalAdditionalData: {} as { workspaceGroupId?: string, selectedWorkspace?: WorkspaceModel, selectedGroupUser?: WorkspaceGroupUser },
    });

    const userTabState = reactive({
        selectedUserIndices: [] as number[],
        userInSelectedGroup: [] as WorkspaceGroupUser[],
        userInSelectedGroupTotalCount: 0,
        searchText: '',
        thisPage: 1,
        sortBy: 'name',
        sortDesc: false,
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
        sortDesc: false,
        pageStart: 1,
        pageLimit: 15,
        loading: false,
        costReportConfig: null as CostReportConfigModel|null|undefined,
    });

    // The getters method using reactive will not work when using the store.$dispose method with the error
    //  "Write operation failed: computed value is readonly" error message when using the store.$dispose method,
    // so we change to a method that doesn't use the reactive API.
    const getters = reactive({
        selectedWorkspaceGroup: computed(() => state.workspaceGroups[state.selectedIndices[0]]),
        selectedWorkspaceGroupId: computed(() => state.workspaceGroups[state.selectedIndices[0]]?.workspace_group_id),
        groupUserPage: computed(() => userTabState.pageStart / userTabState.pageLimit),
        selectedWorkspaceIds: computed<string[]>(() => workspaceTabState.selectedWorkspaceIndices.map((index: number) => workspaceTabState.workspacesInSelectedGroup[index].workspace_id)),
        selectedGroupUsersByIndices: computed<WorkspaceGroupUser[]>(() => userTabState.selectedUserIndices.map((index: number) => userTabState.userInSelectedGroup[index])),
        currency: computed<Currency|undefined>(() => workspaceTabState.costReportConfig?.currency),
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

    const workspaceGroupListApiQueryHelper = new ApiQueryHelper()
        .setPageStart(state.pageStart).setPageLimit(state.pageLimit)
        .setSort('name', true);
    const workspaceGroupListApiQuery = workspaceGroupListApiQueryHelper.data;
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
        fetchWorkspaceGroups: async (option?: {
            query?: Query, blockSelectedIndicesReset?: boolean
        }) => {
            state.loading = true;

            try {
                const { results } = await SpaceConnector.clientV2.identity.workspaceGroup.list<WorkspaceGroupListParameters, ListResponse<WorkspaceGroupModel>>({
                    query: option?.query ?? workspaceGroupListApiQuery,
                });

                state.workspaceGroups = results || [];
                if (!option?.blockSelectedIndicesReset) state.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.workspaceGroups = [];
            } finally {
                state.loading = false;
            }
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
                    workspace_group_id: getters.selectedWorkspaceGroupId,
                });
                const users = results?.[0].users || [];
                const searchFilteredUsers = users.filter(filterSearchUser);
                const sortedSelectedGroupUsers = filterSortUser(searchFilteredUsers);


                userTabState.userInSelectedGroup = sortedSelectedGroupUsers || [];
                userTabState.userInSelectedGroupTotalCount = results?.[0].users?.length || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                userTabState.userInSelectedGroup = [];
                userTabState.userInSelectedGroupTotalCount = 0;
            } finally {
                userTabState.loading = false;
            }
        },
        fetchCostReportConfig: async () => {
            if (workspaceTabState.costReportConfig !== null) return;
            try {
                const { results } = await SpaceConnector.clientV2.costAnalysis.costReportConfig.list<CostReportConfigListParameters, ListResponse<CostReportConfigModel>>();
                workspaceTabState.costReportConfig = results?.[0];
            } catch (e) {
                ErrorHandler.handleError(e);
                workspaceTabState.costReportConfig = undefined;
            }
        },
    };
    const filterSearchUser = (user:WorkspaceGroupUser) => {
        const searchText = userTabState.searchText.trim();

        if (searchText === '') {
            return true;
        }

        const userIdMatches = user.user_id && user.user_id.includes(searchText);

        return userIdMatches;
    };

    const filterSortUser = (users: WorkspaceGroupUser[]) : WorkspaceGroupUser[] => {
        const sortedSelectedGroupUsers = users?.sort((a, b) => {
            const aValue = a[userTabState.sortBy];
            const bValue = b[userTabState.sortBy];

            if (aValue === undefined) return 1;
            if (bValue === undefined) return -1;

            if (userTabState.sortDesc) {
                return bValue.localeCompare(aValue);
            }

            return aValue.localeCompare(bValue);
        });

        if (userTabState.userInSelectedGroupTotalCount < userTabState.pageStart - 1 + userTabState.pageLimit) {
            return sortedSelectedGroupUsers.slice(userTabState.pageStart - 1);
        }

        return sortedSelectedGroupUsers?.slice(userTabState.pageStart - 1, userTabState.pageStart - 1 + userTabState.pageLimit);
    };

    return {
        state,
        userTabState,
        workspaceTabState,
        getters,
        ...actions,
    };
});
