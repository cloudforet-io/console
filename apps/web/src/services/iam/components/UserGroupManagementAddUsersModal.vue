<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { UserGroupAddUsersParameters } from '@/schema/identity/user-group/api-verbs/add-users';
import type { UserGroupModel } from '@/schema/identity/user-group/model';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { SelectedUserDropdownIdsType } from '@/common/modules/user/typte';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const emit = defineEmits<{(e: 'confirm'): void; }>();

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const selectedUserIds = ref<SelectedUserDropdownIdsType[]>([]);

const state = reactive({
    loading: false,
    selectedUserIds: undefined,
});

/* Watcher */
watch(() => userGroupPageGetters.selectedUserGroups[0].users, (nv_user_list) => {
    if (nv_user_list && nv_user_list.length > 0) {
        selectedUserIds.value = nv_user_list.map((user) => ({
            type: 'USER',
            value: user,
        }));
    }
}, { deep: true, immediate: true });

/* Component */
const handleConfirm = async () => {
    state.loading = true;
    try {
        await fetchAddUsers({
            user_group_id: userGroupPageGetters.selectedUserGroups[0].user_group_id,
            users: selectedUserIds.value.map((user) => user.value),
        });
        emit('confirm');
        showSuccessMessage('');
    } finally {
        state.loading = false;
        handleClose();
    }
};

const handleClose = () => {
    userGroupPageState.modal.type = '';
};

/* API */
const fetchAddUsers = async (params: UserGroupAddUsersParameters) => {
    try {
        await SpaceConnector.clientV2.identity.userGroup.addUsers<UserGroupAddUsersParameters, UserGroupModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
</script>

<template>
    <p-button-modal class="user-group-management-add-users-modal"
                    :header-title="userGroupPageState.modal.title"
                    :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.ADD_NEW_USER"
                    size="md"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="modal-contents">
                <p>{{ $t('IAM.USER_GROUP.MODAL.ADD_NEW_USER.USER') }}</p>
                <user-select-dropdown class="mb-48"
                                      show-user-list
                                      :show-user-group-list="false"
                                      appearance-type="stack"
                                      selection-type="multiple"
                                      :selected-ids.sync="selectedUserIds"
                                      placeholder="select"
                />
            </div>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.user-group-management-add-users-modal {
    min-height: 34.875rem;
    .modal-contents {
        @apply flex flex-col bg-primary-4 rounded-md;
        margin-bottom: 9rem;
        padding: 1rem;
        gap: 1rem;
    }
}
</style>
