<template>
    <section>
        <notification-channel-list :project-id="projectId" />
    </section>
</template>

<script lang="ts">
import NotificationChannelList from '@/views/identity/user/modules/notification/NotificationChannelList.vue';
import { PROJECT_ROUTE } from '@/routes/project/project-route';
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

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
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            projectId: vm.$route.params.id,
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
