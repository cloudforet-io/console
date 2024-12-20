<script setup lang="ts">
import { defineProps, onMounted, onUnmounted } from 'vue';

import ServiceDetailHeader from '@/services/alert-manager-v2/components/ServiceDetailHeader.vue';
import ServiceDetailTabs from '@/services/alert-manager-v2/components/ServiceDetailTabs.vue';
import { useServiceDetailPageStore } from '@/services/alert-manager-v2/stores/service-detail-page-store';

interface Props {
    serviceId: string;
}
const props = withDefaults(defineProps<Props>(), {
    serviceId: '',
});

const serviceDetailPageStore = useServiceDetailPageStore();

onMounted(() => {
    serviceDetailPageStore.fetchServiceDetailData(props.serviceId);
    serviceDetailPageStore.fetchNotificationProtocolList();
});

onUnmounted(() => {
    serviceDetailPageStore.initState();
});
</script>

<template>
    <div class="service-detail-page">
        <service-detail-header :service-id="props.serviceId" />
        <service-detail-tabs />
    </div>
</template>
