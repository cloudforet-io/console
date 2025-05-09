<script lang="ts" setup>
import { reactive, watch } from 'vue';

import { cloneDeep } from 'lodash';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { UserGroupAddUsersParameters } from '@/api-clients/identity/user-group/schema/api-verbs/add-users';
import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';
import type { MembersType } from '@/api-clients/identity/user-group/schema/type';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useUserPageStore } from '@/services/iam/store/user-page-store';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userPageGetters = userPageStore.getters;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    loading: false,
    excludedSelectedIds: [],
    formattedMemberItems: {} as Record<MembersType, string[]>,
});

/* Component */
const handleConfirm = async () => {
    try {
        state.loading = true;
        const mappedUserGroupIds = state.formattedMemberItems.USER_GROUP;
        const promises = mappedUserGroupIds.map(async (userGroupId) => {
            await fetchAssignToUserGroup({
                user_group_id: userGroupId,
                users: userPageGetters.selectedUsers.map((selectedUser) => selectedUser.user_id),
            });
        });
        await Promise.all(promises);
        emit('confirm');
        showSuccessMessage('', i18n.t('IAM.USER.ASSIGN_TO_USER_GROUP.SUCCESS_MESSAGE'));
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

const handleFormattedSelectedIds = (value: Record<MembersType, string[]>) => {
    state.formattedMemberItems = value;
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
    if (nv_selected_users.length === 1 && nv_user_list.length > 0 && Object.keys(nv_selected_users[0]).includes('userGroup')) {
        state.excludedSelectedIds = nv_selected_users[0]?.user_group.map((userGroup) => userGroup.user_group_id);
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
            <div class="modal-contents">
                <span class="mb-2 text-gray-900 font-bold">
                    {{ $t('IAM.USER.ASSIGN_TO_USER_GROUP.TITLE') }}
                </span>
                <user-select-dropdown :show-user-list="false"
                                      show-user-group-list
                                      :show-category-title="false"
                                      appearance-type="stack"
                                      selection-type="multiple"
                                      use-fixed-menu-style
                                      excluded-hidden-ids
                                      :excluded-selected-ids="state.excludedSelectedIds"
                                      @formatted-selected-ids="handleFormattedSelectedIds"
                />
            </div>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.modal-contents {
    @apply flex flex-col gap-1;
    height: 22rem;
    overflow: auto;
}
:deep(.dropdown-context-menu) {
    left: unset !important;
}
</style>
