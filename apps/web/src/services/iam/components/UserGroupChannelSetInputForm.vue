<script lang="ts" setup>
import { reactive, watch } from 'vue';

import {
    PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';



import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();
const notificationChannelCreateFormState = notificationChannelCreateFormStore.state;

interface ChannelInfo {
  channelName: string;
}

interface UserModeInfo {
  userMode: MenuItem;
  users: MenuItem[]
}

const state = reactive<ChannelInfo & UserModeInfo>({
    channelName: notificationChannelCreateFormState.channelName,
    userMode: {},
    users: [],
});

/* Component */
const handleChangeChannelName = (value: string) => {
    state.channelName = value;
};

/* Watcher */
watch(() => state, (nv_state) => {
    notificationChannelCreateFormStore.$patch((_state) => {
        _state.state.channelName = nv_state.channelName;
        // _state.state.userInfo.type = nv_state.userMode
    });
}, { immediate: true, deep: true });
</script>

<template>
    <div class="flex flex-col gap-6 bg-white">
        <p-field-group :label="$t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.CHANNEL_NAME')"
                       required
        >
            <p-text-input block
                          :value="state.channelName"
                          @update:value="handleChangeChannelName"
            />
        </p-field-group>
        <user-group-channel-add-form-data />
    </div>
</template>
