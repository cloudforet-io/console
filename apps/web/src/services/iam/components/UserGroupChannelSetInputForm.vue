<script lang="ts" setup>
import {
    PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import ChannelUserSelect from '@/common/components/channel-user-select/ChannelUserSelect.vue';

interface UserModeInfo {
  userMode: MenuItem;
  users: MenuItem[]
}

const emit = defineEmits<{(e: 'update-user', value:UserModeInfo): void}>();

const handleUpdateUser = (value: UserModeInfo) => {
    emit('update-user', value);
};
</script>

<template>
    <div class="flex flex-col gap-6 bg-white">
        <p-field-group :label="$t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.CHANNEL_NAME')"
                       required
        >
            <p-text-input block />
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
