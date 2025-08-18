<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { cloneDeep, map } from 'lodash';

import {
    PButtonModal, PDataTable, PBadge, PStatus,
} from '@cloudforet/mirinae';

import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import { useUserApi } from '@/api-clients/identity/user/composables/use-user-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useRoleFormatter, userStateFormatter } from '@/services/iam/composables/refined-table-data';
import { useRoleBindingDeleteMutation } from '@/services/iam/composables/use-role-binding-delete-mutation';
import { useRoleListQuery } from '@/services/iam/composables/use-role-list-query';
import { useServiceListQuery } from '@/services/iam/composables/use-service-list-query';
import { useUserGroupListQuery } from '@/services/iam/composables/use-user-group-list-query';
import { useUserListQuery } from '@/services/iam/composables/use-user-list-query';
import { useWorkspaceUserListQuery } from '@/services/iam/composables/use-workspace-user-list-query';
import { USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';




const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const { userAPI } = useUserApi();

const { data: workspaceUserList } = useWorkspaceUserListQuery();
const serviceListQuery = useServiceListQuery();
const { roleListData } = useRoleListQuery();

const selectedUserIds = computed<string[]>(() => userPageState.selectedUserIds);
const { userListData: selectedUsers, workspaceUserListData: selectedWorkspaceUsers } = useUserListQuery(selectedUserIds);

const { userGroupListData } = useUserGroupListQuery({
    params: computed(() => ({
        query: {
            filter: [
                { k: 'user_id', v: selectedWorkspaceUsers.value?.map((user) => user.user_id), o: 'in' },
            ],
        },
    })),
});

const state = reactive({
    loading: false,
    fields: computed(() => {
        const baseField = [
            { name: 'user_id', label: 'User ID' },
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
            { name: 'service', label: 'Service' },
            { name: 'user_group', label: 'User Group' },
        ];
        return userPageState.isAdminMode ? [
            ...baseField,
            { name: 'role_id', label: 'Admin Role' },
        ] : [
            ...baseField,
            { name: 'role_type', label: 'Workspace Role Type' },
        ];
    }),
    isRemoveOnlyWorkspace: computed(() => userPageState.modal.visible === 'removeOnlyWorkspace'),
    filteredServices: undefined,
    filteredItems: [],
    filteredUniqueItems: computed(() => {
        const serviceList = serviceListQuery.data.value;
        const userGroups = userGroupListData.value;
        const _selectedUsers = userPageState.isAdminMode ? selectedUsers.value : selectedWorkspaceUsers.value;

        if (!serviceList || !userGroups || !_selectedUsers?.length) return [];

        const list: any[] = [];

        _selectedUsers?.forEach((selectedUser) => {
            Object.values(serviceList).forEach((service) => {
                if (service && service.members) {
                    if (Object.keys(service.members).includes('USER')) {
                        if (selectedUser.user_id && service.members.USER.includes(selectedUser.user_id)) {
                            list.push({
                                ...selectedUser,
                                service: service.name,
                            });
                        }
                    } else {
                        list.push({
                            ...selectedUser,
                            user_group: userGroups
                                .filter((group) => group.users?.includes(selectedUser.user_id ?? ''))
                                .map((group) => group.name),
                        });
                    }
                }
            });
            list.push(selectedUser);
        });


        return Object.values(list.reduce((acc, cur) => {
            if (!acc[cur.user_id]) {
                const { user_id, ...rest } = cur;
                acc[cur.user_id] = {
                    user_id,
                    service: [],
                    user_group: [],
                    ...rest,
                };
            }

            if (cur.service !== undefined) {
                if (!Array.isArray(acc[cur.user_id].service)) {
                    acc[cur.user_id].service = [];
                }
                acc[cur.user_id].service.push(cur.service);
            }
            if (cur.user_group !== undefined) {
                if (!Array.isArray(acc[cur.user_id].user_group)) {
                    acc[cur.user_id].user_group = [];
                }
                acc[cur.user_id].user_group = cur.user_group;
            }
            return acc;
        }, {}));
    }),
    selectedOnlyWorkspaceUsers: computed(() => {
        const workspaceUsers = workspaceUserList.value;
        const userGroups = userGroupListData.value;
        const filteredItems = state.filteredUniqueItems;
        const serviceList = serviceListQuery.data.value;

        if (!workspaceUsers || !userGroups || !filteredItems?.length || !serviceList) return [];

        return workspaceUsers
            .filter((user) => !user.role_binding_info?.workspace_group_id
                && filteredItems.map((item: any) => item.user_id).includes(user.user_id))
            .map((user) => {
                const userServiceNames: string[] = [];
                Object.values(serviceList).forEach((service: any) => {
                    if (service?.members?.USER?.includes(user.user_id)) {
                        userServiceNames.push(service.name);
                    }
                });
                return {
                    ...user,
                    user_group: userGroups
                        .filter((group) => group.users?.includes(user.user_id ?? ''))
                        .map((group) => group.name),
                    service: userServiceNames,
                };
            });
    }),
    roleMap: computed<Record<string, RoleModel>>(() => {
        const _map: Record<string, RoleModel> = {};
        roleListData.value?.forEach((role) => {
            _map[role.role_id] = role;
        });
        return _map;
    }),
});

/* Component */
const checkModalConfirm = async () => {
    let responses: boolean[] = [];
    let languagePrefix = 'DELETE';
    const items = state.isRemoveOnlyWorkspace ? state.selectedOnlyWorkspaceUsers : state.filteredUniqueItems;
    state.loading = true;

    try {
        if (userPageState.modal.type === USER_MODAL_TYPE.DELETE) {
            responses = await Promise.all(map(items, (item) => deleteUser(item?.user_id)));
            userPageState.selectedIndices = [];
        } else if (userPageState.modal.type === USER_MODAL_TYPE.ENABLE) {
            languagePrefix = 'ENABLE';
            responses = await Promise.all(map(items, (item) => enableUser(item?.user_id)));
        } else if (userPageState.modal.type === USER_MODAL_TYPE.DISABLE) {
            languagePrefix = 'DISABLE';
            responses = await Promise.all(map(items, (item) => disableUser(item?.user_id)));
        } else if (userPageState.modal.type === USER_MODAL_TYPE.REMOVE) {
            languagePrefix = 'REMOVE';
            responses = await Promise.all(map(items, (item) => removeUser(item?.role_binding_info?.role_binding_id)));
        }

        const successCount = responses.filter((d) => d).length;
        const failCount = responses.length - successCount;
        if (successCount > 0) {
            const languageCode = `IAM.USER.MAIN.MODAL.ALT_S_${languagePrefix}_USER`;
            showSuccessMessage(i18n.t(languageCode), '');
            emit('confirm');
        } if (failCount > 0) {
            const languageCode = `IAM.USER.MAIN.MODAL.ALT_E_${languagePrefix}_USER`;
            ErrorHandler.handleRequestError(new Error(''), i18n.t(languageCode));
        }
    } catch (e: any) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
        handleClose();
    }
};
const handleClose = () => {
    state.filteredItems = [];
    userPageStore.$patch((_state) => {
        _state.state.modal.visible = undefined;
        _state.state.modal = cloneDeep(_state.state.modal);
    });
};

const queryClient = useQueryClient();
const { key: userListQueryKey } = useServiceQueryKey('identity', 'user', 'list');
const { key: workspaceUserListQueryKey } = useServiceQueryKey('identity', 'workspace-user', 'list');
const { withSuffix: withSuffixUserGetQueryKey } = useServiceQueryKey('identity', 'user', 'get');

const { mutateAsync: deleteRoleBinding } = useRoleBindingDeleteMutation({
    onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: userListQueryKey.value });
        await queryClient.invalidateQueries({ queryKey: workspaceUserListQueryKey.value });
        userPageStore.setSelectedIndices([]);
    },
});

const { mutateAsync: _deleteUser } = useMutation({
    mutationFn: (userId: string) => userAPI.delete({
        user_id: userId,
    }),
    onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: userListQueryKey.value });
        userPageStore.setSelectedIndices([]);
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
});

const { mutateAsync: _enableUser } = useMutation({
    mutationFn: (userId: string) => userAPI.enable({
        user_id: userId,
    }),
    onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: userListQueryKey.value });
        await queryClient.invalidateQueries({ queryKey: withSuffixUserGetQueryKey(selectedUserIds.value[0] || '') });
        userPageStore.setSelectedIndices([]);
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
});

const { mutateAsync: _disableUser } = useMutation({
    mutationFn: (userId: string) => userAPI.disable({
        user_id: userId,
    }),
    onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: userListQueryKey.value });
        await queryClient.invalidateQueries({ queryKey: withSuffixUserGetQueryKey(selectedUserIds.value[0] || '') });
        userPageStore.setSelectedIndices([]);
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
});

/* API */
const removeUser = async (role_binding_id?: string): Promise<boolean> => {
    try {
        if (!role_binding_id) return false;
        await deleteRoleBinding({
            role_binding_id,
        });
        return true;
    } catch (e) {
        return false;
    }
};

const deleteUser = async (userId?: string): Promise<boolean> => {
    try {
        if (!userId) return false;
        await _deleteUser(userId);
        return true;
    } catch (e) {
        return false;
    }
};
const enableUser = async (userId?: string): Promise<boolean> => {
    try {
        if (!userId) return false;
        await _enableUser(userId);
        return true;
    } catch (e) {
        return false;
    }
};
const disableUser = async (userId?: string): Promise<boolean> => {
    try {
        if (!userId) return false;
        await _disableUser(userId);
        return true;
    } catch (e) {
        return false;
    }
};
</script>

<template>
    <p-button-modal :visible="userPageState.modal.visible === 'status' || state.isRemoveOnlyWorkspace"
                    :header-title="userPageState.modal.title"
                    :theme-color="userPageState.modal.themeColor"
                    :loading="state.loading"
                    size="md"
                    @confirm="checkModalConfirm"
                    @close="handleClose"
                    @cancel="handleClose"
    >
        <template #body>
            <p-data-table
                v-if="!userPageState.isAdminMode"
                :fields="state.fields"
                :items="state.isRemoveOnlyWorkspace ? state.selectedOnlyWorkspaceUsers : state.filteredUniqueItems"
            >
                <template #col-state-format="{value}">
                    <p-status v-bind="userStateFormatter(value)"
                              class="capitalize"
                    />
                </template>
                <template #col-service-format="{value}">
                    <div v-if="value.length > 0">
                        <span v-for="(service, i) in value"
                              :key="i"
                              class="mr-2"
                        >
                            <p-badge v-if="i < 3"
                                     badge-type="gray200"
                                     shape="square"
                            >
                                {{ service }}
                            </p-badge>
                            <p-badge v-else-if="i === 3"
                                     badge-type="blue300"
                                     shape="round"
                            >

                                + {{ value.length - i }}
                            </p-badge>
                        </span>
                    </div>
                    <div v-else />
                </template>
                <template v-if="!userPageState.isAdminMode"
                          #col-user_group-format="{value}"
                >
                    <div v-if="value.length > 0">
                        <span v-for="(userGroup, i) in value"
                              :key="i"
                              class="mr-2"
                        >
                            <p-badge v-if="i < 3"
                                     badge-type="gray200"
                                     shape="square"
                            >
                                {{ userGroup }}
                            </p-badge>
                            <p-badge v-else-if="i === 3"
                                     badge-type="blue300"
                                     shape="round"
                            >
                                + {{ value.length - i }}
                            </p-badge>
                        </span>
                    </div>
                    <div v-else />
                </template>
                <template #col-role_id-format="{value}">
                    <span v-if="!value">--</span>
                    <span v-else> {{ state.roleMap[value]?.name }}</span>
                </template>
                <template #col-role_type-format="{value}">
                    <span> {{ useRoleFormatter(value, true).name }}</span>
                </template>
            </p-data-table>
        </template>
    </p-button-modal>
</template>
