<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { cloneDeep, map } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PStatus, PButtonModal, PDataTable,
} from '@cloudforet/mirinae';

// import type { ListResponse } from '@/schema/_common/api-verbs/list';
// import type { ServiceListParameters } from '@/schema/alert-manager/service/api-verbs/list';
// import type { ServiceModel } from '@/schema/alert-manager/service/model';
import type { RoleBindingDeleteParameters } from '@/schema/identity/role-binding/api-verbs/delete';
import type { UserDeleteParameters } from '@/schema/identity/user/api-verbs/delete';
import type { UserDisableParameters } from '@/schema/identity/user/api-verbs/disable';
import type { UserEnableParameters } from '@/schema/identity/user/api-verbs/enable';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useRoleFormatter, userStateFormatter } from '@/services/iam/composables/refined-table-data';
import { USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';


const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userPageGetters = userPageStore.getters;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    loading: false,
    fields: computed(() => {
        const baseField = [
            { name: 'user_id', label: 'User ID' },
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
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
});

/* Component */
const checkModalConfirm = async () => {
    let responses: boolean[] = [];
    let languagePrefix = 'DELETE';
    const items = state.isRemoveOnlyWorkspace ? userPageGetters.selectedOnlyWorkspaceUsers : userPageGetters.selectedUsers;
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
// const fetchServiceList = async () => {
//     try {
//         const { results } = await SpaceConnector.clientV2.alertManager.service.list<ServiceListParameters, ListResponse<ServiceModel>>();
//         if (results) {
//             const filteredResults = results.filter((result) => result.members.USER !== undefined && result.members.USER_GROUP.length > 0);
//             filteredResults.forEach((d) => {
//                 userPageGetters.selectedUsers.filter((selectedUser) => d.members.USER.includes(selectedUser.user_id));
//             });
//         }
//     } catch (e) {
//         ErrorHandler.handleError(e, true);
//     }
// };
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
                :items="state.isRemoveOnlyWorkspace ? userPageGetters.selectedOnlyWorkspaceUsers : userPageGetters.selectedUsers"
            >
                <template #col-state-format="{value}">
                    <p-status v-bind="userStateFormatter(value)"
                              class="capitalize"
                    />
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
