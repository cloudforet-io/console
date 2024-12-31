<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';

import { cloneDeep } from 'lodash';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { UserGroupAddUsersParameters } from '@/schema/identity/user-group/api-verbs/add-users';
import type { UserGroupModel } from '@/schema/identity/user-group/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { SelectedUserDropdownIdsType } from '@/common/modules/user/typte';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useUserPageStore } from '@/services/iam/store/user-page-store';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userPageGetters = userPageStore.getters;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const selectedUserGroupIds = ref<SelectedUserDropdownIdsType>([]);

const state = reactive({
    loading: false,
});

/* Component */
const handleConfirm = async () => {
    try {
        state.loading = true;
        const mappedUserGroupIds = selectedUserGroupIds.value.map((selectedUserGroupId) => selectedUserGroupId.value);
        const promises = mappedUserGroupIds.map(async (userGroupId) => {
            await fetchAssignToUserGroup({
                user_group_id: userGroupId,
                users: userPageGetters.selectedUsers.map((selectedUser) => selectedUser.user_id),
            });
        });
        await Promise.all(promises);
        emit('confirm');
    } finally {
        state.loading = false;
        handleClose();
    }
};

const handleClose = () => {
    selectedUserGroupIds.value = [];
    userPageStore.$patch((_state) => {
        _state.state.modal.visible = undefined;
        _state.state.modal = cloneDeep(_state.state.modal);
    });
};

/* API */
const fetchAssignToUserGroup = async (params: UserGroupAddUsersParameters) => {
    try {
        return await SpaceConnector.clientV2.identity.userGroup.addUsers<UserGroupAddUsersParameters, UserGroupModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e, true);
        return {};
    }
};

/* Watcher */
watch([() => userPageGetters.selectedUsers, () => userPageState.users], ([nv_selected_users, nv_user_list]) => {
    if (nv_selected_users.length === 1 && nv_user_list.length > 0) {
        selectedUserGroupIds.value = nv_selected_users[0]?.user_group.map((userGroup) => ({
            type: 'USER_GROUP',
            value: userGroup.user_group_id,
            label: userGroup.name,
        }));
    }
}, { deep: true, immediate: true });
</script>

<template>
    <p-button-modal :header-title="userPageState.modal.title"
                    :visible="userPageState.modal.visible === 'assignToUserGroup'"
                    size="md"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="flex flex-col gap-1">
                <span class="mb-2 text-gray-900 font-bold">
                    {{ $t('IAM.USER.ASSIGN_TO_USER_GROUP') }}
                </span>
                <user-select-dropdown class="mb-48"
                                      :show-user-list="false"
                                      show-user-group-list
                                      appearance-type="stack"
                                      selection-type="multiple"
                                      :selected-ids.sync="selectedUserGroupIds"
                                      placeholder="select"
                />
            </div>
        </template>
    </p-button-modal>
</template>
