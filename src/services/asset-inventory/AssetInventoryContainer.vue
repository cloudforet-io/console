<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lnbVisible">
            <template #sidebar>
                <asset-inventory-l-n-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <general-page-layout v-else>
            <router-view />
        </general-page-layout>
    </fragment>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from '@vue/composition-api';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import { registerServiceStore } from '@/common/composables/register-service-store';
import { AssetInventoryState } from '@/services/asset-inventory/store/type';
import assetInventoryStore from '@/services/asset-inventory/store';
import AssetInventoryLNB from '@/services/asset-inventory/AssetInventoryLNB.vue';


export default defineComponent({
    name: 'AssetInventoryContainer',
    components: {
        AssetInventoryLNB,
        GeneralPageLayout,
        VerticalPageLayout,
    },
    setup() {
        registerServiceStore<AssetInventoryState>('assetInventory', assetInventoryStore);
        const state = reactive({});
        return {
            ...toRefs(state),
        };
    },
});

</script>
