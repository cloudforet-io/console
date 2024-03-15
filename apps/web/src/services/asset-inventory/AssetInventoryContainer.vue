<script lang="ts" setup>
import {
    computed, onUnmounted, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { store } from '@/store';

import { MENU_ID } from '@/lib/menu/config';

import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import CloudServiceLSB from '@/services/asset-inventory/components/CloudServiceLSB.vue';
import SecurityLSB from '@/services/asset-inventory/components/SecurityLSB.vue';
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
    menuId: computed<string>(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        return closestRoute?.meta?.menuId;
    }),
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
                <cloud-service-l-s-b v-if="state.menuId === MENU_ID.CLOUD_SERVICE" />
                <security-l-s-b v-if="state.menuId === MENU_ID.SECURITY" />
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
