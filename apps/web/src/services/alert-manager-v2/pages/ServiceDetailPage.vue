<script setup lang="ts">
import { defineProps } from 'vue';

import ServiceDetailHeader from '@/services/alert-manager-v2/components/ServiceDetailHeader.vue';
import ServiceDetailTabs from '@/services/alert-manager-v2/components/ServiceDetailTabs.vue';

interface Props {
    serviceId: string;
}
const props = withDefaults(defineProps<Props>(), {
    serviceId: '',
});

</script>

<template>
    <div class="service-detail-page">
        <service-detail-header :service-id="props.serviceId" />
        <service-detail-tabs />
    </div>
</template>
