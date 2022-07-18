<template>
    <section>
        <notification-channel-list :project-id="projectId" :manage-disabled="!hasManagePermission" />
    </section>
</template>

<script lang="ts">
import type { ComponentRenderProxy } from '@vue/composition-api';
import { getCurrentInstance, reactive, toRefs } from '@vue/composition-api';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

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
        const vm = getCurrentInstance()?.proxy as ComponentRenderProxy;
        const state = reactive({
            projectId: vm.$route.params.id,
            hasManagePermission: useManagePermissionState(),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
