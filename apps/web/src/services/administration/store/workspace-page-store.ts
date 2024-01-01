import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleBindingListParameters, RoleBindingListResponse } from '@/schema/identity/role-binding/api-verbs/list';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface WorkspacePageState {
    loading: boolean;
    userLoading: boolean;
    workspaces: WorkspaceTableModel[];
    totalCount: number;
    selectedIndices: number[];
    pageStart: number,
    pageLimit: number,
    searchFilters: ConsoleFilter[],
    roleBindings: RoleBindingModel[],
    // workspace users
    workspaceUsersLoading: boolean,
    workspaceUsers: WorkspaceUserModel[],
    usersTotalCount: number,
    usersPageStart: number,
    usersPageLimit: number,
    usersSearchfilters: ConsoleFilter[],
}

interface WorkspaceTableModel extends WorkspaceModel {
    users?: number;
}

export const useWorkspacePageStore = defineStore('workspace-page', {
    state: (): WorkspacePageState => ({
        loading: false,
        userLoading: false,
        workspaces: [] as WorkspaceTableModel[],
        totalCount: 0,
        selectedIndices: [] as number[],
        pageStart: 1,
        pageLimit: 15,
        searchFilters: [],
        roleBindings: [],
        // workspace users
        workspaceUsersLoading: false,
        workspaceUsers: [],
        usersTotalCount: 0,
        usersPageStart: 1,
        usersPageLimit: 15,
        usersSearchfilters: [],
    }),
    getters: {
        timezone: () => store.state.user.timezone,
        selectedWorkspaces: (state) => state.selectedIndices.reduce((refined: WorkspaceModel[], idx: number) : WorkspaceModel[] => {
            refined.push(state.workspaces[idx]);
            return refined;
        }, []),
        roleBindingList: (state) => state.roleBindings,
    },
    actions: {
        async load(params: WorkspaceListParameters) {
            this.loading = true;
            try {
                const { results, total_count } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>(params);
                this.workspaces = results || [];
                this.totalCount = total_count || 0;
                this.selectedIndices = [];

                const response = await SpaceConnector.clientV2.identity.roleBinding.list<RoleBindingListParameters, RoleBindingListResponse>(params);
                this.roleBindings = response.results || [];
                this.workspaces = this.workspaces.map((workspace) => {
                    const roleBindingsFilteredByWorkspaceId = this.roleBindings.filter((roleBinding) => roleBinding.workspace_id === workspace.workspace_id);
                    return {
                        ...workspace,
                        users: roleBindingsFilteredByWorkspaceId.length,
                    };
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                this.workspaces = [];
                this.totalCount = 0;
            } finally {
                this.loading = false;
            }
        },

        async listWorkspaceUsers(params: WorkspaceUserListParameters) {
            this.userLoading = true;
            try {
                const { results, total_count } = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>(params);
                this.workspaceUsers = results || [];
                this.usersTotalCount = total_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                this.userLoading = false;
            }
        },
    },
});
