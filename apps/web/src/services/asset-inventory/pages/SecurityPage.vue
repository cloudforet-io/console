<script setup lang="ts">
import {
    computed, onBeforeMount, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { store } from '@/store';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import CloudServiceDetailPage
    from '@/services/asset-inventory/pages/CloudServiceDetailPage.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useSecurityPageStore } from '@/services/asset-inventory/stores/security-page-store';

const securityPageStore = useSecurityPageStore();
const securityPageState = securityPageStore.state;
const securityPageGetters = securityPageStore.getters;
const { getProperRouteLocation } = useProperRouteLocation();

const router = useRouter();
const route = useRoute();

const storeState = reactive({
    currentGrantInfo: computed(() => store.getters['user/getCurrentGrantInfo']),
    cloudServiceAnalyzeList: computed(() => securityPageGetters.cloudServiceAnalyzeList),
    cloudServiceTypeList: computed(() => securityPageGetters.cloudServiceTypeList),
});
const state = reactive({
    pageParams: computed(() => route.params),
});

const routeToFirstCloudServiceType = async () => {
    const selectedCloudServiceType = securityPageGetters.selectedCloudServiceType;
    await router.replace(getProperRouteLocation({
        name: ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME,
        params: {
            provider: selectedCloudServiceType?.provider || '',
            group: selectedCloudServiceType?.group || '',
            name: selectedCloudServiceType?.name || '',
        },
        query: route.query,
    })).catch(() => {});
};

watch(() => state.pageParams, (pageParams) => {
    if (pageParams.name) {
        securityPageStore.setSelectedCloudServiceType(pageParams.group, pageParams.name);
    }
});
onBeforeMount(async () => {
    try {
        securityPageState.loading = true;
        await securityPageStore.fetchCloudServiceAnalyze();
        if (storeState.cloudServiceAnalyzeList && storeState.cloudServiceAnalyzeList?.length > 0) {
            const promises = storeState.cloudServiceAnalyzeList.map((d) => securityPageStore.listCloudServiceTypeData(d.provider || '', d.cloud_service_group || ''));
            await Promise.all(promises);
        }
        await securityPageStore.setSelectedCloudServiceType();
        await routeToFirstCloudServiceType();
    } finally {
        securityPageState.loading = false;
    }
});

onUnmounted(() => {
    securityPageStore.initState();
});
</script>

<template>
    <cloud-service-detail-page :is-security-page="true"
                               :provider="securityPageGetters.selectedCloudServiceType?.provider"
                               :group="securityPageGetters.selectedCloudServiceType?.group"
                               :name="securityPageGetters.selectedCloudServiceType?.name"
    />
</template>
