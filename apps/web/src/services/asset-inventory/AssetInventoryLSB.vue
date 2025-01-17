<script setup lang="ts">
import { MENU_ID } from '@/lib/menu/config.js';

import { useCurrentMenuId } from '@/common/composables/current-menu-id';

import CloudServiceLSB from '@/services/asset-inventory/components/CloudServiceLSB.vue';
import MetricExplorerLSB from '@/services/asset-inventory/components/MetricExplorerLSB.vue';

const { currentMenuId } = useCurrentMenuId();
</script>

<template>
    <fragment>
        <cloud-service-l-s-b v-if="currentMenuId === MENU_ID.CLOUD_SERVICE" />
        <metric-explorer-l-s-b v-else-if="currentMenuId === MENU_ID.METRIC_EXPLORER" />
    </fragment>
</template>
