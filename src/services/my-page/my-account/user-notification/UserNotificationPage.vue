<template>
    <section class="notification-wrapper">
        <p-page-title :title="$t('IDENTITY.USER.MAIN.NOTIFICATION')" />
        <p-pane-layout>
            <notification-channel-list />
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import {
    PPageTitle, PPaneLayout,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import NotificationChannelList from '@/services/notification/modules/NotificationChannelList.vue';
import { store } from '@/store';

export default {
    name: 'UserNotificationPage',
    components: {
        NotificationChannelList,
        PPageTitle,
        PPaneLayout,
    },
    setup() {
        const state = reactive({
            isAdmin: computed(() => store.getters['user/isAdmin']).value,
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>
