// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { computed, reactive } from 'vue';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import type { UserGroupListParameters } from '@/api-clients/identity/user-group/schema/api-verbs/list';
import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';
import type { UserGetParameters } from '@/api-clients/identity/user/schema/api-verbs/get';
import type { UserListParameters } from '@/api-clients/identity/user/schema/api-verbs/list';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import type { FindWorkspaceUserParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/find';
import type { WorkspaceUserGetParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/get';
import type { WorkspaceUserListParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/list';
import type { WorkspaceUserModel, SummaryWorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { UserModalType } from '@/services/iam/types/modal.type';
import type { UserListItemType, ModalSettingState, ModalState } from '@/services/iam/types/user-type';

interface UserPageModalState {
    previousModalType: UserModalType | undefined;
    bulkMfaSettingModalVisible: boolean;
    mfaSecretKeyDeleteModalVisible: boolean;
}

export const useUserPageStore = defineStore('page-user', () => {
    const authorizationStore = useAuthorizationStore();

    const state = reactive({
        isAdminMode: false,
        loading: true,
        users: [] as UserListItemType[],
        selectedUser: {} as UserListItemType,
        roles: [] as RoleModel[],
        totalCount: 0,
        selectedIndices: [] as number[],
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
        selectedUserForForm: undefined as UserListItemType | undefined,
    });

    const modalState = reactive<UserPageModalState>({
        previousModalType: undefined,
        bulkMfaSettingModalVisible: false,
        mfaSecretKeyDeleteModalVisible: false,
    });

    const getters = reactive({
        isWorkspaceOwner: computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
        selectedUsers: computed<UserListItemType[]>(() => {
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

    const mutations = {
        setPreviousModalType(type: UserModalType | undefined) {
            modalState.previousModalType = type;
        },
        setBulkMfaSettingModalVisible(visible: boolean) {
            modalState.bulkMfaSettingModalVisible = visible;
        },
        setMfaSecretKeyDeleteModalVisible(visible: boolean) {
            modalState.mfaSecretKeyDeleteModalVisible = visible;
        },
        setSelectedUserForForm(user: UserListItemType | undefined) {
            state.selectedUserForForm = user;
        },
    };

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
                const { results = [], total_count = 0 } = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>(params);

                const userIdToGroupMap = await this.fetchUserGroups(results.map((result) => result.user_id));

                state.users = results.map((item) => ({
                    ...item,
                    role_type: item.role_type,
                    role_binding: {
                        type: item.role_binding_info?.role_type ?? ROLE_TYPE.USER,
                        name: state.roles?.find((role) => role.role_id === item.role_binding_info?.role_id)?.name ?? '',
                    },
                    user_group: userIdToGroupMap[item.user_id] || [],
                }));

                state.totalCount = total_count;
                state.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.users = [];
                state.totalCount = 0;
                throw e;
            }
        },

        async fetchUserGroups(userIds: string[]): Promise<Record<string, { user_group_id: string; name: string; }[]>> {
            const userGroupPromises = userIds.map(async (userId) => {
                const { results = [] } = await SpaceConnector.clientV2.identity.userGroup.list<UserGroupListParameters, ListResponse<UserGroupModel>>({ user_id: userId });
                return { userId, userGroups: results.map((group) => ({ user_group_id: group.user_group_id, name: group.name })) };
            });

            const results = await Promise.all(userGroupPromises);
            return results.reduce((acc, { userId, userGroups }) => {
                acc[userId] = userGroups;
                return acc;
            }, {} as Record<string, { user_group_id: string; name: string; }[]>);
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
        modalState,
        getters,
        ...mutations,
        ...actions,
    };
});
