// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import type { FindWorkspaceUserParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/find';
import type { SummaryWorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';

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
        selectedUser: {} as UserListItemType,
        selectedUserIds: [] as string[],
        users: [] as UserListItemType[],
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
        // Store the selected users from API call (single source of truth for selected users)
        selectedUsers: [] as UserListItemType[],
        selectedUserForForm: undefined as UserListItemType | undefined,
    });

    const modalState = reactive<UserPageModalState>({
        previousModalType: undefined,
        bulkMfaSettingModalVisible: false,
        mfaSecretKeyDeleteModalVisible: false,
    });

    const getters = reactive({
        isWorkspaceOwner: computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
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
            state.selectedUser = {} as UserListItemType;
            state.selectedUserIds = [];
            state.selectedUsers = [];
            state.roles = [] as RoleModel[];
            state.selectedIndices = [];
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
        setSelectedUserIds(userIds: string[]) {
            state.selectedUserIds = userIds;
        },
        setSelectedIndices(indices: number[]) {
            state.selectedIndices = indices;
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
    };
    return {
        state,
        modalState,
        getters,
        ...mutations,
        ...actions,
    };
});
