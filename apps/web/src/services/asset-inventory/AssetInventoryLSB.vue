<script setup lang="ts">
import { computed, reactive } from 'vue';

import { MENU_ID } from '@/lib/menu/config.js';

import { useCurrentMenuId } from '@/common/composables/current-menu-id';

import CloudServiceLSB from '@/services/asset-inventory/components/CloudServiceLSB.vue';
import MetricExplorerLSB from '@/services/asset-inventory/components/MetricExplorerLSB.vue';
import SecurityLSB from '@/services/asset-inventory/components/SecurityLSB.vue';

const state = reactive({
    menuId: computed<string>(() => useCurrentMenuId()),
});
</script>

<template>
    <fragment>
        <cloud-service-l-s-b v-if="state.menuId === MENU_ID.CLOUD_SERVICE" />
        <metric-explorer-l-s-b v-else-if="state.menuId === MENU_ID.METRIC_EXPLORER" />
        <security-l-s-b v-else-if="state.menuId === MENU_ID.SECURITY" />
    </fragment>
</template>
