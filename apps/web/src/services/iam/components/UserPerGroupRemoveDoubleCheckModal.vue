<script lang="ts" setup>
import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal } from '@cloudforet/mirinae';

import { useUserGroupApi } from '@/api-clients/identity/user-group/composables/use-user-group-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const emit = defineEmits<{(e: 'confirm'): void; }>();

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const { userGroupAPI } = useUserGroupApi();
const queryClient = useQueryClient();

const { key: userListQueryKey } = useServiceQueryKey('identity', 'workspace-user', 'list');
const { key: userGroupListQueryKey } = useServiceQueryKey('identity', 'user-group', 'list');
const { key: userGroupGetQueryKey } = useServiceQueryKey('identity', 'user-group', 'get');

const { mutateAsync: removeUsers, isPending: removeUsersIsPending } = useMutation({
    mutationFn: userGroupAPI.removeUsers,
    onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: userListQueryKey.value });
        await queryClient.invalidateQueries({ queryKey: userGroupListQueryKey.value });
        await queryClient.invalidateQueries({ queryKey: userGroupGetQueryKey.value });
        emit('confirm');
        showSuccessMessage(i18n.t('IAM.USER_GROUP.MODAL.REMOVE_USER.SHOW_SUCCESS_MESSAGE'), '');
    },
    onError: (error) => {
        ErrorHandler.handleError(error);
    },
    onSettled: () => {
        handleCancel();
        userGroupPageStore.setSelectedUserIdx([]);
    },
});

/* Component */
const handleConfirm = async () => {
    const users: (string | undefined)[] = [];
    userGroupPageState.users.selectedIndices.forEach((d: number) => {
        if (userGroupPageState.users.list) users.push(userGroupPageState.users.list[d]?.user_id);
    });
    await removeUsers({
        user_group_id: userGroupPageGetters.selectedUserGroups[0]?.user_group_id ?? '',
        users,
    });
};

const handleCancel = () => {
    userGroupPageStore.updateModalSettings({
        type: '',
        title: '',
        themeColor: 'primary',
    });
};
</script>

<template>
    <p-button-modal size="sm"
                    :header-title="userGroupPageState.modal.title"
                    :loading="removeUsersIsPending"
                    :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.REMOVE_USER"
                    :theme-color="userGroupPageState.modal.themeColor"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
    >
        <template #confirm-button>
            <span>{{ $t('IAM.USER_GROUP.TAB.USERS.REMOVE') }}</span>
        </template>
    </p-button-modal>
</template>
