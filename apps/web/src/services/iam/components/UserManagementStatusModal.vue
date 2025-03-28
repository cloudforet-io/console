<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { cloneDeep, map } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PStatus, PButtonModal, PDataTable, PBadge,
} from '@cloudforet/mirinae';

import type { RoleBindingDeleteParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/delete';
import type { UserDeleteParameters } from '@/api-clients/identity/user/schema/api-verbs/delete';
import type { UserDisableParameters } from '@/api-clients/identity/user/schema/api-verbs/disable';
import type { UserEnableParameters } from '@/api-clients/identity/user/schema/api-verbs/enable';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ServiceReferenceMap } from '@/store/reference/service-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useRoleFormatter, userStateFormatter } from '@/services/iam/composables/refined-table-data';
import { USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { UserListItemType } from '@/services/iam/types/user-type';


const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userPageGetters = userPageStore.getters;

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const storeState = reactive({
    serviceList: computed<ServiceReferenceMap>(() => allReferenceGetters.service),
    selectedUsers: computed(() => userPageGetters.selectedUsers),
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
    filteredUniqueItems: [],
});

/* Component */
const checkModalConfirm = async () => {
    let responses: boolean[] = [];
    let languagePrefix = 'DELETE';
    const items = state.isRemoveOnlyWorkspace ? userPageGetters.selectedOnlyWorkspaceUsers : state.filteredUniqueItems;
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

/* API */
const removeUser = async (role_binding_id?: string): Promise<boolean> => {
    try {
        if (!role_binding_id) return false;
        await SpaceConnector.clientV2.identity.roleBinding.delete<RoleBindingDeleteParameters>({
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

/* Watcher */
watch([() => storeState.serviceList, () => storeState.selectedUsers], ([nv_service_list, nv_selected_users]) => {
    if (nv_service_list) {
        const list: UserListItemType[] | (UserListItemType & { service: string; })[] = [];
        nv_selected_users.forEach((selectedUser) => {
            Object.values(nv_service_list).forEach((service) => {
                if (service && service.data && service.data.members) {
                    if (Object.keys(service.data.members).includes('USER')) {
                        if (selectedUser.user_id && service.data.members.USER.includes(selectedUser.user_id)) {
                            list.push({
                                ...selectedUser,
                                service: service.label,
                            });
                        }
                    } else {
                        list.push(selectedUser);
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
                        ...rest,
                    };
                }
                if (cur.service !== undefined) {
                    if (!Array.isArray(acc[cur.user_id].service)) {
                        acc[cur.user_id].service = [];
                    }
                    acc[cur.user_id].service.push(cur.service);
                }
                return acc;
            }, {}));
        }
    }
}, { deep: true, immediate: true });
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
                :items="state.isRemoveOnlyWorkspace ? userPageGetters.selectedOnlyWorkspaceUsers : state.filteredUniqueItems"
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
                                {{ userGroup.name }}
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
