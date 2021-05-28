<template>
    <section>
        <notification-list :hide-project-only-channel="hideProjectOnlyChannel" />
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
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            hideProjectOnlyChannel: true,
        });

        (async () => {
            if (vm.$route.name === PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS) state.hideProjectOnlyChannel = false;
        })();
        return {
            ...toRefs(state),
        };
    },
};
</script>
