<script lang="ts" setup>
import CloudServiceDetailPage
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/CloudServiceDetailPage.vue';

// const PROVIDER = 'aws';
// const CLOUD_SERVICE_NAME = 'Instance';
// const CLOUD_SERVICE_GROUP = 'EC2';

</script>

<template>
    <cloud-service-detail-page :is-server-page="true" />
</template>
