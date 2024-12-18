<script lang="ts" setup>
import { reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal } from '@cloudforet/mirinae';

import type { UserGroupChannelDeleteParameters } from '@/schema/alert-manager/user-group-channel/api-verbs/delete';
import type { UserGroupChannelModel } from '@/schema/alert-manager/user-group-channel/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    loading: false,
});

/* Component */
const handleConfirm = async () => {
    try {
        state.loading = true;
        await fetchDeleteNotificationChannel({
            channel_id: userGroupPageGetters.selectedUserGroupChannel[0].channel_id,
        });
        emit('confirm');
    } finally {
        state.loading = false;
        handleCancel();
    }
};

const handleCancel = () => {
    userGroupPageState.modal = {
        type: '',
        title: '',
        themeColor: 'primary',
    };
};

/* API */
const fetchDeleteNotificationChannel = async (params: UserGroupChannelDeleteParameters) => {
    try {
        await SpaceConnector.clientV2.alertManager.userGroupChannel.delete<UserGroupChannelDeleteParameters, UserGroupChannelModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};
</script>

<template>
    <p-button-modal size="sm"
                    :header-title="userGroupPageState.modal.title"
                    :loading="state.loading"
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
