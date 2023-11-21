<template>
    <section class="notification-wrapper">
        <p-heading :title="$t('IDENTITY.USER.MAIN.NOTIFICATION')" />
        <p-pane-layout>
            <notification-channel-list />
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from 'vue';

import {
    PHeading, PPaneLayout,
} from '@spaceone/design-system';

import NotificationChannelList from '@/services/notification/modules/NotificationChannelList.vue';

export default {
    name: 'UserNotificationPage',
    components: {
        NotificationChannelList,
        PHeading,
        PPaneLayout,
    },
    setup() {
        const state = reactive({
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>
