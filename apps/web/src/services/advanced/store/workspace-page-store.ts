import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostReportConfigListParameters } from '@/schema/cost-analysis/cost-report-config/api-verbs/list';
import type { CostReportConfigModel } from '@/schema/cost-analysis/cost-report-config/model';
import type { RoleBindingListParameters, RoleBindingListResponse } from '@/schema/identity/role-binding/api-verbs/list';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { ROLE_STATE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface WorkspacePageState {
    loading: boolean;
    userLoading: boolean;
    workspaces: WorkspaceModel[];
    totalCount: number;
    selectedIndices: number[];
    pageStart: number,
    pageLimit: number,
    searchFilters: ConsoleFilter[],
    roleBindings: RoleBindingModel[],
    selectedType: string,
    costReportConfig: CostReportConfigModel|null|undefined,
    // workspace users
    workspaceUsersLoading: boolean,
    workspaceUsers: WorkspaceUserModel[],
    usersTotalCount: number,
    usersPageStart: number,
    usersPageLimit: number,
    usersSearchfilters: ConsoleFilter[],
    roles: RoleModel[],
}

export const useWorkspacePageStore = defineStore('page-workspace', {
    state: (): WorkspacePageState => ({
        loading: false,
        userLoading: false,
        workspaces: [] as WorkspaceModel[],
        totalCount: 0,
        selectedIndices: [] as number[],
        pageStart: 1,
        pageLimit: 15,
        searchFilters: [],
        roleBindings: [],
        selectedType: 'ALL',
        costReportConfig: null,
        // workspace users
        workspaceUsersLoading: false,
        workspaceUsers: [],
        usersTotalCount: 0,
        usersPageStart: 1,
        usersPageLimit: 15,
        usersSearchfilters: [],
        roles: [],
    }),
    getters: {
        timezone: () => store.state.user.timezone,
        selectedWorkspaces: (state) => state.selectedIndices.reduce((refined: WorkspaceModel[], idx: number) : WorkspaceModel[] => {
            refined.push(state.workspaces[idx]);
            return refined;
        }, []),
        roleBindingList: (state) => state.roleBindings,
        roleMap: (state) => state.roles.reduce((map, role) => {
            map[role.role_id] = role;
            return map;
        }, {}),
        roleBindingMap: (state) => state.roleBindings.reduce((map, roleBinding) => {
            map[roleBinding.role_binding_id] = roleBinding;
            return map;
        }, {}),
        currency: (state) => state.costReportConfig?.currency,
    },
    actions: {
        async load(params: WorkspaceListParameters) {
            this.loading = true;
            try {
                const { results, total_count } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>(params);
                this.workspaces = results || [];
                this.totalCount = total_count || 0;
                this.selectedIndices = [];
                if (!this.roles.length) {
                    await this.listRoles();
                }

                const response = await SpaceConnector.clientV2.identity.roleBinding.list<RoleBindingListParameters, RoleBindingListResponse>();
                this.roleBindings = response.results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.workspaces = [];
                this.totalCount = 0;
                this.roles = [];
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
        async listRoles(params?: RoleListParameters) {
            try {
                const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
                    ...params,
                    query: {
                        ...params?.query,
                        filter: [
                            ...(params?.query?.filter || []),
                            { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
                        ],
                    },
                });
                this.roles = results || [];
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                this.roles = [];
                throw e;
            }
        },
        async fetchCostReportConfig() {
            if (this.costReportConfig !== null) return;
            try {
                const { results } = await SpaceConnector.clientV2.costAnalysis.costReportConfig.list<CostReportConfigListParameters, ListResponse<CostReportConfigModel>>();
                this.costReportConfig = results?.[0];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.costReportConfig = undefined;
            }
        },
    },
});
