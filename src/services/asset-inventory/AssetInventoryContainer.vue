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
    defineComponent,
} from 'vue';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import { registerServiceStore } from '@/common/composables/register-service-store';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import AssetInventoryLNB from '@/services/asset-inventory/AssetInventoryLNB.vue';
import { assetInventoryStoreModule, assetInventoryStore } from '@/services/asset-inventory/store';
import type { AssetInventoryState } from '@/services/asset-inventory/store/type';

export default defineComponent({
    name: 'AssetInventoryContainer',
    components: {
        AssetInventoryLNB,
        GeneralPageLayout,
        VerticalPageLayout,
    },
    setup() {
        registerServiceStore<AssetInventoryState>('assetInventory', assetInventoryStoreModule, assetInventoryStore);
        const { breadcrumbs } = useBreadcrumbs();
        return {
            breadcrumbs,
        };
    },
});

</script>
