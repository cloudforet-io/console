<script lang="ts" setup>
import {
    computed, onMounted, onUnmounted, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { store } from '@/store';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import AssetInventoryLSB from '@/services/asset-inventory/AssetInventoryLSB.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useAssetInventorySettingsStore } from '@/services/asset-inventory/stores/asset-inventory-settings-store';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/stores/cloud-service-detail-page-store';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';
import { useSecurityPageStore } from '@/services/asset-inventory/stores/security-page-store';
import type { CloudServiceDetailPageParams } from '@/services/asset-inventory/types/cloud-service-detail-page-type';

const securityPageStore = useSecurityPageStore();
const securityPageGetters = securityPageStore.getters;
const cloudServicePageStore = useCloudServicePageStore();
const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
const assetInventorySettings = useAssetInventorySettingsStore();

const route = useRoute();

const storeState = reactive({
    userId: computed<string>(() => store.state.user.userId),
    loading: computed(() => securityPageGetters.loading),
    cloudServiceTypeList: computed(() => securityPageGetters.cloudServiceTypeList),
});
const state = reactive({
    isNoData: computed(() => route.name === ASSET_INVENTORY_ROUTE.SECURITY._NAME && storeState.cloudServiceTypeList.length === 0 && !securityPageGetters.loading),
    lsbVisible: computed<boolean>(() => route.meta?.lsbVisible),
    pageParams: computed<CloudServiceDetailPageParams|undefined>(() => route.params as unknown as CloudServiceDetailPageParams),
});

const initData = async () => {
    await securityPageStore.fetchCloudServiceAnalyze();
    if (state.pageParams?.name) {
        await securityPageStore.setSelectedCloudServiceType(state.pageParams.group, state.pageParams.name);
    } else {
        await securityPageStore.setSelectedCloudServiceType();
    }
};

const { callApiWithGrantGuard } = useGrantScopeGuard(['DOMAIN', 'WORKSPACE'], initData);

assetInventorySettings.initState();
assetInventorySettings.$onAction((action) => {
    action.after(() => {
        if (window) {
            const settings = LocalStorageAccessor.getItem(storeState.userId) ?? {};
            settings.assetInventory = action.store.$state;
            LocalStorageAccessor.setItem(storeState.userId, settings);
        }
    });
});

onMounted(async () => {
    await callApiWithGrantGuard();
});

onUnmounted(() => {
    cloudServicePageStore.$dispose();
    cloudServicePageStore.$reset();
    cloudServiceDetailPageStore.$dispose();
    cloudServiceDetailPageStore.$reset();
    securityPageStore.initState();
});
</script>

<template>
    <fragment>
        <vertical-page-layout v-if="state.lsbVisible && !state.isNoData">
            <template #sidebar>
                <asset-inventory-l-s-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <centered-page-layout v-if="route.meta.centeredLayout"
                              has-nav-bar
        >
            <router-view />
        </centered-page-layout>
        <general-page-layout v-else>
            <router-view />
        </general-page-layout>
    </fragment>
</template>
