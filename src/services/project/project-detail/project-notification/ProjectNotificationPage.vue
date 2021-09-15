<template>
    <section>
        <notification-channel-list :project-id="projectId" />
    </section>
</template>

<script lang="ts">
import NotificationChannelList from '@/services/notification/modules/NotificationChannelList.vue';
import { PROJECT_ROUTE } from '@/services/project/routes';
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
