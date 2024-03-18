<script lang="ts" setup>
import {
    computed, onUnmounted, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { store } from '@/store';

import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import AssetInventoryLSB from '@/services/asset-inventory/AssetInventoryLSB.vue';
import { useAssetInventorySettingsStore } from '@/services/asset-inventory/stores/asset-inventory-settings-store';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/stores/cloud-service-detail-page-store';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';

const cloudServicePageStore = useCloudServicePageStore();
const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
const assetInventorySettings = useAssetInventorySettingsStore();

const route = useRoute();

const storeState = reactive({
    userId: computed<string>(() => store.state.user.userId),
});
const state = reactive({
    lsbVisible: computed<boolean>(() => route.meta?.lsbVisible),
});
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

onUnmounted(() => {
    cloudServicePageStore.$dispose();
    cloudServicePageStore.$reset();
    cloudServiceDetailPageStore.$dispose();
    cloudServiceDetailPageStore.$reset();
});
</script>

<template>
    <fragment>
        <vertical-page-layout v-if="state.lsbVisible">
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
