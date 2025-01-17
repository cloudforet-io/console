<script lang="ts" setup>
import NotificationChannelList from '@/services/my-page/components/NotificationChannelList.vue';


interface Props {
    id?: string;
}
const props = defineProps<Props>();
</script>

<template>
    <section>
        <notification-channel-list
            :project-id="props.id"
        />
    </section>
</template>
