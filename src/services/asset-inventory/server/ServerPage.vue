<template>
    <cloud-service-detail-page :group="CLOUD_SERVICE_GROUP"
                               provider="aws"
                               name="Instance"
                               :is-server-page="true"
    />
</template>

<script lang="ts">
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

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
            hasManagePermission: useManagePermissionState(),
            PROVIDER,
            CLOUD_SERVICE_NAME,
            CLOUD_SERVICE_GROUP,
        };
    },
};
</script>
