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
    ComponentRenderProxy, computed, defineComponent, getCurrentInstance,
} from '@vue/composition-api';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import { registerServiceStore } from '@/common/composables/register-service-store';
import { AssetInventoryState } from '@/services/asset-inventory/store/type';
import { assetInventoryStoreModule, assetInventoryStore } from '@/services/asset-inventory/store';
import AssetInventoryLNB from '@/services/asset-inventory/AssetInventoryLNB.vue';
import { useBreadcrumbs } from '@/common/composables/breadcrumbs';


export default defineComponent({
    name: 'AssetInventoryContainer',
    components: {
        AssetInventoryLNB,
        GeneralPageLayout,
        VerticalPageLayout,
    },
    setup() {
        registerServiceStore<AssetInventoryState>('assetInventory', assetInventoryStoreModule, assetInventoryStore);
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const { breadcrumbs } = useBreadcrumbs(computed(() => vm.$route));
        return {
            breadcrumbs,
        };
    },
});

</script>
