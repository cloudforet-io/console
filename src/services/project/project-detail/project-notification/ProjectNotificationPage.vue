<template>
    <section>
        <notification-channel-list :project-id="projectId" :disabled="!hasManagePermission" />
    </section>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import { store } from '@/store';

import NotificationChannelList from '@/services/notification/modules/NotificationChannelList.vue';


export default {
    name: 'ProjectNotificationsPage',
    components: {
        NotificationChannelList,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            projectId: vm.$route.params.id,
            hasManagePermission: computed<boolean>(() => store.getters['user/hasManagePermission']),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
