<script setup lang="ts">
import { MENU_ID } from '@/lib/menu/config.js';

import { useCurrentMenuId } from '@/common/composables/current-menu-id';

import CloudServiceLSB from '@/services/asset-inventory/components/CloudServiceLSB.vue';
import MetricExplorerLSB from '@/services/asset-inventory/components/MetricExplorerLSB.vue';
import SecurityLSB from '@/services/asset-inventory/components/SecurityLSB.vue';

const { currentMenuId } = useCurrentMenuId();
interface Props {
  width: number;
}
const props = defineProps<Props>();
</script>

<template>
    <fragment>
        <cloud-service-l-s-b v-if="currentMenuId === MENU_ID.CLOUD_SERVICE" />
        <metric-explorer-l-s-b v-else-if="currentMenuId === MENU_ID.METRIC_EXPLORER"
                               :width="props.width"
        />
        <security-l-s-b v-else-if="currentMenuId === MENU_ID.SECURITY" />
    </fragment>
</template>
