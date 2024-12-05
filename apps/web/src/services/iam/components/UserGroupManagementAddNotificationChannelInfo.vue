<script lang="ts" setup>
import { PFieldGroup, PI } from '@cloudforet/mirinae';

const NOFICATION_CHANNEL_LIST = [
    'Email', 'SMS', 'Telegram', 'Slack', 'MS Teams', 'Kakaotalk',
];

/* Component */
const handleNotificationChannel = (idx: number) => {
    const notificationChannelWrapperEl = document.querySelector(`.notification-channel-wrapper:nth-child(${idx + 1})`);
    notificationChannelWrapperEl.style.backgroundColor = '#F3F7FC';
    notificationChannelWrapperEl.style.borderColor = 'gray/200';
};
</script>

<template>
    <div class="user-group-notification-channel-info-wrapper">
        <p-field-group :label="$t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.NOTIFICATION_CHANNEL')">
            <template #default>
                <div class="notification-channel-list">
                    <button v-for="(notification_channel, idx) in NOFICATION_CHANNEL_LIST"
                            :key="`notification-channel-${idx}`"
                            class="notification-channel-wrapper"
                            :class="`channel-${idx}`"
                            @click="handleNotificationChannel(idx)"
                    >
                        <p-i name="ic_megaphone-filled" />
                        <span class="notification-channel">
                            {{ notification_channel }}
                        </span>
                    </button>
                </div>
            </template>
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
.user-group-notification-channel-info-wrapper {
    @apply flex flex-col bg-white border border-primary-3 rounded-md;
    padding: 0.75rem;
    .notification-channel-list {
        @apply grid grid-cols-6 gap-x-1;
        .notification-channel-wrapper {
            @apply flex flex-col items-center gap-1 border border-gray-200 rounded-md font-[#3C2C84] font-bold;
            padding: 0.75rem;
            font-size: 14px;
        }
        .notification-channel-wrapper:hover {
            @apply border border-blue-500 bg-blue-200;
        }
    }
}
</style>
