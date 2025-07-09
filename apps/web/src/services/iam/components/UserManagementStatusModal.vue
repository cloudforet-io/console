<script lang="ts" setup>
import {
    computed, reactive, watchEffect,
    ref, watch,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';
import { cloneDeep, map } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PDataTable, PBadge, PStatus,
} from '@cloudforet/mirinae';

import type { UserDeleteParameters } from '@/api-clients/identity/user/schema/api-verbs/delete';
import type { UserDisableParameters } from '@/api-clients/identity/user/schema/api-verbs/disable';
import type { UserEnableParameters } from '@/api-clients/identity/user/schema/api-verbs/enable';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useRoleFormatter, userStateFormatter } from '@/services/iam/composables/refined-table-data';
import { useRoleBindingDeleteMutation } from '@/services/iam/composables/use-role-binding-delete-mutation';
import { useServiceListQuery } from '@/services/iam/composables/use-service-list-query';
import { useUserGroupListQuery } from '@/services/iam/composables/use-user-group-list-query';
import { useWorkspaceUserListQuery } from '@/services/iam/composables/use-workspace-user-list-query';
import { USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { UserListItemType } from '@/services/iam/types/user-type';




const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userPageGetters = userPageStore.getters;

const selectedOnlyWorkspaceUsers = ref<UserListItemType[] | any[]>([]);

const emit = defineEmits<{(e: 'confirm'): void; }>();

const { data: workspaceUserList } = useWorkspaceUserListQuery();

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
    filteredUniqueItems: [],
    selectedOnlyWorkspaceUsers,
});

watch(
    [
        () => workspaceUserList.value,
        () => userGroupListData.value,
        () => state.filteredUniqueItems,
        () => serviceListQuery.data.value,
    ],
    ([workspaceUsers, userGroups, filteredItems, serviceList]) => {
        if (!workspaceUsers || !userGroups || !filteredItems?.length || !serviceList) return;

        selectedOnlyWorkspaceUsers.value = workspaceUsers
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
    },
    { immediate: true, deep: true },
);

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
const { key: userListQueryKey } = useServiceQueryKey('identity', userPageState.isAdminMode ? 'user' : 'workspace-user', 'list');

const { mutate: deleteRoleBinding } = useRoleBindingDeleteMutation({
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: userListQueryKey });
        userPageStore.setSelectedIndices([]);
    },
});

/* API */
// TODO: need to refactor
const removeUser = async (role_binding_id?: string): Promise<boolean> => {
    try {
        if (!role_binding_id) return false;
        deleteRoleBinding({
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
        await SpaceConnector.clientV2.identity.user.delete<UserDeleteParameters>({
            user_id: userId,
        });
        return true;
    } catch (e) {
        return false;
    }
};
const enableUser = async (userId?: string): Promise<boolean> => {
    try {
        if (!userId) return false;
        await SpaceConnector.clientV2.identity.user.enable<UserEnableParameters>({
            user_id: userId,
        });
        return true;
    } catch (e) {
        return false;
    }
};
const disableUser = async (userId?: string): Promise<boolean> => {
    try {
        if (!userId) return false;
        await SpaceConnector.clientV2.identity.user.disable<UserDisableParameters>({
            user_id: userId,
        });
        return true;
    } catch (e) {
        return false;
    }
};

const serviceListQuery = useServiceListQuery();

const { userGroupListData } = useUserGroupListQuery({
    params: computed(() => ({
        query: {
            filter: [
                { k: 'user_id', v: userPageState.selectedUsers.map((user) => user.user_id), o: 'in' },
            ],
        },
    })),
});

/* Watcher */
watchEffect(() => {
    const serviceList = serviceListQuery.data.value;

    if (serviceList) {
        const list: any[] = [];
        userPageState.selectedUsers?.forEach((selectedUser) => {
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
                            user_group: userGroupListData.value.filter((group) => group.users?.includes(selectedUser.user_id ?? '')).map((group) => group.name),
                            service: service.name,
                        });
                    }
                }
            });
            list.push(selectedUser);
        });
        if (list.length > 0) {
            state.filteredUniqueItems = Object.values(list.reduce((acc, cur) => {
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
        }
    }
});
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
                :fields="state.fields"
                :items="state.isRemoveOnlyWorkspace ? state.selectedOnlyWorkspaceUsers : state.filteredUniqueItems"
            >
                {{ state.selectedOnlyWorkspaceUsers.length }}
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
                <template #col-user_group-format="{value}">
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
                    <span v-else> {{ userPageGetters.roleMap[value]?.name }}</span>
                </template>
                <template #col-role_type-format="{value}">
                    <span> {{ useRoleFormatter(value, true).name }}</span>
                </template>
            </p-data-table>
        </template>
    </p-button-modal>
</template>
