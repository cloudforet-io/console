<script lang="ts" setup>
import { reactive } from 'vue';
import { useRoute } from 'vue-router';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import NotificationChannelList from '@/services/notification/modules/NotificationChannelList.vue';

const route = useRoute();

const state = reactive({
    projectId: route.params.id,
    hasManagePermission: useManagePermissionState(),
});

</script>

<template>
    <section>
        <notification-channel-list :project-id="state.projectId"
                                   :manage-disabled="!state.hasManagePermission"
        />
    </section>
</template>

