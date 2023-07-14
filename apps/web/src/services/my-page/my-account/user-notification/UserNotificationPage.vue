<script lang="ts" setup>
import {
    PHeading, PPaneLayout,
} from '@spaceone/design-system';
import { useI18n } from 'vue-i18n';

import NotificationChannelList from '@/services/notification/modules/NotificationChannelList.vue';

const { t } = useI18n();
</script>

<template>
    <section class="notification-wrapper">
        <p-heading :title="t('IDENTITY.USER.MAIN.NOTIFICATION')" />
        <p-pane-layout>
            <notification-channel-list />
        </p-pane-layout>
    </section>
</template>
