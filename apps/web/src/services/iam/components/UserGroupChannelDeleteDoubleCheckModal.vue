<script lang="ts" setup>
import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal } from '@cloudforet/mirinae';

import { useUserGroupChannelApi } from '@/api-clients/alert-manager/user-group-channel/composables/use-user-group-channel-api';
import type { UserGroupChannelDeleteParameters } from '@/api-clients/alert-manager/user-group-channel/schema/api-verbs/delete';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const queryClient = useQueryClient();
const { userGroupChannelAPI } = useUserGroupChannelApi();
const { key: userGroupChannelListQueryKey } = useServiceQueryKey('alert-manager', 'user-group-channel', 'list');

const emit = defineEmits<{(e: 'confirm'): void; }>();

const { mutate: userGroupChannelDeleteMutate, isPending: userGroupChannelDeletePending } = useMutation({
    mutationFn: (params: UserGroupChannelDeleteParameters) => userGroupChannelAPI.delete(params),
    onSuccess: () => {
        emit('confirm');
        showSuccessMessage('', i18n.t('IAM.USER_GROUP.MODAL.DELETE.SHOW_SUCCESS_MESSAGE'));
        userGroupPageState.userGroupChannels.selectedIndices = [];
        queryClient.invalidateQueries({ queryKey: userGroupChannelListQueryKey.value });
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
    onSettled: () => {
        handleCancel();
    },
});

/* Component */
const handleConfirm = () => {
    if (!userGroupPageGetters.selectedUserGroupChannel?.[0]?.channel_id) {
        return;
    }
    userGroupChannelDeleteMutate({
        channel_id: userGroupPageGetters.selectedUserGroupChannel[0].channel_id,
    });
};

const handleCancel = () => {
    userGroupPageState.modal = {
        type: '',
        title: '',
        themeColor: 'primary',
    };
};
</script>

<template>
    <p-button-modal size="sm"
                    :header-title="userGroupPageState.modal.title"
                    :loading="userGroupChannelDeletePending"
                    :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.DELETE_NOTIFICATION_CHANNEL"
                    :theme-color="userGroupPageState.modal.themeColor"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
    >
        <template #confirm-button>
            {{ $t('IAM.USER_GROUP.MODAL.DELETE_CHANNEL.DELETE') }}
        </template>
    </p-button-modal>
</template>
