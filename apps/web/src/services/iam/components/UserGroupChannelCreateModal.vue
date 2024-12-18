<script lang="ts" setup>
import { ref } from 'vue';

import { PButtonModal } from '@cloudforet/mirinae';

import SelectChannelCard from '@/services/iam/components/SelectChannelCard.vue';
import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

const isContinuePossible = ref<boolean>(false);

/* Component */
const handleConfirm = () => {
//   TODO: store
    userGroupPageState.modal = {
        type: USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_SECOND,
        title: userGroupPageState.modal.title,
        themeColor: 'primary',
    };
};

const handleCancel = () => {
    userGroupPageState.modal = {
        type: '',
        title: '',
        themeColor: 'primary',
    };
};

const handleSelectedChannel = (value: string) => {
    if (value) {
        isContinuePossible.value = true;
    }
};
</script>

<template>
    <!--  TODO: update language pack with babel edit -->
    <p-button-modal size="md"
                    :header-title="userGroupPageState.modal.title"
                    :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_FIRST"
                    :theme-color="userGroupPageState.modal.themeColor"
                    :disabled="!isContinuePossible"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
    >
        <template #body>
            <div class="flex flex-col gap-1 mb-8">
                <p class="text-xs">
                    <span>Step 1</span>
                    <span class="text-gray-500">/2</span>
                </p>
                <span class="text-gray-700 leading-4 text-sm">Configure teh notifications to ensure you are promptly informed of any alerts or incidents as they occur.</span>
            </div>
            <select-channel-card @select-channel="handleSelectedChannel" />
        </template>
        <template #confirm-button>
            <span>{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.CONTINUE') }}</span>
        </template>
    </p-button-modal>
</template>
