<script setup lang="ts">
import {
    PHeading, PPaneLayout,
} from '@spaceone/design-system';

import NotificationChannelList from '@/services/my-page/components/NotificationChannelList.vue';
</script>

<template>
    <section class="notification-wrapper">
        <p-heading :title="$t('MY_PAGE.NOTIFICATION.NOTIFICATION')" />
        <p-pane-layout>
            <notification-channel-list />
        </p-pane-layout>
    </section>
</template>
