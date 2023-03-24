<template>
    <cloud-service-detail-page :is-server-page="true" />
</template>

<script lang="ts">
import CloudServiceDetailPage
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/CloudServiceDetailPage.vue';

const PROVIDER = 'aws';
const CLOUD_SERVICE_NAME = 'Instance';
const CLOUD_SERVICE_GROUP = 'EC2';

export default {
    name: 'Server',
    components: {
        CloudServiceDetailPage,
    },
    setup() {
        return {
            PROVIDER,
            CLOUD_SERVICE_NAME,
            CLOUD_SERVICE_GROUP,
        };
    },
};
</script>
