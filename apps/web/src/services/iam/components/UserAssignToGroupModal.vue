<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { cloneDeep } from 'lodash';


import { PButtonModal } from '@cloudforet/mirinae';

import { useUserGroupApi } from '@/api-clients/identity/user-group/composables/use-user-group-api';
import type { MembersType } from '@/api-clients/identity/user-group/schema/type';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useUserListQuery } from '@/services/iam/composables/use-user-list-query';
import { useUserPageStore } from '@/services/iam/store/user-page-store';


const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;

const selectedUserIds = computed<string[]>(() => userPageState.selectedUserIds);
const { workspaceUserListData: selectedWorkspaceUsers } = useUserListQuery(selectedUserIds);

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive<{
    loading: boolean;
    excludedSelectedIds: string[];
    formattedMemberItems: Record<MembersType, string[]>;
}>({
    loading: false,
    excludedSelectedIds: [],
    formattedMemberItems: {},
});

const { userGroupAPI } = useUserGroupApi();
const queryClient = useQueryClient();
const { key: userGroupListQueryKey } = useServiceQueryKey('identity', 'user-group', 'list');
const { key: userListQueryKey } = useServiceQueryKey('identity', 'user', 'list');
const { mutateAsync: addUsers, isPending: addUsersLoading } = useMutation({
    mutationFn: userGroupAPI.addUsers,
    onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: userGroupListQueryKey });
        await queryClient.invalidateQueries({ queryKey: userListQueryKey });
        emit('confirm');
        showSuccessMessage('', i18n.t('IAM.USER.ASSIGN_TO_USER_GROUP.SUCCESS_MESSAGE'));
    },
    onError: (error) => {
        ErrorHandler.handleError(error);
    },
    onSettled: () => {
        handleClose();
    },
});

/* Component */
const handleConfirm = async () => {
    const mappedUserGroupIds = state.formattedMemberItems.USER_GROUP;
    const promises = mappedUserGroupIds.map(async (userGroupId) => {
        await addUsers({
            user_group_id: userGroupId,
            users: selectedWorkspaceUsers.value?.map((selectedUser) => selectedUser.user_id),
        });
    });
    await Promise.allSettled(promises);
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

/* Watcher */
watch([() => selectedWorkspaceUsers.value, () => userPageState.users], ([nv_selected_users, nv_user_list]) => {
    if (nv_selected_users?.length === 1 && nv_user_list.length > 0 && Object.keys(nv_selected_users[0]).includes('userGroup')) {
        state.excludedSelectedIds = nv_selected_users[0]?.user_group.map((userGroup) => userGroup.user_group_id);
    }
}, { deep: true, immediate: true });
</script>

<template>
    <p-button-modal :header-title="userPageState.modal.title"
                    :visible="userPageState.modal.visible === 'assignToUserGroup'"
                    size="md"
                    :loading="addUsersLoading"
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
