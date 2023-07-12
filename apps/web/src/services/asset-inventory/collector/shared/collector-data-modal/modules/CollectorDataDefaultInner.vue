<template>
    <div class="collector-data-default-inner">
        <span>{{ $t('INVENTORY.COLLECTOR.MAIN.COLLECT_DATA_MODAL.DESCRIPTION') }}</span>
        <div class="accounts-wrapper">
            <p-lazy-img :src="collectorDataModalStore.selectedCollector.plugin.icon"
                        width="1rem"
                        height="1rem"
                        class="plugin-icon"
            />
            <span>{{ collectorDataModalStore.selectedCollector.name }}</span>
            <span v-if="collectorDataModalState.secrets.length > 0">
                ({{ collectorDataModalState.secrets.length }})
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PLazyImg } from '@spaceone/design-system';

import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/collector/shared/collector-data-modal/collector-data-modal-store';


const collectorDataModalStore = useCollectorDataModalStore();
const collectorDataModalState = collectorDataModalStore.$state;
</script>

<style lang="postcss" scoped>
.collector-data-default-inner {
    .accounts-wrapper {
        @apply flex items-center bg-gray-100 text-paragraph-md;
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        gap: 0.5rem;
    }
}
</style>
