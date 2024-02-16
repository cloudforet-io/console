<template>
    <fragment>
        <centered-page-layout v-if="$route.meta.centeredLayout"
                              has-nav-bar
        >
            <router-view />
        </centered-page-layout>
        <general-page-layout v-else>
            <router-view />
        </general-page-layout>
    </fragment>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, onUnmounted,
} from 'vue';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { store } from '@/store';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import { useAssetInventorySettingsStore } from '@/services/asset-inventory/stores/asset-inventory-settings-store';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/stores/cloud-service-detail-page-store';
import { useCloudServicePageStore } from '@/services/asset-inventory/stores/cloud-service-page-store';


export default defineComponent({
    name: 'AssetInventoryContainer',
    components: {
        GeneralPageLayout,
        CenteredPageLayout,
    },
    setup() {
        const cloudServicePageStore = useCloudServicePageStore();
        const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();

        const { breadcrumbs } = useBreadcrumbs();
        const userId = computed(() => store.state.user.userId);
        const assetInventorySettings = useAssetInventorySettingsStore();
        assetInventorySettings.initState();
        assetInventorySettings.$onAction((action) => {
            action.after(() => {
                if (window) {
                    const settings = LocalStorageAccessor.getItem(userId.value) ?? {};
                    settings.assetInventory = action.store.$state;
                    LocalStorageAccessor.setItem(userId.value, settings);
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
