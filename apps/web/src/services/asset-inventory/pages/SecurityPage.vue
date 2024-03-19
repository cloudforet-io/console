<script setup lang="ts">
import {
    computed, onUnmounted, reactive,
} from 'vue';

import CloudServiceDetailPage
    from '@/services/asset-inventory/pages/CloudServiceDetailPage.vue';
import { useSecurityPageStore } from '@/services/asset-inventory/stores/security-page-store';

const securityPageStore = useSecurityPageStore();
const securityPageGetters = securityPageStore.getters;

const storeState = reactive({
    selectedCloudServiceType: computed(() => securityPageGetters.selectedCloudServiceType),
});

onUnmounted(() => {
    securityPageStore.initState();
});
</script>

<template>
    <cloud-service-detail-page :is-security-page="true"
                               :provider="storeState.selectedCloudServiceType?.data.provider"
                               :group="storeState.selectedCloudServiceType?.data.group"
                               :name="storeState.selectedCloudServiceType?.name"
    />
</template>
