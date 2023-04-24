<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lnbVisible"
                              :breadcrumbs="breadcrumbs"
        >
            <template #sidebar>
                <asset-inventory-l-n-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <general-page-layout v-else
                             :breadcrumbs="breadcrumbs"
        >
            <router-view />
        </general-page-layout>
    </fragment>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, onUnmounted,
} from 'vue';

import { store } from '@/store';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import AssetInventoryLNB from '@/services/asset-inventory/AssetInventoryLNB.vue';
import { useAssetInventorySettingsStore } from '@/services/asset-inventory/store/asset-inventory-settings-store';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/store/cloud-service-detail-page-store';
import { useCloudServicePageStore } from '@/services/asset-inventory/store/cloud-service-page-store';


export default defineComponent({
    name: 'AssetInventoryContainer',
    components: {
        AssetInventoryLNB,
        GeneralPageLayout,
        VerticalPageLayout,
    },
    setup() {
        const cloudServicePageStore = useCloudServicePageStore();
        const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();

        const { breadcrumbs } = useBreadcrumbs();
        const userId = computed(() => store.state.user.userId);
        const assetInventorySettings = useAssetInventorySettingsStore();
        assetInventorySettings.$onAction((action) => {
            action.after(() => {
                if (window) {
                    const settings = window.localStorage.getItem(userId.value);
                    if (settings) {
                        const settingsObj = JSON.parse(settings);
                        settingsObj.assetInventory = action.store.$state;
                        window.localStorage.setItem(userId.value, JSON.stringify(settingsObj));
                    }
                }
            });
        });

        onUnmounted(() => {
            cloudServicePageStore.$dispose();
            cloudServicePageStore.$reset();
            cloudServiceDetailPageStore.$dispose();
            cloudServiceDetailPageStore.$reset();
        });
        return {
            breadcrumbs,
        };
    },
});

</script>
