<script lang="ts" setup>
import { reactive } from 'vue';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import NotificationChannelList from '@/services/notification/modules/NotificationChannelList.vue';


interface Props {
    id?: string;
}
const props = defineProps<Props>();
const state = reactive({
    hasManagePermission: useManagePermissionState(),
});
</script>

<template>
    <section>
        <notification-channel-list :project-id="props.id"
                                   :manage-disabled="!state.hasManagePermission"
        />
    </section>
</template>
