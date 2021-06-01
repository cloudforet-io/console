<template>
    <section>
        <notification-list :project-id="projectId" />
    </section>
</template>

<script lang="ts">
import NotificationList from '@/views/identity/user/modules/NotificationList.vue';
import { PROJECT_ROUTE } from '@/routes/project/project-route';
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

export default {
    name: 'ProjectNotificationsPage',
    components: {
        NotificationList,
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
