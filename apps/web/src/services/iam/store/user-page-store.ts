import { computed, reactive } from 'vue';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import type { UserGroupListParameters } from '@/schema/identity/user-group/api-verbs/list';
import type { UserGroupModel } from '@/schema/identity/user-group/model';
import type { UserGetParameters } from '@/schema/identity/user/api-verbs/get';
import type { UserListParameters } from '@/schema/identity/user/api-verbs/list';
import type { UserModel } from '@/schema/identity/user/model';
import type { FindWorkspaceUserParameters } from '@/schema/identity/workspace-user/api-verbs/find';
import type { WorkspaceUserGetParameters } from '@/schema/identity/workspace-user/api-verbs/get';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel, SummaryWorkspaceUserModel } from '@/schema/identity/workspace-user/model';

import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { UserListItemType, ModalSettingState, ModalState } from '@/services/iam/types/user-type';

export const useUserPageStore = defineStore('page-user', () => {
    const userStore = useUserStore();

    const state = reactive({
        isAdminMode: false,
        loading: true,
        users: [] as UserListItemType[],
        selectedUser: {} as UserListItemType,
        roles: [] as RoleModel[],
        totalCount: 0,
        selectedIndices: [],
        pageStart: 1,
        pageLimit: 15,
        searchFilters: [] as ConsoleFilter[],
        // This is for workspace created case in admin mode
        afterWorkspaceCreated: false,
        createdWorkspaceId: undefined as string | undefined,
        modal: {
            type: '',
            title: '',
            themeColor: 'primary',
            visible: undefined,
        } as ModalState,
    });
    const getters = reactive({
        isWorkspaceOwner: computed(() => userStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
        selectedUsers: computed(():UserListItemType[] => {
            if (state.selectedIndices.length === 1 && !isEmpty(state.selectedUser)) return [state.selectedUser];
            const users: UserListItemType[] = [];
            state.selectedIndices.forEach((d:number) => {
                users.push(state.users[d]);
            });
            return users ?? [];
        }),
        selectedOnlyWorkspaceUsers: computed(():UserListItemType[] => state.users.filter((user) => !user.role_binding_info?.workspace_group_id)),
        roleMap: computed(() => {
            const map: Record<string, RoleModel> = {};
            state.roles.forEach((role) => {
                map[role.role_id] = role;
            });
            return map;
        }),
    });
    const actions = {
        // User
        reset() {
            state.isAdminMode = false;
            state.loading = true;
            state.users = [] as UserListItemType[];
            state.selectedUser = {} as UserListItemType;
            state.roles = [] as RoleModel[];
            state.totalCount = 0;
            state.selectedIndices = [];
            state.pageStart = 1;
            state.pageLimit = 15;
            state.searchFilters = [] as ConsoleFilter[];
            state.afterWorkspaceCreated = false;
            state.createdWorkspaceId = undefined as string | undefined;
            state.modal = {
                type: '',
                title: '',
                themeColor: 'primary',
                visible: undefined,
            } as ModalState;
        },
        async listUsers(params: UserListParameters) {
            try {
                const res = await SpaceConnector.clientV2.identity.user.list<UserListParameters, ListResponse<UserModel>>(params);
                state.users = res.results || [];
                state.totalCount = res.total_count ?? 0;
                state.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.users = [];
                state.totalCount = 0;
                throw e;
            }
        },
        async getUser(params: UserGetParameters) {
            try {
                state.selectedUser = await SpaceConnector.clientV2.identity.user.get<UserGetParameters, UserModel>(params);
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, e.message);
                throw e;
            }
        },
        // Workspace User
        async listWorkspaceUsers(params: WorkspaceUserListParameters) {
            try {
                const { results, total_count } = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>(params);
                // TODO: here
                // if (results && results.length > 0) {
                //     const userIdList = results.map(result => result.user_id)
                //     userIdList.forEach()
                // }
                state.users = (results ?? [])?.map((item) => ({
                    ...item,
                    role_type: item.role_type,
                    role_binding: {
                        type: item.role_binding_info?.role_type ?? ROLE_TYPE.USER,
                        name: state.roles?.find((role) => role.role_id === item.role_binding_info?.role_id)?.name ?? '',
                    },
                }));
                state.totalCount = total_count ?? 0;
                state.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.users = [];
                state.totalCount = 0;
                throw e;
            }
        },
        async listUserGroupPerUser() {
            const userIdList = state.users.map((user) => user.user_id);
            userIdList.forEach(async (userId) => {
                const res = await SpaceConnector.clientV2.identity.userGroup.list<UserGroupListParameters, ListResponse<UserGroupModel>>({
                    user_id: userId,
                });
                if (res.results && res.results.length > 0) {
                    const userGroupList = res.results.map((userGroup) => userGroup.name);
                    state.users.forEach((user) => {
                        if (user.user_id === userId) {
                            user.user_group = userGroupList;
                        } else if (user.user_id !== userId) {
                            user.user_group = [];
                        }
                    });
                }
            });
        },
        async getWorkspaceUser(params: WorkspaceUserGetParameters) {
            try {
                const res = await SpaceConnector.clientV2.identity.workspaceUser.get<WorkspaceUserGetParameters, WorkspaceUserModel>(params);
                return {
                    ...res,
                    role_type: res.role_type,
                    role_binding: {
                        type: res.role_binding_info?.role_type ?? ROLE_TYPE.USER,
                        name: state.roles?.find((role) => role.role_id === res.role_binding_info?.role_id)?.name ?? '',
                    },
                };
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, e.message);
                throw e;
            }
        },
        async findWorkspaceUser(params?: FindWorkspaceUserParameters) {
            try {
                const { results } = await SpaceConnector.clientV2.identity.workspaceUser.find<FindWorkspaceUserParameters, ListResponse<SummaryWorkspaceUserModel>>(params);
                return results || [];
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, e.message);
                throw e;
            }
        },
        setUserEmail(userId?: string, email?: string) {
            const idx = state.users.findIndex((item) => item.user_id === userId);
            state.users[idx].email = email;
            if (state.selectedUser.user_id === userId) {
                state.selectedUser.email = email;
            }
        },
        updateModalSettings({
            type, title, themeColor, modalVisibleType,
        }: ModalSettingState) {
            state.modal = {
                ...state.modal,
                type,
                title,
                themeColor,
                visible: modalVisibleType ?? undefined,
            };
        },
        // Role
        async listRoles() {
            try {
                const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>();
                state.roles = results || [];
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.roles = [];
                throw e;
            }
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
