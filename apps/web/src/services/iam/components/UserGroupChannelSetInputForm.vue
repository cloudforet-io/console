<script lang="ts" setup>
import { reactive, watch } from 'vue';

import {
    PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import ChannelUserSelect from '@/common/components/channel-user-select/ChannelUserSelect.vue';

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

const emit = defineEmits<{(e: 'update-user', value: ChannelInfo & UserModeInfo): void}>();

const state = reactive<ChannelInfo & UserModeInfo>({
    channelName: notificationChannelCreateFormState.channelName,
    userMode: {},
    users: [],
});

/* Component */
const handleUpdateUser = (value: UserModeInfo) => {
    state.userMode = value.userMode;
    state.users = value.users;
};

const handleChangeChannelName = (value: string) => {
    state.channelName = value;
};

/* Watcher */
watch(() => state, (nv_state) => {
    emit('update-user', {
        channelName: nv_state.channelName,
        userMode: nv_state.userMode,
        users: nv_state.users,
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
        <!--        TODO: channel token & Protocol input (possible to update later) -->
        <p-field-group label="Channel Token"
                       required
        >
            <p-text-input placeholder="xoxb-123456789012-0987654321098-ABCDEFG"
                          block
            />
        </p-field-group>
        <p-field-group label="Channel Protocol"
                       required
        >
            <p-text-input placeholder="xoxb-123456789012-0987654321098-ABCDEFG"
                          block
            />
        </p-field-group>
        <channel-user-select @update-user="handleUpdateUser" />
    </div>
</template>
