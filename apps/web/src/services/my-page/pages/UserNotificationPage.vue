<script setup lang="ts">
import {
    PHeading, PPaneLayout,
} from '@cloudforet/mirinae';

import NotificationChannelList from '@/services/my-page/components/NotificationChannelList.vue';
</script>

<template>
    <section class="notification-wrapper">
        <p-heading class="mb-6"
                   :title="$t('MY_PAGE.NOTIFICATION.NOTIFICATION')"
        />
        <p-pane-layout>
            <notification-channel-list />
        </p-pane-layout>
    </section>
</template>
