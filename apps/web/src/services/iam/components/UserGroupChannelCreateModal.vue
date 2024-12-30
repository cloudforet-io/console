<script lang="ts" setup>
import {
    ref, watch,
} from 'vue';

import { PButtonModal } from '@cloudforet/mirinae';

import SelectChannelCard from '@/services/iam/components/SelectChannelCard.vue';
import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';


const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();
const notificationChannelCreateFormState = notificationChannelCreateFormStore.state;

const isContinuePossible = ref<boolean>(false);

/* Component */
const handleConfirm = async () => {
    userGroupPageState.modal = {
        type: USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_SECOND,
        title: userGroupPageState.modal.title,
        themeColor: 'primary',
    };
};

const handleCancel = () => {
    notificationChannelCreateFormStore.initState();
    userGroupPageState.modal = {
        type: '',
        title: '',
        themeColor: 'primary',
    };
};

/* Watcher */
watch(() => notificationChannelCreateFormState.selectedProtocol, (nv_protocol) => {
    isContinuePossible.value = !!nv_protocol.protocol_id;
}, { deep: true, immediate: true });
</script>

<template>
    <p-button-modal size="md"
                    :header-title="userGroupPageState.modal.title"
                    :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_FIRST"
                    :theme-color="userGroupPageState.modal.themeColor"
                    :disabled="!isContinuePossible"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
                    @close="handleCancel"
    >
        <template #body>
            <div class="flex flex-col gap-1 mb-8">
                <p class="text-xs">
                    <span>Step 1</span>
                    <span class="text-gray-500">/2</span>
                </p>
                <span class="text-gray-700 leading-4 text-sm">Configure teh notifications to ensure you are promptly informed of any alerts or incidents as they occur.</span>
            </div>
            <select-channel-card />
        </template>
        <template #confirm-button>
            <span>{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.CONTINUE') }}</span>
        </template>
    </p-button-modal>
</template>
