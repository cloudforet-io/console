<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import { MENU_ID } from '@/lib/menu/config.js';

import AssetAnalysisLSB from '@/services/asset-inventory/components/AssetAnalysisLSB.vue';
import CloudServiceLSB from '@/services/asset-inventory/components/CloudServiceLSB.vue';
import SecurityLSB from '@/services/asset-inventory/components/SecurityLSB.vue';

const route = useRoute();

const state = reactive({
    menuId: computed<string>(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        return closestRoute?.meta?.menuId;
    }),
});
</script>

<template>
    <fragment>
        <cloud-service-l-s-b v-if="state.menuId === MENU_ID.CLOUD_SERVICE" />
        <asset-analysis-l-s-b v-else-if="state.menuId === MENU_ID.ASSET_ANALYSIS" />
        <security-l-s-b v-else-if="state.menuId === MENU_ID.SECURITY" />
    </fragment>
</template>
